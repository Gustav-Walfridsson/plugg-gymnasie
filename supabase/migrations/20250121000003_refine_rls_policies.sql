-- Migration: 20250121000003_refine_rls_policies.sql
-- Purpose: Replace FOR ALL policies with explicit per-verb policies including soft-delete awareness
-- Author: Senior Platform Engineer
-- Date: 2025-01-21

-- ============================================================================
-- TABLE: mastery_states
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "mastery_states_read" ON mastery_states;
DROP POLICY IF EXISTS "mastery_states_write" ON mastery_states;
DROP POLICY IF EXISTS "admin_mastery_states_read" ON mastery_states;

-- Enable RLS
ALTER TABLE mastery_states ENABLE ROW LEVEL SECURITY;

-- User SELECT (own data, active accounts only)
CREATE POLICY "mastery_states_select" ON mastery_states 
  FOR SELECT 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User INSERT (own data, active accounts only)
CREATE POLICY "mastery_states_insert" ON mastery_states 
  FOR INSERT 
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User UPDATE (own data, active accounts only)
CREATE POLICY "mastery_states_update" ON mastery_states 
  FOR UPDATE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  )
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User DELETE (own data, active accounts only)
CREATE POLICY "mastery_states_delete" ON mastery_states 
  FOR DELETE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- Admin/Owner SELECT (read-only bypass for all active accounts)
CREATE POLICY "admin_mastery_states_select" ON mastery_states 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = mastery_states.account_id 
        AND a.deleted_at IS NULL
    )
    AND (auth.jwt()->>'role') IN ('admin', 'owner')
  );

COMMENT ON POLICY "mastery_states_select" ON mastery_states IS 
  'Users can read own mastery data (active accounts only)';
COMMENT ON POLICY "admin_mastery_states_select" ON mastery_states IS 
  'Admin/owner can read all user data (read-only bypass)';

-- ============================================================================
-- TABLE: attempts
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "attempts_read" ON attempts;
DROP POLICY IF EXISTS "attempts_write" ON attempts;
DROP POLICY IF EXISTS "admin_attempts_read" ON attempts;

-- Enable RLS
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- User SELECT (own data, active accounts only)
CREATE POLICY "attempts_select" ON attempts 
  FOR SELECT 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User INSERT (own data, active accounts only)
CREATE POLICY "attempts_insert" ON attempts 
  FOR INSERT 
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User UPDATE (own data, active accounts only)
CREATE POLICY "attempts_update" ON attempts 
  FOR UPDATE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  )
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User DELETE (own data, active accounts only)
CREATE POLICY "attempts_delete" ON attempts 
  FOR DELETE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- Admin/Owner SELECT (read-only bypass for all active accounts)
CREATE POLICY "admin_attempts_select" ON attempts 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = attempts.account_id 
        AND a.deleted_at IS NULL
    )
    AND (auth.jwt()->>'role') IN ('admin', 'owner')
  );

COMMENT ON POLICY "attempts_select" ON attempts IS 
  'Users can read own attempt data (active accounts only)';
COMMENT ON POLICY "admin_attempts_select" ON attempts IS 
  'Admin/owner can read all user data (read-only bypass)';

-- ============================================================================
-- TABLE: spaced_repetition_items
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "spaced_repetition_items_read" ON spaced_repetition_items;
DROP POLICY IF EXISTS "spaced_repetition_items_write" ON spaced_repetition_items;
DROP POLICY IF EXISTS "admin_spaced_repetition_items_read" ON spaced_repetition_items;

-- Enable RLS
ALTER TABLE spaced_repetition_items ENABLE ROW LEVEL SECURITY;

-- User SELECT (own data, active accounts only)
CREATE POLICY "spaced_repetition_items_select" ON spaced_repetition_items 
  FOR SELECT 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User INSERT (own data, active accounts only)
CREATE POLICY "spaced_repetition_items_insert" ON spaced_repetition_items 
  FOR INSERT 
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User UPDATE (own data, active accounts only)
CREATE POLICY "spaced_repetition_items_update" ON spaced_repetition_items 
  FOR UPDATE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  )
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User DELETE (own data, active accounts only)
CREATE POLICY "spaced_repetition_items_delete" ON spaced_repetition_items 
  FOR DELETE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- Admin/Owner SELECT (read-only bypass for all active accounts)
