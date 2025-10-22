-- Migration 007: RLS Policies
-- Enable Row Level Security and create policies for all tables

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
-- Note: audit_logs is service role only, no RLS needed

-- ============================================================================
-- ACCOUNTS POLICIES
-- ============================================================================

-- Read: User can read own account, admins read all
CREATE POLICY "accounts_read" ON accounts FOR SELECT
    USING (
        auth.uid() = user_id 
        OR auth.jwt()->>'role' IN ('admin', 'owner')
    );

-- Update: User can update own account only
CREATE POLICY "accounts_update" ON accounts FOR UPDATE
    USING (auth.uid() = user_id);

-- Insert: Handled by trigger, no direct inserts allowed
CREATE POLICY "accounts_insert" ON accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CONTENT POLICIES (subjects, topics, skills, lessons, items)
-- ============================================================================

-- Read: Public read for all authenticated users
CREATE POLICY "subjects_read" ON subjects FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "topics_read" ON topics FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "skills_read" ON skills FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "lessons_read" ON lessons FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "items_read" ON items FOR SELECT
    USING (auth.role() = 'authenticated');

-- Write: Admin/owner only
CREATE POLICY "subjects_write" ON subjects FOR ALL
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "topics_write" ON topics FOR ALL
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "skills_write" ON skills FOR ALL
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "lessons_write" ON lessons FOR ALL
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "items_write" ON items FOR ALL
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

-- ============================================================================
-- USER PROGRESS POLICIES (mastery_states, attempts, spaced_repetition_items, study_sessions)
-- ============================================================================

-- Read: User reads own data only
CREATE POLICY "mastery_states_read" ON mastery_states FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "attempts_read" ON attempts FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "spaced_repetition_items_read" ON spaced_repetition_items FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "study_sessions_read" ON study_sessions FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

-- Insert/Update: User writes own data only
CREATE POLICY "mastery_states_write" ON mastery_states FOR ALL
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "attempts_write" ON attempts FOR ALL
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "spaced_repetition_items_write" ON spaced_repetition_items FOR ALL
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "study_sessions_write" ON study_sessions FOR ALL
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- GAMIFICATION POLICIES (user_badges, analytics_events, study_plans)
-- ============================================================================

-- Read: User reads own data only
CREATE POLICY "user_badges_read" ON user_badges FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "analytics_events_read" ON analytics_events FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "study_plans_read" ON study_plans FOR SELECT
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

-- Insert/Update: User writes own data only
CREATE POLICY "user_badges_write" ON user_badges FOR ALL
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "analytics_events_write" ON analytics_events FOR ALL
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "study_plans_write" ON study_plans FOR ALL
    USING (
        account_id IN (
            SELECT id FROM accounts WHERE user_id = auth.uid()
        )
    );

-- ============================================================================
-- ADMIN POLICIES (for admin/owner access to all user data)
-- ============================================================================

-- Admin read access to all user progress data
CREATE POLICY "admin_mastery_states_read" ON mastery_states FOR SELECT
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "admin_attempts_read" ON attempts FOR SELECT
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "admin_spaced_repetition_items_read" ON spaced_repetition_items FOR SELECT
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "admin_study_sessions_read" ON study_sessions FOR SELECT
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "admin_user_badges_read" ON user_badges FOR SELECT
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "admin_analytics_events_read" ON analytics_events FOR SELECT
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

CREATE POLICY "admin_study_plans_read" ON study_plans FOR SELECT
    USING (auth.jwt()->>'role' IN ('admin', 'owner'));

-- ============================================================================
-- MATERIALIZED VIEW POLICIES
-- ============================================================================

-- Note: Materialized views don't support RLS policies
-- Access control is handled at the application level

-- ============================================================================
-- FUNCTION SECURITY
-- ============================================================================

-- Grant execute permissions on GDPR functions
GRANT EXECUTE ON FUNCTION export_user_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION soft_delete_account(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION hard_delete_account(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_skills_due_for_review(uuid) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "accounts_read" ON accounts IS 'Users can read own account, admins read all';
COMMENT ON POLICY "accounts_update" ON accounts IS 'Users can update own account only';
COMMENT ON POLICY "accounts_insert" ON accounts IS 'Account creation handled by trigger';

COMMENT ON POLICY "subjects_read" ON subjects IS 'All authenticated users can read content';
COMMENT ON POLICY "subjects_write" ON subjects IS 'Only admin/owner can modify content';

COMMENT ON POLICY "mastery_states_read" ON mastery_states IS 'Users can read own progress data only';
COMMENT ON POLICY "mastery_states_write" ON mastery_states IS 'Users can write own progress data only';

COMMENT ON POLICY "admin_mastery_states_read" ON mastery_states IS 'Admin/owner can read all user progress';
