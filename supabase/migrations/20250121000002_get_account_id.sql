-- Migration: 20250121000002_get_account_id.sql
-- Purpose: Create hardened get_account_id() helper function for RLS policies
-- Author: Senior Platform Engineer
-- Date: 2025-01-21

-- UP: Create hardened helper function
CREATE OR REPLACE FUNCTION public.get_account_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.accounts 
    WHERE user_id = user_uuid 
      AND deleted_at IS NULL
    LIMIT 1
  );
END;
$$;

-- Grant execute permission to authenticated users only
GRANT EXECUTE ON FUNCTION public.get_account_id(uuid) TO authenticated;

-- Create unique index for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_user_id 
ON public.accounts(user_id);

-- Add comment for documentation
COMMENT ON FUNCTION public.get_account_id(uuid) IS 
  'Returns account.id for given auth.users.id. Only active accounts (deleted_at IS NULL). Used in RLS policies.';

-- DOWN: Rollback
-- DROP FUNCTION IF EXISTS public.get_account_id(uuid);
-- DROP INDEX IF EXISTS idx_accounts_user_id;
