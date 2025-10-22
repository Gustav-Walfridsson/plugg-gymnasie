-- Migration 002: Accounts and Auth
-- Create accounts table and handle_new_user() trigger

-- Create accounts table (1:1 with auth.users)
CREATE TABLE accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    level integer NOT NULL DEFAULT 1,
    total_xp integer NOT NULL DEFAULT 0,
    study_streak integer NOT NULL DEFAULT 0,
    preferences jsonb NOT NULL DEFAULT '{"darkMode": true, "notifications": true, "language": "sv"}',
    last_active timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz NULL, -- soft delete
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT accounts_user_id_unique UNIQUE (user_id),
    CONSTRAINT accounts_level_positive CHECK (level >= 1),
    CONSTRAINT accounts_total_xp_non_negative CHECK (total_xp >= 0),
    CONSTRAINT accounts_study_streak_non_negative CHECK (study_streak >= 0),
    CONSTRAINT accounts_preferences_valid CHECK (
        preferences ? 'darkMode' AND 
        preferences ? 'notifications' AND 
        preferences ? 'language' AND
        jsonb_typeof(preferences->'darkMode') = 'boolean' AND
        jsonb_typeof(preferences->'notifications') = 'boolean' AND
        jsonb_typeof(preferences->'language') = 'string'
    )
);

-- Create indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_deleted_at ON accounts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_accounts_last_active ON accounts(last_active DESC);

-- Add comments
COMMENT ON TABLE accounts IS 'User accounts with profile and progress metadata';
COMMENT ON COLUMN accounts.user_id IS 'Foreign key to auth.users.id';
COMMENT ON COLUMN accounts.name IS 'Display name for the user';
COMMENT ON COLUMN accounts.level IS 'User level (1-based)';
COMMENT ON COLUMN accounts.total_xp IS 'Total experience points earned';
COMMENT ON COLUMN accounts.study_streak IS 'Current study streak in days';
COMMENT ON COLUMN accounts.preferences IS 'User preferences (darkMode, notifications, language)';
COMMENT ON COLUMN accounts.last_active IS 'Last time user was active';
COMMENT ON COLUMN accounts.deleted_at IS 'Soft delete timestamp (NULL = active)';

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.accounts (user_id, name, preferences)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        jsonb_build_object(
            'darkMode', true,
            'notifications', true,
            'language', 'sv'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create account on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
