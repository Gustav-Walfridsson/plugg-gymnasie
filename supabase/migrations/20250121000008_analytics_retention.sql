-- Migration: 20250121000008_analytics_retention.sql
-- Purpose: Set up analytics retention policy and cleanup functions
-- Author: Senior Platform Engineer
-- Date: 2025-01-21

-- ============================================================================
-- ANALYTICS RETENTION POLICY (90-day cleanup)
-- ============================================================================

-- This migration sets up automatic cleanup of old analytics data
-- to comply with GDPR and reduce storage costs

-- ============================================================================
-- 1. CREATE ANALYTICS CLEANUP FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_date TIMESTAMPTZ;
BEGIN
    -- Set cutoff date to 90 days ago
    cutoff_date := NOW() - INTERVAL '90 days';
    
    -- Delete old analytics events
    DELETE FROM analytics_events 
    WHERE created_at < cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO audit_logs (
        table_name,
        operation,
        old_data,
        new_data,
        account_id,
        ip_address_hash,
        user_agent_hash
    ) VALUES (
        'analytics_events',
        'CLEANUP',
        jsonb_build_object('deleted_count', deleted_count, 'cutoff_date', cutoff_date),
        NULL,
        NULL, -- System operation
        encode(digest('system', 'sha256'), 'hex'), -- System IP hash
        encode(digest('analytics-cleanup', 'sha256'), 'hex') -- System user agent hash
    );
    
    RAISE NOTICE 'Analytics cleanup completed: % events deleted (older than %)', deleted_count, cutoff_date;
END;
$$;

-- Grant execute permission to authenticated users (for manual cleanup)
GRANT EXECUTE ON FUNCTION public.cleanup_old_analytics() TO authenticated;

-- ============================================================================
-- 2. CREATE ANALYTICS RETENTION POLICY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_retention_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name TEXT NOT NULL UNIQUE,
    retention_days INTEGER NOT NULL DEFAULT 90,
    last_cleanup TIMESTAMPTZ,
    cleanup_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default retention policy
INSERT INTO analytics_retention_policy (policy_name, retention_days, is_active)
VALUES ('default_analytics_retention', 90, true)
ON CONFLICT (policy_name) DO UPDATE SET
    retention_days = EXCLUDED.retention_days,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================================================
