-- Migration 005: Gamification and Analytics
-- Create user_badges, analytics_events, and study_plans tables

-- Create user_badges table
CREATE TABLE user_badges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    badge_id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    subject_id text NULL REFERENCES subjects(id) ON DELETE SET NULL,
    earned_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT user_badges_account_badge_unique UNIQUE (account_id, badge_id)
);

-- Create analytics_events table
CREATE TABLE analytics_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    event_type event_type NOT NULL,
    event_data jsonb NOT NULL DEFAULT '{}',
    timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create study_plans table
CREATE TABLE study_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    duration integer NOT NULL CHECK (duration > 0), -- minutes
    skill_ids text[] NOT NULL DEFAULT '{}',
    estimated_completion timestamptz NOT NULL,
    priority priority_level NOT NULL DEFAULT 'medium',
    completed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT study_plans_skill_ids_not_empty CHECK (array_length(skill_ids, 1) > 0),
    CONSTRAINT study_plans_estimated_completion_future CHECK (estimated_completion > created_at)
);

-- Create indexes for user_badges
CREATE INDEX idx_user_badges_account_id ON user_badges(account_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_subject_id ON user_badges(subject_id) WHERE subject_id IS NOT NULL;
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);
CREATE INDEX idx_user_badges_account_earned_at ON user_badges(account_id, earned_at DESC);

-- Create indexes for analytics_events
CREATE INDEX idx_analytics_events_account_id ON analytics_events(account_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_account_timestamp ON analytics_events(account_id, timestamp DESC);
CREATE INDEX idx_analytics_events_account_type_timestamp ON analytics_events(account_id, event_type, timestamp DESC);

-- Create indexes for study_plans
CREATE INDEX idx_study_plans_account_id ON study_plans(account_id);
CREATE INDEX idx_study_plans_completed ON study_plans(completed) WHERE completed = false;
CREATE INDEX idx_study_plans_estimated_completion ON study_plans(estimated_completion);
CREATE INDEX idx_study_plans_priority ON study_plans(priority);
CREATE INDEX idx_study_plans_account_completed ON study_plans(account_id, completed);

-- Create trigger for updated_at on study_plans
CREATE TRIGGER update_study_plans_updated_at
    BEFORE UPDATE ON study_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up old analytics events (for GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS void AS $$
BEGIN
    -- Delete events older than 90 days
    DELETE FROM analytics_events 
    WHERE timestamp < (now() - interval '90 days');
    
    -- Log cleanup action
    INSERT INTO analytics_events (account_id, event_type, event_data, timestamp)
    VALUES (
        NULL, -- System event
        'cleanup_old_events'::event_type,
        jsonb_build_object(
            'deleted_count', ROW_COUNT,
            'cleanup_date', now()
        ),
        now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE user_badges IS 'User achievements and badges earned';
COMMENT ON TABLE analytics_events IS 'User behavior and system events for analytics';
COMMENT ON TABLE study_plans IS 'User-created study plans and goals';

COMMENT ON COLUMN user_badges.badge_id IS 'Unique badge identifier (e.g., first-mastery, streak-7)';
COMMENT ON COLUMN user_badges.name IS 'Display name for the badge';
COMMENT ON COLUMN user_badges.description IS 'Description of how to earn the badge';
COMMENT ON COLUMN user_badges.icon IS 'Lucide React icon name for the badge';
COMMENT ON COLUMN user_badges.subject_id IS 'Subject-specific badge (NULL for general badges)';

COMMENT ON COLUMN analytics_events.event_type IS 'Type of event for categorization';
COMMENT ON COLUMN analytics_events.event_data IS 'Event-specific data as JSON';
COMMENT ON COLUMN analytics_events.timestamp IS 'When the event occurred';

COMMENT ON COLUMN study_plans.duration IS 'Estimated duration in minutes';
COMMENT ON COLUMN study_plans.skill_ids IS 'Array of skill IDs to study';
COMMENT ON COLUMN study_plans.estimated_completion IS 'When the plan should be completed';
COMMENT ON COLUMN study_plans.priority IS 'Priority level for the study plan';
COMMENT ON COLUMN study_plans.completed IS 'Whether the plan has been completed';
