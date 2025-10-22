-- Apply AI Database Functions directly
-- This script adds the AI database management functions to your existing database

-- Function for SELECT queries (read-only operations)
CREATE OR REPLACE FUNCTION execute_sql(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    rec record;
    rows jsonb[] := '{}';
BEGIN
    -- Security: Only allow SELECT queries and safe read operations
    IF NOT (
        sql ILIKE 'SELECT%' OR 
        sql ILIKE 'WITH%' OR 
        sql ILIKE 'SHOW%' OR 
        sql ILIKE 'DESCRIBE%' OR
        sql ILIKE 'EXPLAIN%'
    ) THEN
        RAISE EXCEPTION 'Only SELECT queries are allowed in execute_sql. Received: %', sql;
    END IF;
    
    -- Execute query and convert to JSON
    FOR rec IN EXECUTE sql LOOP
        rows := array_append(rows, to_jsonb(rec));
    END LOOP;
    
    RETURN to_jsonb(rows);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM, 'sql', sql);
END;
$$;

-- Function for write operations (INSERT, UPDATE, DELETE, etc.)
CREATE OR REPLACE FUNCTION execute_sql_write(sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    affected_rows integer;
BEGIN
    -- Security: Only allow certain write operations
    IF NOT (
        sql ILIKE 'INSERT%' OR 
        sql ILIKE 'UPDATE%' OR 
        sql ILIKE 'DELETE%' OR 
        sql ILIKE 'CREATE%' OR 
        sql ILIKE 'ALTER%' OR 
        sql ILIKE 'DROP%' OR
        sql ILIKE 'GRANT%' OR
        sql ILIKE 'REVOKE%' OR
        sql ILIKE 'COMMENT%'
    ) THEN
        RAISE EXCEPTION 'Operation not allowed in execute_sql_write. Received: %', sql;
    END IF;
    
    -- Execute the SQL
    EXECUTE sql;
    
    -- Get affected rows count
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'affected_rows', affected_rows,
        'message', 'Operation completed successfully',
        'sql', sql
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM, 'sql', sql);
END;
$$;

-- Function to get database schema information
CREATE OR REPLACE FUNCTION get_database_schema()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'table_name', table_name,
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default
        )
    ) INTO result
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name NOT LIKE 'pg_%'
    ORDER BY table_name, ordinal_position;
    
    RETURN result;
END;
$$;

-- Function to get table information
CREATE OR REPLACE FUNCTION get_table_info(table_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'column_name', column_name,
            'data_type', data_type,
            'is_nullable', is_nullable,
            'column_default', column_default,
            'character_maximum_length', character_maximum_length
        )
    ) INTO result
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = $1
    ORDER BY ordinal_position;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql_write(text) TO service_role;
GRANT EXECUTE ON FUNCTION get_database_schema() TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_info(text) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION execute_sql(text) IS 'Execute SELECT queries safely for AI database management';
COMMENT ON FUNCTION execute_sql_write(text) IS 'Execute write operations safely for AI database management';
COMMENT ON FUNCTION get_database_schema() IS 'Get complete database schema information';
COMMENT ON FUNCTION get_table_info(text) IS 'Get detailed information about a specific table';