CREATE POLICY "admin_spaced_repetition_items_select" ON spaced_repetition_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = spaced_repetition_items.account_id 
        AND a.deleted_at IS NULL
    )
    AND (auth.jwt()->>'role') IN ('admin', 'owner')
  );

COMMENT ON POLICY "spaced_repetition_items_select" ON spaced_repetition_items IS 
  'Users can read own SRS data (active accounts only)';
COMMENT ON POLICY "admin_spaced_repetition_items_select" ON spaced_repetition_items IS 
  'Admin/owner can read all user data (read-only bypass)';

-- ============================================================================
-- TABLE: study_sessions
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "study_sessions_read" ON study_sessions;
DROP POLICY IF EXISTS "study_sessions_write" ON study_sessions;
DROP POLICY IF EXISTS "admin_study_sessions_read" ON study_sessions;

-- Enable RLS
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- User SELECT (own data, active accounts only)
CREATE POLICY "study_sessions_select" ON study_sessions 
  FOR SELECT 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User INSERT (own data, active accounts only)
CREATE POLICY "study_sessions_insert" ON study_sessions 
  FOR INSERT 
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User UPDATE (own data, active accounts only)
CREATE POLICY "study_sessions_update" ON study_sessions 
  FOR UPDATE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  )
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User DELETE (own data, active accounts only)
CREATE POLICY "study_sessions_delete" ON study_sessions 
  FOR DELETE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- Admin/Owner SELECT (read-only bypass for all active accounts)
CREATE POLICY "admin_study_sessions_select" ON study_sessions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = study_sessions.account_id 
        AND a.deleted_at IS NULL
    )
    AND (auth.jwt()->>'role') IN ('admin', 'owner')
  );

COMMENT ON POLICY "study_sessions_select" ON study_sessions IS 
  'Users can read own study session data (active accounts only)';
COMMENT ON POLICY "admin_study_sessions_select" ON study_sessions IS 
  'Admin/owner can read all user data (read-only bypass)';

-- ============================================================================
-- TABLE: user_badges
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "user_badges_read" ON user_badges;
DROP POLICY IF EXISTS "user_badges_write" ON user_badges;
DROP POLICY IF EXISTS "admin_user_badges_read" ON user_badges;

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- User SELECT (own data, active accounts only)
CREATE POLICY "user_badges_select" ON user_badges 
  FOR SELECT 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User INSERT (own data, active accounts only)
CREATE POLICY "user_badges_insert" ON user_badges 
  FOR INSERT 
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User UPDATE (own data, active accounts only)
CREATE POLICY "user_badges_update" ON user_badges 
  FOR UPDATE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  )
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User DELETE (own data, active accounts only)
CREATE POLICY "user_badges_delete" ON user_badges 
  FOR DELETE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- Admin/Owner SELECT (read-only bypass for all active accounts)
CREATE POLICY "admin_user_badges_select" ON user_badges 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = user_badges.account_id 
        AND a.deleted_at IS NULL
    )
    AND (auth.jwt()->>'role') IN ('admin', 'owner')
  );

COMMENT ON POLICY "user_badges_select" ON user_badges IS 
  'Users can read own badge data (active accounts only)';
COMMENT ON POLICY "admin_user_badges_select" ON user_badges IS 
  'Admin/owner can read all user data (read-only bypass)';

-- ============================================================================
-- TABLE: analytics_events
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "analytics_events_read" ON analytics_events;
DROP POLICY IF EXISTS "analytics_events_write" ON analytics_events;
DROP POLICY IF EXISTS "admin_analytics_events_read" ON analytics_events;

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- User SELECT (own data, active accounts only)
CREATE POLICY "analytics_events_select" ON analytics_events 
  FOR SELECT 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User INSERT (own data, active accounts only)
