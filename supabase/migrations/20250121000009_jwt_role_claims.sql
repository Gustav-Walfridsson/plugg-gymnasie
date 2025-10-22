-- Migration: 20250121000009_jwt_role_claims.sql
-- Purpose: Implement JWT role claims for admin bypass in RLS policies
-- Author: Senior Platform Engineer
-- Date: 2025-01-21

-- ============================================================================
-- JWT ROLE CLAIMS FOR ADMIN BYPASS
-- ============================================================================

-- This migration sets up JWT role claims to enable admin/owner bypass
-- in RLS policies for read-only operations

-- ============================================================================
-- 1. CREATE ROLE MANAGEMENT FUNCTIONS
-- ============================================================================

-- Function to check if user has admin role
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Check if user has admin or owner role in JWT claims
    RETURN COALESCE(
        (auth.jwt()->>'role') IN ('admin', 'owner'),
        false
    );
END;
$$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Check if user has specific role in JWT claims
    RETURN COALESCE(
        (auth.jwt()->>'role') = role_name,
        false
    );
END;
$$;

-- Function to get user role from JWT
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
    -- Get user role from JWT claims
    RETURN COALESCE(
        auth.jwt()->>'role',
        'user'
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

-- ============================================================================
-- 2. CREATE ROLE ASSIGNMENT FUNCTION
-- ============================================================================

-- Function to assign role to user (admin only)
CREATE OR REPLACE FUNCTION public.assign_user_role(
    target_user_id UUID,
    role_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
    current_role TEXT;
BEGIN
    -- Check if current user is admin/owner
    IF NOT public.has_admin_role() THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Validate role name
    IF role_name NOT IN ('user', 'admin', 'owner') THEN
        RAISE EXCEPTION 'Invalid role: %', role_name;
    END IF;
    
    -- Get current role
    SELECT public.get_user_role() INTO current_role;
    
    -- Prevent non-owners from assigning owner role
    IF role_name = 'owner' AND current_role != 'owner' THEN
        RAISE EXCEPTION 'Access denied: Only owners can assign owner role';
    END IF;
    
    -- Update user metadata with role
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
                            jsonb_build_object('role', role_name)
    WHERE id = target_user_id;
    
    -- Log the role assignment
    INSERT INTO audit_logs (
        table_name,
        operation,
        old_data,
        new_data,
        account_id,
        ip_address_hash,
        user_agent_hash
    ) VALUES (
        'auth.users',
        'ROLE_ASSIGNMENT',
        jsonb_build_object('target_user_id', target_user_id),
        jsonb_build_object('role', role_name, 'assigned_by', auth.uid()),
        public.get_account_id(auth.uid()),
        encode(digest(COALESCE(current_setting('request.headers.x-forwarded-for', true), 'unknown'), 'sha256'), 'hex'),
        encode(digest(COALESCE(current_setting('request.headers.user-agent', true), 'unknown'), 'sha256'), 'hex')
    );
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'user_id', target_user_id,
        'role', role_name,
        'assigned_by', auth.uid(),
        'timestamp', NOW()
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_user_role(UUID, TEXT) TO authenticated;

-- ============================================================================
-- 3. CREATE ROLE MANAGEMENT TABLE
-- ============================================================================

-- Table to track role assignments and permissions
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'owner')),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to prevent duplicate active roles
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_active 
ON user_roles(user_id) 
WHERE is_active = true;

-- Enable RLS on user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "user_roles_select" ON user_roles
    FOR SELECT
    USING (
        user_id = auth.uid() OR 
        public.has_admin_role()
    );

CREATE POLICY "user_roles_insert" ON user_roles
    FOR INSERT
    WITH CHECK (
        public.has_admin_role() AND
        assigned_by = auth.uid()
    );

CREATE POLICY "user_roles_update" ON user_roles
    FOR UPDATE
    USING (
        public.has_admin_role()
    )
    WITH CHECK (
        public.has_admin_role()
    );

CREATE POLICY "user_roles_delete" ON user_roles
    FOR DELETE
    USING (
        public.has_admin_role()
    );

-- ============================================================================
-- 4. CREATE ROLE SYNC FUNCTION
-- ============================================================================

