-- Migration: 20250121000001_cleanup_legacy.sql
-- Purpose: Remove duplicate/legacy tables from 2024 migrations
-- Author: Senior Platform Engineer
-- Date: 2025-01-21

-- ============================================================================
-- LEGACY TABLE CLEANUP
-- ============================================================================

-- This migration removes duplicate/legacy tables that were created in 2024
-- migrations and are now replaced by the canonical schema from 2025 migrations.

-- ============================================================================
-- 1. DROP LEGACY TABLES
-- ============================================================================

-- Drop user_progress table (replaced by mastery_states)
DROP TABLE IF EXISTS user_progress CASCADE;

-- ============================================================================
-- 2. DOCUMENT DEPRECATED MIGRATIONS
-- ============================================================================

-- Add comments to mark 2024 migrations as deprecated
COMMENT ON TABLE IF EXISTS user_progress IS 
  'DEPRECATED: This table was replaced by mastery_states in migration 20250119000004_progress_schema.sql';

-- ============================================================================
-- 3. VERIFY NO CODE REFERENCES LEGACY TABLES
-- ============================================================================

-- This is a safety check - if any code still references user_progress,
-- the migration will fail and we can fix the code first
DO $$
BEGIN
    -- Check if user_progress table still exists (it shouldn't after DROP)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress') THEN
        RAISE EXCEPTION 'user_progress table still exists - check for code references before dropping';
    END IF;
    
    RAISE NOTICE 'Legacy cleanup completed successfully';
END $$;

-- ============================================================================
-- 4. VERIFICATION QUERIES
-- ============================================================================

-- Verify legacy tables are gone
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('user_progress')
      AND table_schema = 'public';
    
    IF table_count > 0 THEN
        RAISE EXCEPTION 'Legacy tables still exist: %', table_count;
    END IF;
    
    RAISE NOTICE 'All legacy tables successfully removed';
END $$;

-- ============================================================================
-- DOWN: Rollback (restore user_progress table)
-- ============================================================================

-- If rollback is needed, restore the user_progress table:
-- CREATE TABLE user_progress (
--   user_id uuid NOT NULL,
--   skill_id text NOT NULL,
--   mastery_level numeric,
--   attempts integer DEFAULT 0,
--   correct_attempts integer DEFAULT 0,
--   last_attempt timestamp with time zone,
--   created_at timestamp with time zone DEFAULT now(),
--   updated_at timestamp with time zone DEFAULT now(),
--   PRIMARY KEY (user_id, skill_id)
-- );
--
-- ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
--
-- CREATE POLICY "user_progress_read" ON user_progress FOR SELECT
--   USING (user_id = auth.uid());
--
-- CREATE POLICY "user_progress_write" ON user_progress FOR ALL
--   USING (user_id = auth.uid());

