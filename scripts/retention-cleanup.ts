import { adminClient } from '../lib/supabase/admin'

async function cleanupOldData() {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 24) // 24 months ago

  console.log(`Deleting accounts deleted before ${cutoff.toISOString()}`)

  const { data: oldAccounts } = await adminClient
    .from('accounts')
    .select('id, user_id')
    .not('deleted_at', 'is', null)
    .lt('deleted_at', cutoff.toISOString())

  for (const acc of oldAccounts || []) {
    console.log(`Hard-deleting account ${acc.id}`)
    await adminClient.auth.admin.deleteUser(acc.user_id) // CASCADE deletes all data
  }

  console.log(`Cleanup complete: ${oldAccounts?.length || 0} accounts deleted`)
}

cleanupOldData().catch(console.error)