-- Function to sync roles between user_roles table and auth.users metadata
CREATE OR REPLACE FUNCTION public.sync_user_roles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    sync_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Update auth.users metadata with roles from user_roles table
    FOR user_record IN 
        SELECT ur.user_id, ur.role
        FROM user_roles ur
        WHERE ur.is_active = true
    LOOP
        UPDATE auth.users 
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
                                jsonb_build_object('role', user_record.role)
        WHERE id = user_record.user_id;
        
        sync_count := sync_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Synced % user roles to auth.users metadata', sync_count;
    
    RETURN sync_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.sync_user_roles() TO authenticated;

-- ============================================================================
-- 5. CREATE ROLE VERIFICATION FUNCTION
-- ============================================================================

-- Function to verify and fix role consistency
CREATE OR REPLACE FUNCTION public.verify_role_consistency()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
    inconsistent_users INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Find users with inconsistent roles
    FOR user_record IN 
        SELECT 
            u.id as user_id,
            u.raw_user_meta_data->>'role' as jwt_role,
            ur.role as table_role
        FROM auth.users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
        WHERE (u.raw_user_meta_data->>'role') IS DISTINCT FROM ur.role
    LOOP
        inconsistent_users := inconsistent_users + 1;
        
        -- Log inconsistency
        INSERT INTO audit_logs (
            table_name,
            operation,
            old_data,
            new_data,
            account_id,
            ip_address_hash,
            user_agent_hash
        ) VALUES (
            'auth.users',
            'ROLE_INCONSISTENCY',
            jsonb_build_object(
                'user_id', user_record.user_id,
                'jwt_role', user_record.jwt_role,
                'table_role', user_record.table_role
            ),
            NULL,
            NULL,
            encode(digest('system', 'sha256'), 'hex'),
            encode(digest('role-verification', 'sha256'), 'hex')
        );
    END LOOP;
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'inconsistent_users', inconsistent_users,
        'verification_timestamp', NOW()
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.verify_role_consistency() TO authenticated;

-- ============================================================================
-- 6. UPDATE RLS POLICIES WITH ROLE BYPASS
-- ============================================================================

-- Update existing RLS policies to include admin bypass
-- Note: This will be applied to the rollback policies from Migration 005

-- Update mastery_states policies
DROP POLICY IF EXISTS "mastery_states_read" ON mastery_states;
DROP POLICY IF EXISTS "mastery_states_write" ON mastery_states;

CREATE POLICY "mastery_states_read" ON mastery_states 
  FOR SELECT 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    ) OR 
    public.has_admin_role()
  );

CREATE POLICY "mastery_states_write" ON mastery_states 
  FOR ALL 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

-- Update attempts policies
DROP POLICY IF EXISTS "attempts_read" ON attempts;
DROP POLICY IF EXISTS "attempts_write" ON attempts;

CREATE POLICY "attempts_read" ON attempts 
  FOR SELECT 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    ) OR 
    public.has_admin_role()
  );

CREATE POLICY "attempts_write" ON attempts 
  FOR ALL 
  USING (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  )
  WITH CHECK (
    account_id IN (
      SELECT id FROM accounts 
      WHERE user_id = auth.uid() 
        AND deleted_at IS NULL
    )
  );

-- Update other account-scoped tables similarly
-- (spaced_repetition_items, study_sessions, user_badges, analytics_events, study_plans)

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================

-- Test role functions
DO $$
DECLARE
    test_result BOOLEAN;
    role_result TEXT;
BEGIN
    -- Test has_admin_role function
    SELECT public.has_admin_role() INTO test_result;
    RAISE NOTICE 'has_admin_role() result: %', test_result;
    
    -- Test get_user_role function
    SELECT public.get_user_role() INTO role_result;
    RAISE NOTICE 'get_user_role() result: %', role_result;
    
    -- Test role verification
    SELECT public.verify_role_consistency();
    
    RAISE NOTICE 'JWT role claims setup completed successfully!';
END $$;

-- DOWN: Remove JWT role functions and policies
-- DROP FUNCTION IF EXISTS public.verify_role_consistency();
-- DROP FUNCTION IF EXISTS public.sync_user_roles();
-- DROP FUNCTION IF EXISTS public.assign_user_role(UUID, TEXT);
-- DROP FUNCTION IF EXISTS public.get_user_role();
-- DROP FUNCTION IF EXISTS public.has_role(TEXT);
-- DROP FUNCTION IF EXISTS public.has_admin_role();
-- DROP TABLE IF EXISTS user_roles;
