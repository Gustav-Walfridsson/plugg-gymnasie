import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    const supabase = await createClient()
    
    // Hämta inloggad användare
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hämta account_id
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const accountId = account.id
    const xpPerLesson = 10

    // Försök insert i lesson_completions med ON CONFLICT DO NOTHING
    const { data: completion, error: completionError } = await supabase
      .from('lesson_completions')
      .insert({
        account_id: accountId,
        lesson_id: lessonId,
        xp_awarded: xpPerLesson
      })
      .select()
      .single()

    // Om insert lyckades (ny completion), lägg till XP
    if (!completionError && completion) {
      // Insert i xp_ledger (idempotent)
      await supabase
        .from('xp_ledger')
        .insert({
          account_id: accountId,
          source_type: 'lesson_completion',
          source_id: lessonId,
          xp: xpPerLesson
        })

      // Uppdatera accounts: öka total_xp och completed_lessons_count
      await supabase
        .from('accounts')
        .update({
          total_xp: supabase.raw(`total_xp + ${xpPerLesson}`),
          completed_lessons_count: supabase.raw('completed_lessons_count + 1')
        })
        .eq('id', accountId)

      return NextResponse.json({
        completed: true,
        xp_awarded: xpPerLesson,
        message: 'Lektion markerad som läst! +10 XP'
      })
    } else if (completionError && completionError.code === '23505') {
      // Duplicate key error - redan markerad som läst
      return NextResponse.json({
        completed: false,
        xp_awarded: 0,
        message: 'Lektion redan markerad som läst'
      })
    } else {
      throw completionError
    }
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json(
      { error: 'Failed to complete lesson' },
      { status: 500 }
    )
  }
}
