-- Migration: 20250121000004_backfill_and_constraints.sql
-- Purpose: Fix historical data and add missing constraints
-- Author: Senior Platform Engineer
-- Date: 2025-01-21

-- ============================================================================
-- BACKFILL: Fix historical rows where account_id mistakenly equals auth.users.id
-- ============================================================================

-- Count rows that need backfilling (for logging)
DO $$
DECLARE
  mastery_count INTEGER;
  attempts_count INTEGER;
  spaced_count INTEGER;
  sessions_count INTEGER;
  badges_count INTEGER;
  analytics_count INTEGER;
  plans_count INTEGER;
BEGIN
  -- Count rows where account_id is auth.users.id instead of accounts.id
  SELECT COUNT(*) INTO mastery_count
  FROM mastery_states ms
  WHERE ms.account_id IN (SELECT id FROM auth.users) 
    AND ms.account_id NOT IN (SELECT id FROM accounts);
    
  SELECT COUNT(*) INTO attempts_count
  FROM attempts a
  WHERE a.account_id IN (SELECT id FROM auth.users) 
    AND a.account_id NOT IN (SELECT id FROM accounts);
    
  SELECT COUNT(*) INTO spaced_count
  FROM spaced_repetition_items sr
  WHERE sr.account_id IN (SELECT id FROM auth.users) 
    AND sr.account_id NOT IN (SELECT id FROM accounts);
    
  SELECT COUNT(*) INTO sessions_count
  FROM study_sessions ss
  WHERE ss.account_id IN (SELECT id FROM auth.users) 
    AND ss.account_id NOT IN (SELECT id FROM accounts);
    
  SELECT COUNT(*) INTO badges_count
  FROM user_badges ub
  WHERE ub.account_id IN (SELECT id FROM auth.users) 
    AND ub.account_id NOT IN (SELECT id FROM accounts);
    
  SELECT COUNT(*) INTO analytics_count
  FROM analytics_events ae
  WHERE ae.account_id IN (SELECT id FROM auth.users) 
    AND ae.account_id NOT IN (SELECT id FROM accounts);
    
  SELECT COUNT(*) INTO plans_count
  FROM study_plans sp
  WHERE sp.account_id IN (SELECT id FROM auth.users) 
    AND sp.account_id NOT IN (SELECT id FROM accounts);

  -- Log the counts
  RAISE NOTICE 'Backfill counts: mastery_states=%, attempts=%, spaced_repetition_items=%, study_sessions=%, user_badges=%, analytics_events=%, study_plans=%', 
    mastery_count, attempts_count, spaced_count, sessions_count, badges_count, analytics_count, plans_count;
END $$;

-- Backfill mastery_states
UPDATE mastery_states ms
SET account_id = (
  SELECT a.id 
  FROM accounts a 
  WHERE a.user_id = ms.account_id
  LIMIT 1
)
WHERE ms.account_id IN (SELECT id FROM auth.users) 
  AND ms.account_id NOT IN (SELECT id FROM accounts);

-- Backfill attempts
UPDATE attempts a
SET account_id = (
  SELECT acc.id 
  FROM accounts acc 
  WHERE acc.user_id = a.account_id
  LIMIT 1
)
WHERE a.account_id IN (SELECT id FROM auth.users) 
  AND a.account_id NOT IN (SELECT id FROM accounts);

-- Backfill spaced_repetition_items
UPDATE spaced_repetition_items sr
SET account_id = (
  SELECT a.id 
  FROM accounts a 
  WHERE a.user_id = sr.account_id
  LIMIT 1
)
WHERE sr.account_id IN (SELECT id FROM auth.users) 
  AND sr.account_id NOT IN (SELECT id FROM accounts);

-- Backfill study_sessions
UPDATE study_sessions ss
SET account_id = (
  SELECT a.id 
  FROM accounts a 
  WHERE a.user_id = ss.account_id
  LIMIT 1
)
WHERE ss.account_id IN (SELECT id FROM auth.users) 
  AND ss.account_id NOT IN (SELECT id FROM accounts);

-- Backfill user_badges
UPDATE user_badges ub
SET account_id = (
  SELECT a.id 
  FROM accounts a 
  WHERE a.user_id = ub.account_id
  LIMIT 1
)
WHERE ub.account_id IN (SELECT id FROM auth.users) 
  AND ub.account_id NOT IN (SELECT id FROM accounts);

