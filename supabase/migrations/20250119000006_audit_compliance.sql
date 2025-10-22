-- Migration 006: Audit Logs and GDPR Functions
-- Create audit_logs table and GDPR compliance functions

-- Create audit_logs table
CREATE TABLE audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id uuid NULL REFERENCES accounts(id) ON DELETE SET NULL,
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id text NULL,
    metadata jsonb NOT NULL DEFAULT '{}',
    ip_address inet NULL,
    user_agent text NULL,
    timestamp timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for audit_logs
CREATE INDEX idx_audit_logs_account_id ON audit_logs(account_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_account_timestamp ON audit_logs(account_id, timestamp DESC);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance and security monitoring';
COMMENT ON COLUMN audit_logs.account_id IS 'User account (NULL for system events)';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., account.created, data.exported)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., account, mastery_state)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context data as JSON';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string from the request';

-- Create GDPR data export function
CREATE OR REPLACE FUNCTION export_user_data(user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    account_record record;
BEGIN
    -- Get account information
    SELECT * INTO account_record FROM accounts WHERE user_id = user_uuid;
    
    IF account_record IS NULL THEN
        RETURN jsonb_build_object('error', 'User not found');
    END IF;
    
    -- Build comprehensive data export
    SELECT jsonb_build_object(
        'account', row_to_json(account_record),
        'mastery_states', (
            SELECT jsonb_agg(row_to_json(ms.*)) 
            FROM mastery_states ms 
            WHERE ms.account_id = account_record.id
        ),
        'attempts', (
            SELECT jsonb_agg(row_to_json(att.*)) 
            FROM attempts att 
            WHERE att.account_id = account_record.id
        ),
        'spaced_repetition_items', (
            SELECT jsonb_agg(row_to_json(sr.*)) 
            FROM spaced_repetition_items sr 
            WHERE sr.account_id = account_record.id
        ),
        'study_sessions', (
            SELECT jsonb_agg(row_to_json(ss.*)) 
            FROM study_sessions ss 
            WHERE ss.account_id = account_record.id
        ),
        'user_badges', (
            SELECT jsonb_agg(row_to_json(ub.*)) 
            FROM user_badges ub 
            WHERE ub.account_id = account_record.id
        ),
        'analytics_events', (
            SELECT jsonb_agg(row_to_json(ae.*)) 
            FROM analytics_events ae 
            WHERE ae.account_id = account_record.id
        ),
        'study_plans', (
            SELECT jsonb_agg(row_to_json(sp.*)) 
            FROM study_plans sp 
            WHERE sp.account_id = account_record.id
        ),
        'exported_at', now(),
        'exported_by', user_uuid
    ) INTO result;
    
    -- Log the export action
    INSERT INTO audit_logs (account_id, action, resource_type, metadata, timestamp)
    VALUES (
        account_record.id,
        'data.exported',
        'account',
        jsonb_build_object('user_id', user_uuid, 'export_timestamp', now()),
        now()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create soft delete function
CREATE OR REPLACE FUNCTION soft_delete_account(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
    account_record record;
BEGIN
    -- Get account information
    SELECT * INTO account_record FROM accounts WHERE user_id = user_uuid;
    
    IF account_record IS NULL THEN
        RETURN false;
    END IF;
    
    -- Soft delete the account
    UPDATE accounts 
    SET 
        deleted_at = now(),
        updated_at = now()
    WHERE user_id = user_uuid;
    
    -- Log the soft delete action
    INSERT INTO audit_logs (account_id, action, resource_type, metadata, timestamp)
    VALUES (
        account_record.id,
        'account.soft_deleted',
        'account',
        jsonb_build_object('user_id', user_uuid, 'deleted_at', now()),
        now()
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create hard delete function (admin only)
CREATE OR REPLACE FUNCTION hard_delete_account(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
    account_record record;
    user_role_value text;
BEGIN
    -- Check if user has admin/owner role
    SELECT auth.jwt()->>'role' INTO user_role_value;
    
    IF user_role_value NOT IN ('admin', 'owner') THEN
        RAISE EXCEPTION 'Insufficient privileges for hard delete';
    END IF;
    
    -- Get account information
    SELECT * INTO account_record FROM accounts WHERE user_id = user_uuid;
    
    IF account_record IS NULL THEN
        RETURN false;
    END IF;
    
    -- Log the hard delete action before deletion
    INSERT INTO audit_logs (account_id, action, resource_type, metadata, timestamp)
    VALUES (
        account_record.id,
        'account.hard_deleted',
        'account',
        jsonb_build_object(
            'user_id', user_uuid, 
            'deleted_at', now(),
            'deleted_by', auth.uid()
        ),
        now()
    );
    
    -- Hard delete the account (cascade will handle related records)
    DELETE FROM accounts WHERE user_id = user_uuid;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get skills due for review
CREATE OR REPLACE FUNCTION get_skills_due_for_review(user_uuid uuid)
RETURNS TABLE (skill_id text, next_review timestamptz, ease_factor numeric) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.skill_id, 
        sr.next_review, 
        sr.ease_factor
    FROM spaced_repetition_items sr
    JOIN accounts a ON a.id = sr.account_id
    WHERE a.user_id = user_uuid
        AND sr.next_review <= NOW()
    ORDER BY sr.next_review ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create materialized view for user progress summary
CREATE MATERIALIZED VIEW user_progress_summary AS
SELECT 
    a.id AS account_id,
    a.user_id,
    a.name,
    a.level,
    a.total_xp,
    a.study_streak,
    COUNT(ms.id) AS total_skills_tracked,
    COUNT(ms.id) FILTER (WHERE ms.is_mastered) AS skills_mastered,
    ROUND(AVG(ms.probability), 3) AS avg_mastery_probability,
    COUNT(DISTINCT att.skill_id) AS skills_practiced,
    COUNT(DISTINCT ss.id) AS total_sessions,
    COALESCE(SUM(ss.total_time), 0) AS total_study_time_ms,
    COUNT(ub.id) AS badges_earned,
    a.last_active,
    a.created_at
FROM accounts a
LEFT JOIN mastery_states ms ON ms.account_id = a.id
LEFT JOIN attempts att ON att.account_id = a.id
LEFT JOIN study_sessions ss ON ss.account_id = a.id
LEFT JOIN user_badges ub ON ub.account_id = a.id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.user_id, a.name, a.level, a.total_xp, a.study_streak, a.last_active, a.created_at;

-- Create unique index on materialized view
CREATE UNIQUE INDEX ON user_progress_summary (account_id);

-- Add comments for functions
COMMENT ON FUNCTION export_user_data(uuid) IS 'Exports all user data for GDPR compliance';
COMMENT ON FUNCTION soft_delete_account(uuid) IS 'Soft deletes user account (30-day retention)';
COMMENT ON FUNCTION hard_delete_account(uuid) IS 'Hard deletes user account (admin/owner only)';
COMMENT ON FUNCTION get_skills_due_for_review(uuid) IS 'Gets skills due for spaced repetition review';
COMMENT ON MATERIALIZED VIEW user_progress_summary IS 'Aggregated user progress statistics';
