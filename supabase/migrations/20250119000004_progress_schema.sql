-- Migration 004: Progress Schema
-- Create mastery_states, attempts, spaced_repetition_items, and study_sessions tables

-- Create mastery_states table
CREATE TABLE mastery_states (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    probability numeric(5,4) NOT NULL DEFAULT 0.5000 CHECK (probability >= 0.0000 AND probability <= 1.0000),
    attempts integer NOT NULL DEFAULT 0,
    correct_attempts integer NOT NULL DEFAULT 0,
    last_attempt timestamptz NULL,
    last_mastery_update timestamptz NOT NULL DEFAULT now(),
    is_mastered boolean NOT NULL DEFAULT false,
    mastery_date timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT mastery_states_account_skill_unique UNIQUE (account_id, skill_id),
    CONSTRAINT mastery_states_correct_attempts_valid CHECK (correct_attempts <= attempts),
    CONSTRAINT mastery_states_mastery_date_consistency CHECK (
        (is_mastered = true AND mastery_date IS NOT NULL) OR
        (is_mastered = false AND mastery_date IS NULL)
    )
);

-- Create attempts table
CREATE TABLE attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    item_id text NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    answer jsonb NOT NULL,
    is_correct boolean NOT NULL,
    time_spent integer NOT NULL CHECK (time_spent >= 0), -- milliseconds
    timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create spaced_repetition_items table
CREATE TABLE spaced_repetition_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    interval integer NOT NULL DEFAULT 1 CHECK (interval >= 1), -- hours
    repetitions integer NOT NULL DEFAULT 0 CHECK (repetitions >= 0),
    ease_factor numeric(4,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor >= 1.30),
    next_review timestamptz NOT NULL,
    last_review timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT spaced_repetition_account_skill_unique UNIQUE (account_id, skill_id),
    CONSTRAINT spaced_repetition_last_review_consistency CHECK (
        (last_review IS NULL AND repetitions = 0) OR
        (last_review IS NOT NULL AND repetitions > 0)
    )
);

-- Create study_sessions table
CREATE TABLE study_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    skill_id text NULL REFERENCES skills(id) ON DELETE SET NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NULL,
    items_completed integer NOT NULL DEFAULT 0 CHECK (items_completed >= 0),
    correct_answers integer NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
    total_time integer NOT NULL DEFAULT 0 CHECK (total_time >= 0), -- milliseconds
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT study_sessions_correct_answers_valid CHECK (correct_answers <= items_completed),
    CONSTRAINT study_sessions_end_time_consistency CHECK (
        (end_time IS NULL) OR
        (end_time IS NOT NULL AND end_time >= start_time)
    )
);

-- Create indexes for mastery_states
CREATE INDEX idx_mastery_states_account_id ON mastery_states(account_id);
CREATE INDEX idx_mastery_states_skill_id ON mastery_states(skill_id);
CREATE INDEX idx_mastery_states_is_mastered ON mastery_states(is_mastered) WHERE is_mastered = true;
CREATE INDEX idx_mastery_states_last_attempt ON mastery_states(last_attempt DESC);

-- Create indexes for attempts
CREATE INDEX idx_attempts_account_id ON attempts(account_id);
CREATE INDEX idx_attempts_item_id ON attempts(item_id);
CREATE INDEX idx_attempts_skill_id ON attempts(skill_id);
CREATE INDEX idx_attempts_timestamp ON attempts(timestamp DESC);
CREATE INDEX idx_attempts_account_skill ON attempts(account_id, skill_id);

-- Create indexes for spaced_repetition_items
CREATE INDEX idx_spaced_repetition_account_id ON spaced_repetition_items(account_id);
CREATE INDEX idx_spaced_repetition_skill_id ON spaced_repetition_items(skill_id);
CREATE INDEX idx_spaced_repetition_next_review ON spaced_repetition_items(next_review);
CREATE INDEX idx_spaced_repetition_account_next_review ON spaced_repetition_items(account_id, next_review);

-- Create indexes for study_sessions
CREATE INDEX idx_study_sessions_account_id ON study_sessions(account_id);
CREATE INDEX idx_study_sessions_subject_id ON study_sessions(subject_id);
CREATE INDEX idx_study_sessions_skill_id ON study_sessions(skill_id) WHERE skill_id IS NOT NULL;
CREATE INDEX idx_study_sessions_start_time ON study_sessions(start_time DESC);
CREATE INDEX idx_study_sessions_account_start_time ON study_sessions(account_id, start_time DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_mastery_states_updated_at
    BEFORE UPDATE ON mastery_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaced_repetition_items_updated_at
    BEFORE UPDATE ON spaced_repetition_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE mastery_states IS 'User mastery tracking for each skill using P-model';
COMMENT ON TABLE attempts IS 'Individual attempts at learning items';
COMMENT ON TABLE spaced_repetition_items IS 'Spaced repetition scheduling for skills';
COMMENT ON TABLE study_sessions IS 'Study session tracking and analytics';

COMMENT ON COLUMN mastery_states.probability IS 'Mastery probability (0.0-1.0), threshold 0.9';
COMMENT ON COLUMN mastery_states.attempts IS 'Total attempts for this skill';
COMMENT ON COLUMN mastery_states.correct_attempts IS 'Correct attempts for this skill';
COMMENT ON COLUMN mastery_states.is_mastered IS 'Whether skill is mastered (probability >= 0.9)';
COMMENT ON COLUMN mastery_states.mastery_date IS 'When skill was first mastered';

COMMENT ON COLUMN attempts.answer IS 'User answer as JSON (type-specific)';
COMMENT ON COLUMN attempts.time_spent IS 'Time spent on attempt in milliseconds';

COMMENT ON COLUMN spaced_repetition_items.interval IS 'Hours until next review';
COMMENT ON COLUMN spaced_repetition_items.repetitions IS 'Number of successful repetitions';
COMMENT ON COLUMN spaced_repetition_items.ease_factor IS 'SM-2 algorithm ease factor';
COMMENT ON COLUMN spaced_repetition_items.next_review IS 'When this skill should be reviewed next';

COMMENT ON COLUMN study_sessions.skill_id IS 'Specific skill being studied (NULL for general sessions)';
COMMENT ON COLUMN study_sessions.items_completed IS 'Number of items completed in session';
COMMENT ON COLUMN study_sessions.correct_answers IS 'Number of correct answers in session';
COMMENT ON COLUMN study_sessions.total_time IS 'Total session time in milliseconds';
