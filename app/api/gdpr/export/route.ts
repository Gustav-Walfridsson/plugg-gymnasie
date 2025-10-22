import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST() {
  // Get logged-in user via SSR client
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get account ID for the user
  const { data: account } = await adminClient
    .from('accounts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  // Fetch all user data via admin client (bypasses RLS)
  const [mastery, attempts, sessions, badges] = await Promise.all([
    adminClient.from('mastery_states').select('*').eq('account_id', account.id),
    adminClient.from('attempts').select('*').eq('account_id', account.id),
    adminClient.from('study_sessions').select('*').eq('account_id', account.id),
    adminClient.from('user_badges').select('*').eq('account_id', account.id),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    user_email: user.email,
    account: account,
    mastery_states: mastery.data || [],
    attempts: attempts.data || [],
    study_sessions: sessions.data || [],
    badges: badges.data || [],
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="plugg-data-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
