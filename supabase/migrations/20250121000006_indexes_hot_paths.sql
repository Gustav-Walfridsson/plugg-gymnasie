-- Migration: 20250121000006_indexes_hot_paths.sql
-- Purpose: Add composite indexes for account-scoped queries (critical for performance)
-- Author: Senior Platform Engineer
-- Date: 2025-01-21

-- ============================================================================
-- TABLE SIZE CHECK (for documentation)
-- ============================================================================

-- Check table sizes (read-only, for documentation)
-- Run this manually to check sizes before creating indexes:
-- SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
-- FROM pg_tables WHERE schemaname = 'public' 
-- ORDER BY pg_total_relation_size DESC;

-- ============================================================================
-- COMPOSITE INDEXES FOR HOT PATHS
-- ============================================================================

-- 1. Mastery lookups (most critical hot path)
-- Used by: mastery_states queries with account_id + skill_id filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mastery_account_skill 
  ON mastery_states(account_id, skill_id);

-- 2. Attempts feed (analytics page, recent activity)
-- Used by: attempts queries with account_id + timestamp DESC ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attempts_account_time 
  ON attempts(account_id, timestamp DESC);

-- 3. Items by skill (practice pages)
-- Used by: items queries with skill_id + display_order ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_skill_order 
  ON items(skill_id, display_order);

-- ============================================================================
-- VERIFY EXISTING INDEXES
-- ============================================================================

-- Check if these indexes already exist (they should from previous migrations):
-- idx_spaced_repetition_account_next_review (for SRS queue)
-- idx_study_sessions_account_start_time (for study sessions by date)
-- idx_analytics_events_account_timestamp (for analytics events)

DO $$
DECLARE
  existing_indexes TEXT[];
BEGIN
  SELECT ARRAY_AGG(indexname) INTO existing_indexes
  FROM pg_indexes 
  WHERE schemaname = 'public' 
    AND indexname IN (
      'idx_spaced_repetition_account_next_review',
      'idx_study_sessions_account_start_time', 
      'idx_analytics_events_account_timestamp'
    );
    
  RAISE NOTICE 'Existing indexes: %', array_to_string(existing_indexes, ', ');
  
  IF array_length(existing_indexes, 1) IS NULL THEN
    RAISE NOTICE 'No existing indexes found - all indexes need to be created';
  END IF;
END $$;

-- ============================================================================
-- ANALYZE TABLES (update statistics for query planner)
-- ============================================================================

-- Update table statistics for better query planning
ANALYZE mastery_states;
ANALYZE attempts;
ANALYZE items;
ANALYZE spaced_repetition_items;
ANALYZE study_sessions;
ANALYZE analytics_events;

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================

-- CONCURRENTLY Notes:
-- - Postgres < 12: CONCURRENTLY cannot run in transaction block
-- - Supabase: Check if migrator wraps in transaction
-- - If migration fails: Run each CREATE INDEX separately via psql
-- - CONCURRENTLY prevents table locks but may fail under heavy load

-- Expected Performance Improvements:
-- - mastery_states queries: Index Scan instead of Seq Scan, < 5ms execution time
-- - attempts feed queries: Index Scan for account + time ordering, < 10ms execution time  
-- - items queries: Index Scan for skill + order, < 5ms execution time

-- Verification Queries (run after migration):
-- EXPLAIN (ANALYZE, BUFFERS) 
-- SELECT * FROM mastery_states 
-- WHERE account_id = '...' AND skill_id = 'variabler-uttryck';
-- Expected: Index Scan using idx_mastery_account_skill, execution time < 5ms

-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM attempts 
-- WHERE account_id = '...' 
-- ORDER BY timestamp DESC LIMIT 20;
-- Expected: Index Scan using idx_attempts_account_time, execution time < 10ms

-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM items 
-- WHERE skill_id = 'variabler-uttryck' 
-- ORDER BY display_order;
-- Expected: Index Scan using idx_items_skill_order, execution time < 5ms

-- DOWN: Rollback indexes
-- DROP INDEX CONCURRENTLY IF EXISTS idx_mastery_account_skill;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_attempts_account_time;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_items_skill_order;
