-- Migration: 20250123000001_lesson_completion_xp.sql
-- Purpose: Create lesson_completions and xp_ledger tables for idempotent lesson completion tracking
-- Author: Senior Platform Engineer
-- Date: 2025-01-23

-- Create lesson_completions table for idempotent completion tracking
CREATE TABLE IF NOT EXISTS lesson_completions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    lesson_id text NOT NULL,
    xp_awarded integer NOT NULL DEFAULT 10,
    completed_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT lesson_completions_account_lesson_unique UNIQUE (account_id, lesson_id)
);

-- Create xp_ledger table for secure XP tracking
CREATE TABLE IF NOT EXISTS xp_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    source_type text NOT NULL CHECK (source_type IN ('lesson_completion', 'quiz_completion', 'streak_bonus', 'manual_adjustment')),
    source_id text NOT NULL,
    xp integer NOT NULL CHECK (xp > 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT xp_ledger_account_source_unique UNIQUE (account_id, source_type, source_id)
);

-- Add completed_lessons_count column to accounts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'completed_lessons_count'
    ) THEN
        ALTER TABLE accounts ADD COLUMN completed_lessons_count integer NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_completions_account_id ON lesson_completions(account_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_completed_at ON lesson_completions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_account_completed_at ON lesson_completions(account_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_xp_ledger_account_id ON xp_ledger(account_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_source_type ON xp_ledger(source_type);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_created_at ON xp_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_account_created_at ON xp_ledger(account_id, created_at DESC);

-- Create RLS policies
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;

-- Policy for lesson_completions: users can only see their own completions
CREATE POLICY "Users can view their own lesson completions" ON lesson_completions
    FOR SELECT USING (account_id = get_account_id(auth.uid()));

CREATE POLICY "Users can insert their own lesson completions" ON lesson_completions
    FOR INSERT WITH CHECK (account_id = get_account_id(auth.uid()));

-- Policy for xp_ledger: users can only see their own XP entries
CREATE POLICY "Users can view their own XP ledger" ON xp_ledger
    FOR SELECT USING (account_id = get_account_id(auth.uid()));

CREATE POLICY "Users can insert their own XP ledger entries" ON xp_ledger
    FOR INSERT WITH CHECK (account_id = get_account_id(auth.uid()));

-- Add comments for documentation
COMMENT ON TABLE lesson_completions IS 'Tracks completed lessons per account for idempotent completion';
COMMENT ON TABLE xp_ledger IS 'Audit trail of all XP awarded to accounts';
COMMENT ON COLUMN lesson_completions.lesson_id IS 'Unique identifier for the lesson';
COMMENT ON COLUMN lesson_completions.xp_awarded IS 'XP awarded for completing this lesson';
COMMENT ON COLUMN xp_ledger.source_type IS 'Type of XP source (lesson_completion, quiz_completion, etc.)';
COMMENT ON COLUMN xp_ledger.source_id IS 'ID of the source that awarded XP (lesson_id, quiz_id, etc.)';
COMMENT ON COLUMN xp_ledger.xp IS 'Amount of XP awarded';
COMMENT ON COLUMN accounts.completed_lessons_count IS 'Total number of lessons completed by this account';
