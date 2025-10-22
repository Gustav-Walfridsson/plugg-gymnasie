import { adminClient } from '../lib/supabase/admin'
import { readFileSync } from 'fs'
import { createDecipheriv } from 'crypto'

async function restoreBackup(filename: string) {
  const encrypted = JSON.parse(readFileSync(filename, 'utf8'))
  const password = process.env.BACKUP_PASSWORD || 'CHANGE_ME_IN_PROD'
  const key = Buffer.from(password.padEnd(32, '0').slice(0, 32))
  
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(encrypted.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'))
  
  let json = decipher.update(encrypted.data, 'hex', 'utf8')
  json += decipher.final('utf8')
  
  const backup = JSON.parse(json)
  
  for (const [table, records] of Object.entries(backup)) {
    console.log(`Restoring ${table} (${(records as any[]).length} records)...`)
    const { error } = await adminClient.from(table).upsert(records as any[])
    if (error) throw error
  }
  
  console.log('✅ Restore complete')
}

// Usage: BACKUP_PASSWORD=secret npx ts-node scripts/backup-restore.ts backup-2025-10-22.json.enc
restoreBackup(process.argv[2]).catch(console.error)