-- Backfill analytics_events
UPDATE analytics_events ae
SET account_id = (
  SELECT a.id 
  FROM accounts a 
  WHERE a.user_id = ae.account_id
  LIMIT 1
)
WHERE ae.account_id IN (SELECT id FROM auth.users) 
  AND ae.account_id NOT IN (SELECT id FROM accounts);

-- Backfill study_plans
UPDATE study_plans sp
SET account_id = (
  SELECT a.id 
  FROM accounts a 
  WHERE a.user_id = sp.account_id
  LIMIT 1
)
WHERE sp.account_id IN (SELECT id FROM auth.users) 
  AND sp.account_id NOT IN (SELECT id FROM accounts);

-- ============================================================================
-- CONSTRAINTS: Add NOT NULL and UNIQUE constraints
-- ============================================================================

-- Add NOT NULL to account_id columns (safe because of FK constraint)
ALTER TABLE mastery_states ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE attempts ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE spaced_repetition_items ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE study_sessions ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE user_badges ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE analytics_events ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE study_plans ALTER COLUMN account_id SET NOT NULL;

-- Add UNIQUE constraints (prevent duplicate progress)
ALTER TABLE mastery_states 
  ADD CONSTRAINT mastery_states_account_skill_unique 
  UNIQUE (account_id, skill_id);

ALTER TABLE spaced_repetition_items 
  ADD CONSTRAINT spaced_repetition_account_skill_unique 
  UNIQUE (account_id, skill_id);

-- ============================================================================
-- VERIFY: Check FK constraints are CASCADE (except audit_logs)
-- ============================================================================

DO $$
DECLARE
  fk_record RECORD;
BEGIN
  FOR fk_record IN 
    SELECT tc.table_name, kcu.column_name, rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND kcu.column_name = 'account_id'
      AND tc.table_name != 'audit_logs'
  LOOP
    IF fk_record.delete_rule != 'CASCADE' THEN
      RAISE EXCEPTION 'FK on %.% should be CASCADE, found %', 
        fk_record.table_name, fk_record.column_name, fk_record.delete_rule;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'All FK constraints to accounts are CASCADE (except audit_logs)';
END $$;

-- ============================================================================
-- VERIFICATION: Check for duplicates before UNIQUE constraints
-- ============================================================================

DO $$
DECLARE
  mastery_duplicates INTEGER;
  spaced_duplicates INTEGER;
BEGIN
  -- Check for duplicates in mastery_states
  SELECT COUNT(*) INTO mastery_duplicates
  FROM (
    SELECT account_id, skill_id, COUNT(*) 
    FROM mastery_states 
    GROUP BY account_id, skill_id 
    HAVING COUNT(*) > 1
  ) duplicates;
  
  -- Check for duplicates in spaced_repetition_items
  SELECT COUNT(*) INTO spaced_duplicates
  FROM (
    SELECT account_id, skill_id, COUNT(*) 
    FROM spaced_repetition_items 
    GROUP BY account_id, skill_id 
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF mastery_duplicates > 0 THEN
    RAISE EXCEPTION 'Found % duplicate (account_id, skill_id) pairs in mastery_states', mastery_duplicates;
  END IF;
  
  IF spaced_duplicates > 0 THEN
    RAISE EXCEPTION 'Found % duplicate (account_id, skill_id) pairs in spaced_repetition_items', spaced_duplicates;
  END IF;
  
  RAISE NOTICE 'No duplicate (account_id, skill_id) pairs found - UNIQUE constraints can be added';
END $$;

-- DOWN: Rollback constraints (not reversing backfill)
-- ALTER TABLE mastery_states DROP CONSTRAINT IF EXISTS mastery_states_account_skill_unique;
-- ALTER TABLE spaced_repetition_items DROP CONSTRAINT IF EXISTS spaced_repetition_account_skill_unique;
-- ALTER TABLE mastery_states ALTER COLUMN account_id DROP NOT NULL;
-- ALTER TABLE attempts ALTER COLUMN account_id DROP NOT NULL;
-- ALTER TABLE spaced_repetition_items ALTER COLUMN account_id DROP NOT NULL;
-- ALTER TABLE study_sessions ALTER COLUMN account_id DROP NOT NULL;
-- ALTER TABLE user_badges ALTER COLUMN account_id DROP NOT NULL;
-- ALTER TABLE analytics_events ALTER COLUMN account_id DROP NOT NULL;
-- ALTER TABLE study_plans ALTER COLUMN account_id DROP NOT NULL;
