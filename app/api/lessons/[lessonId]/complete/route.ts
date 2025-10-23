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

    // Try to get user from Authorization header first (from frontend)
    const authHeader = request.headers.get('authorization')
    let user = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('🔑 Using Bearer token from header')
      
      // Verify token with admin client
      const { data: { user: tokenUser }, error: tokenError } = await adminClient.auth.getUser(token)
      if (!tokenError && tokenUser) {
        user = tokenUser
        console.log('✅ User verified from token:', user.email)
      }
    }
    
    // Fallback: try server client
    if (!user) {
      console.log('🔄 Fallback: trying server client...')
      const supabase = await createClient()
      const { data: { user: serverUser }, error: authError } = await supabase.auth.getUser()
      
      if (!authError && serverUser) {
        user = serverUser
        console.log('✅ User verified from server client:', user.email)
      }
    }

    if (!user) {
      console.error('❌ Authentication failed: No user found')
      return NextResponse.json({
        error: 'Unauthorized',
        details: 'No user found',
        completed: false,
        xp_awarded: 0
      }, { status: 401 })
    }

    console.log('👤 Authenticated user:', user.email)

    // Get the account for this user using admin client
    const { data: account, error: accountError } = await adminClient
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

    // Check if lesson already completed using admin client
    const { data: existingCompletion, error: checkError } = await adminClient
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

    // Insert new completion using admin client
    const { data: completion, error: completionError } = await adminClient
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

      // Insert i xp_ledger (idempotent) using admin client
      const { error: xpLedgerError } = await adminClient
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

      // Uppdatera accounts: öka total_xp och completed_lessons_count using admin client
      const { error: updateError } = await adminClient
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
