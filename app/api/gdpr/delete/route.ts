import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Soft-delete account (sets deleted_at, RLS will hide all related data)
  const { error: deleteError } = await adminClient
    .from('accounts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (deleteError) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  // Optional: Hard-delete auth user immediately
  // await adminClient.auth.admin.deleteUser(user.id)

  return NextResponse.json({ success: true })
}