-- 3. CREATE ENHANCED CLEANUP FUNCTION WITH POLICY SUPPORT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_analytics_with_policy()
RETURNS TABLE(
    policy_name TEXT,
    deleted_count INTEGER,
    cutoff_date TIMESTAMPTZ,
    cleanup_duration INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    policy_record RECORD;
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    deleted_count INTEGER;
    cutoff_date TIMESTAMPTZ;
BEGIN
    start_time := NOW();
    
    -- Get active retention policies
    FOR policy_record IN 
        SELECT policy_name, retention_days 
        FROM analytics_retention_policy 
        WHERE is_active = true
    LOOP
        cutoff_date := NOW() - (policy_record.retention_days || ' days')::INTERVAL;
        
        -- Delete old analytics events based on policy
        DELETE FROM analytics_events 
        WHERE created_at < cutoff_date;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        
        -- Update policy statistics
        UPDATE analytics_retention_policy 
        SET 
            last_cleanup = NOW(),
            cleanup_count = cleanup_count + deleted_count,
            updated_at = NOW()
        WHERE policy_name = policy_record.policy_name;
        
        -- Log the cleanup
        INSERT INTO audit_logs (
            table_name,
            operation,
            old_data,
            new_data,
            account_id,
            ip_address_hash,
            user_agent_hash
        ) VALUES (
            'analytics_events',
            'POLICY_CLEANUP',
            jsonb_build_object(
                'policy_name', policy_record.policy_name,
                'retention_days', policy_record.retention_days,
                'deleted_count', deleted_count,
                'cutoff_date', cutoff_date
            ),
            NULL,
            NULL, -- System operation
            encode(digest('system', 'sha256'), 'hex'),
            encode(digest('analytics-policy-cleanup', 'sha256'), 'hex')
        );
        
        -- Return cleanup results
        policy_name := policy_record.policy_name;
        deleted_count := deleted_count;
        cutoff_date := cutoff_date;
        cleanup_duration := NOW() - start_time;
        
        RETURN NEXT;
    END LOOP;
    
    end_time := NOW();
    
    RAISE NOTICE 'Analytics cleanup with policies completed in %', end_time - start_time;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.cleanup_analytics_with_policy() TO authenticated;

-- ============================================================================
-- 4. CREATE ANALYTICS STATISTICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW analytics_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as event_count,
    COUNT(DISTINCT account_id) as unique_users,
    COUNT(DISTINCT event_type) as unique_event_types
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant access to the view
GRANT SELECT ON analytics_stats TO authenticated;

-- ============================================================================
-- 5. CREATE MANUAL CLEANUP ENDPOINT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.manual_analytics_cleanup(
    retention_days_param INTEGER DEFAULT 90
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cutoff_date TIMESTAMPTZ;
    deleted_count INTEGER;
    result JSONB;
BEGIN
    -- Validate input
    IF retention_days_param < 1 OR retention_days_param > 365 THEN
        RAISE EXCEPTION 'Retention days must be between 1 and 365, got %', retention_days_param;
    END IF;
    
    cutoff_date := NOW() - (retention_days_param || ' days')::INTERVAL;
    
    -- Delete old analytics events
    DELETE FROM analytics_events 
    WHERE created_at < cutoff_date;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the manual cleanup
    INSERT INTO audit_logs (
        table_name,
        operation,
        old_data,
        new_data,
        account_id,
        ip_address_hash,
        user_agent_hash
    ) VALUES (
        'analytics_events',
        'MANUAL_CLEANUP',
        jsonb_build_object(
            'retention_days', retention_days_param,
            'deleted_count', deleted_count,
            'cutoff_date', cutoff_date
        ),
        NULL,
        NULL, -- System operation
        encode(digest('system', 'sha256'), 'hex'),
        encode(digest('manual-analytics-cleanup', 'sha256'), 'hex')
    );
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'retention_days', retention_days_param,
        'cutoff_date', cutoff_date,
        'cleanup_timestamp', NOW()
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.manual_analytics_cleanup(INTEGER) TO authenticated;

-- ============================================================================
-- 6. CREATE CRON JOB SETUP (for Supabase Edge Functions)
-- ============================================================================

-- Note: This creates the database functions needed for cron jobs
-- The actual cron job will be set up in Supabase Dashboard or via Edge Functions

CREATE OR REPLACE FUNCTION public.setup_analytics_cron()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- This function is a placeholder for cron job setup
    -- The actual cron job should be configured in Supabase Dashboard:
    -- 1. Go to Database > Functions
    -- 2. Create a new Edge Function for analytics cleanup
    -- 3. Set up a cron trigger to run daily at 2 AM UTC
    
    RETURN 'Analytics cron setup instructions:
    
    1. Create Edge Function: analytics-cleanup
    2. Set cron schedule: "0 2 * * *" (daily at 2 AM UTC)
    3. Function should call: SELECT public.cleanup_analytics_with_policy();
    
    Example Edge Function code:
    ```typescript
    import { createClient } from "@supabase/supabase-js";
    
    Deno.serve(async (req) => {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      const { data, error } = await supabase.rpc("cleanup_analytics_with_policy");
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json" },
      });
    });
    ```';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.setup_analytics_cron() TO authenticated;

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Test the cleanup function
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Test manual cleanup with 1 day retention (should delete nothing if no old data)
    SELECT * INTO test_result FROM public.manual_analytics_cleanup(1);
    
    RAISE NOTICE 'Manual cleanup test result: %', test_result;
    
    -- Test policy-based cleanup
    SELECT * INTO test_result FROM public.cleanup_analytics_with_policy();
    
    RAISE NOTICE 'Policy cleanup test result: %', test_result;
    
    RAISE NOTICE 'Analytics retention setup completed successfully!';
END $$;

-- DOWN: Remove analytics retention functions and policies
-- DROP FUNCTION IF EXISTS public.setup_analytics_cron();
-- DROP FUNCTION IF EXISTS public.manual_analytics_cleanup(INTEGER);
-- DROP FUNCTION IF EXISTS public.cleanup_analytics_with_policy();
-- DROP FUNCTION IF EXISTS public.cleanup_old_analytics();
-- DROP VIEW IF EXISTS analytics_stats;
-- DROP TABLE IF EXISTS analytics_retention_policy;