CREATE POLICY "analytics_events_insert" ON analytics_events 
  FOR INSERT 
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User UPDATE (own data, active accounts only)
CREATE POLICY "analytics_events_update" ON analytics_events 
  FOR UPDATE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  )
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User DELETE (own data, active accounts only)
CREATE POLICY "analytics_events_delete" ON analytics_events 
  FOR DELETE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- Admin/Owner SELECT (read-only bypass for all active accounts)
CREATE POLICY "admin_analytics_events_select" ON analytics_events 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = analytics_events.account_id 
        AND a.deleted_at IS NULL
    )
    AND (auth.jwt()->>'role') IN ('admin', 'owner')
  );

COMMENT ON POLICY "analytics_events_select" ON analytics_events IS 
  'Users can read own analytics data (active accounts only)';
COMMENT ON POLICY "admin_analytics_events_select" ON analytics_events IS 
  'Admin/owner can read all user data (read-only bypass)';

-- ============================================================================
-- TABLE: study_plans
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "study_plans_read" ON study_plans;
DROP POLICY IF EXISTS "study_plans_write" ON study_plans;
DROP POLICY IF EXISTS "admin_study_plans_read" ON study_plans;

-- Enable RLS
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

-- User SELECT (own data, active accounts only)
CREATE POLICY "study_plans_select" ON study_plans 
  FOR SELECT 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User INSERT (own data, active accounts only)
CREATE POLICY "study_plans_insert" ON study_plans 
  FOR INSERT 
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User UPDATE (own data, active accounts only)
CREATE POLICY "study_plans_update" ON study_plans 
  FOR UPDATE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  )
  WITH CHECK (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- User DELETE (own data, active accounts only)
CREATE POLICY "study_plans_delete" ON study_plans 
  FOR DELETE 
  USING (
    account_id = public.get_account_id(auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = account_id AND a.deleted_at IS NOT NULL
    )
  );

-- Admin/Owner SELECT (read-only bypass for all active accounts)
CREATE POLICY "admin_study_plans_select" ON study_plans 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.accounts a
      WHERE a.id = study_plans.account_id 
        AND a.deleted_at IS NULL
    )
    AND (auth.jwt()->>'role') IN ('admin', 'owner')
  );

COMMENT ON POLICY "study_plans_select" ON study_plans IS 
  'Users can read own study plan data (active accounts only)';
COMMENT ON POLICY "admin_study_plans_select" ON study_plans IS 
  'Admin/owner can read all user data (read-only bypass)';

-- ============================================================================
-- CONTENT TABLES (subjects, topics, skills, lessons, items)
-- ============================================================================

-- Authenticated users can read content
CREATE POLICY "subjects_select" ON subjects 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "topics_select" ON topics 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "skills_select" ON skills 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "lessons_select" ON lessons 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "items_select" ON items 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Admin/owner can write content
CREATE POLICY "subjects_write" ON subjects 
  FOR ALL 
  USING ((auth.jwt()->>'role') IN ('admin', 'owner'))
  WITH CHECK ((auth.jwt()->>'role') IN ('admin', 'owner'));

CREATE POLICY "topics_write" ON topics 
  FOR ALL 
  USING ((auth.jwt()->>'role') IN ('admin', 'owner'))
  WITH CHECK ((auth.jwt()->>'role') IN ('admin', 'owner'));

CREATE POLICY "skills_write" ON skills 
  FOR ALL 
  USING ((auth.jwt()->>'role') IN ('admin', 'owner'))
  WITH CHECK ((auth.jwt()->>'role') IN ('admin', 'owner'));

CREATE POLICY "lessons_write" ON lessons 
  FOR ALL 
  USING ((auth.jwt()->>'role') IN ('admin', 'owner'))
  WITH CHECK ((auth.jwt()->>'role') IN ('admin', 'owner'));

CREATE POLICY "items_write" ON items 
  FOR ALL 
  USING ((auth.jwt()->>'role') IN ('admin', 'owner'))
  WITH CHECK ((auth.jwt()->>'role') IN ('admin', 'owner'));

-- DOWN: Restore old FOR ALL policies (documented in migration comments)
-- Example rollback for mastery_states:
-- CREATE POLICY "mastery_states_read" ON mastery_states FOR SELECT
--   USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
-- CREATE POLICY "mastery_states_write" ON mastery_states FOR ALL
--   USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
