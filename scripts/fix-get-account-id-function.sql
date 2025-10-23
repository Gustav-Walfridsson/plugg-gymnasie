-- First, drop the existing function with the wrong parameter name
DROP FUNCTION IF EXISTS get_account_id(uuid);

-- Then create the function with the correct parameter name
CREATE OR REPLACE FUNCTION get_account_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (
        SELECT id 
        FROM accounts 
        WHERE accounts.user_id = get_account_id.user_id 
        AND deleted_at IS NULL
        LIMIT 1
    );
END;
$$;
