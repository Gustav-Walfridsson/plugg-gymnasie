-- Migration: 20250121000005_rollback_rls_policies.sql
-- Purpose: Rollback RLS policies to fix login issue (temporary fix)
-- Author: Senior Platform Engineer
-- Date: 2025-01-21

-- ============================================================================
-- ROLLBACK: Restore old FOR ALL policies to fix login regression
-- ============================================================================

-- Drop the new per-verb policies that are causing login issues
DROP POLICY IF EXISTS "mastery_states_select" ON mastery_states;
DROP POLICY IF EXISTS "mastery_states_insert" ON mastery_states;
DROP POLICY IF EXISTS "mastery_states_update" ON mastery_states;
DROP POLICY IF EXISTS "mastery_states_delete" ON mastery_states;
DROP POLICY IF EXISTS "admin_mastery_states_select" ON mastery_states;

DROP POLICY IF EXISTS "attempts_select" ON attempts;
DROP POLICY IF EXISTS "attempts_insert" ON attempts;
DROP POLICY IF EXISTS "attempts_update" ON attempts;
DROP POLICY IF EXISTS "attempts_delete" ON attempts;
DROP POLICY IF EXISTS "admin_attempts_select" ON attempts;

DROP POLICY IF EXISTS "spaced_repetition_items_select" ON spaced_repetition_items;
DROP POLICY IF EXISTS "spaced_repetition_items_insert" ON spaced_repetition_items;
DROP POLICY IF EXISTS "spaced_repetition_items_update" ON spaced_repetition_items;
DROP POLICY IF EXISTS "spaced_repetition_items_delete" ON spaced_repetition_items;
DROP POLICY IF EXISTS "admin_spaced_repetition_items_select" ON spaced_repetition_items;

DROP POLICY IF EXISTS "study_sessions_select" ON study_sessions;
DROP POLICY IF EXISTS "study_sessions_insert" ON study_sessions;
DROP POLICY IF EXISTS "study_sessions_update" ON study_sessions;
DROP POLICY IF EXISTS "study_sessions_delete" ON study_sessions;
DROP POLICY IF EXISTS "admin_study_sessions_select" ON study_sessions;

DROP POLICY IF EXISTS "user_badges_select" ON user_badges;
DROP POLICY IF EXISTS "user_badges_insert" ON user_badges;
DROP POLICY IF EXISTS "user_badges_update" ON user_badges;
DROP POLICY IF EXISTS "user_badges_delete" ON user_badges;
DROP POLICY IF EXISTS "admin_user_badges_select" ON user_badges;

DROP POLICY IF EXISTS "analytics_events_select" ON analytics_events;
DROP POLICY IF EXISTS "analytics_events_insert" ON analytics_events;
DROP POLICY IF EXISTS "analytics_events_update" ON analytics_events;
DROP POLICY IF EXISTS "analytics_events_delete" ON analytics_events;
DROP POLICY IF EXISTS "admin_analytics_events_select" ON analytics_events;

DROP POLICY IF EXISTS "study_plans_select" ON study_plans;
DROP POLICY IF EXISTS "study_plans_insert" ON study_plans;
DROP POLICY IF EXISTS "study_plans_update" ON study_plans;
DROP POLICY IF EXISTS "study_plans_delete" ON study_plans;
DROP POLICY IF EXISTS "admin_study_plans_select" ON study_plans;

-- ============================================================================
-- RESTORE: Old FOR ALL policies (simpler, working version)
-- ============================================================================

-- Restore old working policies for mastery_states
CREATE POLICY "mastery_states_read" ON mastery_states 
  FOR SELECT 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

CREATE POLICY "mastery_states_write" ON mastery_states 
  FOR ALL 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

-- Restore old working policies for attempts
CREATE POLICY "attempts_read" ON attempts 
  FOR SELECT 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

CREATE POLICY "attempts_write" ON attempts 
  FOR ALL 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

-- Restore old working policies for spaced_repetition_items
CREATE POLICY "spaced_repetition_items_read" ON spaced_repetition_items 
  FOR SELECT 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

CREATE POLICY "spaced_repetition_items_write" ON spaced_repetition_items 
  FOR ALL 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

-- Restore old working policies for study_sessions
CREATE POLICY "study_sessions_read" ON study_sessions 
  FOR SELECT 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

CREATE POLICY "study_sessions_write" ON study_sessions 
  FOR ALL 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

-- Restore old working policies for user_badges
CREATE POLICY "user_badges_read" ON user_badges 
  FOR SELECT 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

CREATE POLICY "user_badges_write" ON user_badges 
  FOR ALL 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

-- Restore old working policies for analytics_events
CREATE POLICY "analytics_events_read" ON analytics_events 
  FOR SELECT 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

CREATE POLICY "analytics_events_write" ON analytics_events 
  FOR ALL 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

-- Restore old working policies for study_plans
CREATE POLICY "study_plans_read" ON study_plans 
  FOR SELECT 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

CREATE POLICY "study_plans_write" ON study_plans 
  FOR ALL 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

-- ============================================================================
-- TEMPORARY FIX: Simplify auth context to use auth.users.id temporarily
-- ============================================================================

-- This is a temporary workaround until we can properly debug the RLS policies
-- The auth context will use auth.users.id as account_id for now

COMMENT ON POLICY "mastery_states_read" ON mastery_states IS 
  'TEMPORARY: Rollback to working FOR ALL policies. Will be replaced with per-verb policies after debugging.';

COMMENT ON POLICY "attempts_read" ON attempts IS 
  'TEMPORARY: Rollback to working FOR ALL policies. Will be replaced with per-verb policies after debugging.';

-- DOWN: This rollback migration should not be reversed
-- The old policies are restored and working
