import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    console.log('🔍 API Route called for lesson:', lessonId)

    // Get the authenticated user from cookies
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message || 'No user found')
      return NextResponse.json({
        error: 'Unauthorized',
        details: authError?.message || 'No user found',
        completed: false,
        xp_awarded: 0
      }, { status: 401 })
    }

    console.log('👤 Authenticated user:', user.email)

    // Get the account for this user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, total_xp, completed_lessons_count')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (accountError || !account) {
      console.error('❌ Account not found:', accountError?.message)
      return NextResponse.json({
        error: 'Account not found',
        details: accountError?.message || 'No account found for user',
        completed: false,
        xp_awarded: 0
      }, { status: 404 })
    }

    const accountId = account.id
    console.log('✅ Using account ID:', accountId)
    const xpPerLesson = 10

    // Check if lesson already completed
    const { data: existingCompletion, error: checkError } = await supabase
      .from('lesson_completions')
      .select('id')
      .eq('account_id', accountId)
      .eq('lesson_id', lessonId)
      .single()

    if (existingCompletion) {
      console.log('⚠️ Lesson already completed:', lessonId)
      return NextResponse.json({
        completed: false,
        xp_awarded: 0,
        message: 'Lektion redan markerad som läst'
      })
    }

    // Insert new completion
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
      console.log('✅ Lesson completion inserted successfully, adding XP...')

      // Insert i xp_ledger (idempotent)
      const { error: xpLedgerError } = await supabase
        .from('xp_ledger')
        .insert({
          account_id: accountId,
          source_type: 'lesson_completion',
          source_id: lessonId,
          xp: xpPerLesson
        })

      if (xpLedgerError) {
        console.error('❌ Error inserting XP ledger entry:', xpLedgerError)
        throw xpLedgerError
      }

      // Uppdatera accounts: öka total_xp och completed_lessons_count
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          total_xp: account.total_xp + xpPerLesson,
          completed_lessons_count: account.completed_lessons_count + 1
        })
        .eq('id', accountId)

      if (updateError) {
        console.error('❌ Error updating account stats:', updateError)
        throw updateError
      }

      console.log('✅ XP and stats updated successfully')
      return NextResponse.json({
        completed: true,
        xp_awarded: xpPerLesson,
        message: 'Lektion markerad som läst! Du fick 10 XP.'
      })
    } else {
      console.error('❌ Unexpected completion error:', completionError)
      throw completionError
    }
  } catch (error: any) {
    console.error('❌ Error completing lesson:', error)
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    
    return NextResponse.json(
      { 
        error: 'Ett fel uppstod vid markering av lektion',
        details: error.message,
        completed: false,
        xp_awarded: 0
      },
      { status: 500 }
    )
  }
}
