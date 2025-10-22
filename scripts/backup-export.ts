import { adminClient } from '../lib/supabase/admin'
import { writeFileSync } from 'fs'
import { createCipheriv, randomBytes } from 'crypto'

async function backupDatabase() {
  const timestamp = new Date().toISOString().split('T')[0]
  
  const tables = ['accounts', 'mastery_states', 'attempts', 'study_sessions', 'user_badges', 'skills', 'lessons', 'items']
  const backup: Record<string, any[]> = {}

  for (const table of tables) {
    console.log(`Backing up ${table}...`)
    const { data, error } = await adminClient.from(table).select('*')
    if (error) throw error
    backup[table] = data || []
  }

  const json = JSON.stringify(backup, null, 2)
  
  // Encrypt with password from env (MVP: simple AES-256-GCM)
  const password = process.env.BACKUP_PASSWORD || 'CHANGE_ME_IN_PROD'
  const key = Buffer.from(password.padEnd(32, '0').slice(0, 32))
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  
  let encrypted = cipher.update(json, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag().toString('hex')
  
  const output = { iv: iv.toString('hex'), authTag, data: encrypted }
  writeFileSync(`backup-${timestamp}.json.enc`, JSON.stringify(output))
  
  console.log(`✅ Backup saved: backup-${timestamp}.json.enc`)
  console.log(`Total records: ${Object.values(backup).reduce((sum, arr) => sum + arr.length, 0)}`)
}

backupDatabase().catch(console.error)
