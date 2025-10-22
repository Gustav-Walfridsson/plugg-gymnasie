import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { sql, operation = 'query' } = await request.json()
    
    // Validate input
    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'SQL query is required' 
      }, { status: 400 })
    }

    // Security: Only allow certain operations
    const allowedOperations = ['query', 'insert', 'update', 'delete', 'create', 'alter', 'drop', 'schema', 'table_info']
    if (!allowedOperations.includes(operation.toLowerCase())) {
      return NextResponse.json({ 
        success: false, 
        error: `Operation '${operation}' not allowed. Allowed: ${allowedOperations.join(', ')}` 
      }, { status: 403 })
    }

    // Create service role client (bypasses RLS for admin operations)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    let result
    
    try {
      if (operation.toLowerCase() === 'query') {
        // For SELECT queries
        result = await supabase.rpc('execute_sql', { sql })
      } else if (operation.toLowerCase() === 'schema') {
        // Get database schema
        result = await supabase.rpc('get_database_schema')
      } else if (operation.toLowerCase() === 'table_info') {
        // Get table information
        result = await supabase.rpc('get_table_info', { table_name: sql })
      } else {
        // For write operations (INSERT, UPDATE, DELETE, etc.)
        result = await supabase.rpc('execute_sql_write', { sql })
      }

      if (result.error) {
        return NextResponse.json({ 
          success: false, 
          error: result.error,
          sql: sql,
          operation: operation
        }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true, 
        data: result.data, 
        sql: sql,
        operation: operation,
        timestamp: new Date().toISOString()
      })
      
    } catch (dbError: any) {
      return NextResponse.json({ 
        success: false, 
        error: dbError.message || 'Database operation failed',
        sql: sql,
        operation: operation
      }, { status: 500 })
    }
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

// Handle GET requests for schema information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operation = searchParams.get('operation') || 'schema'
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    let result
    
    if (operation === 'schema') {
      result = await supabase.rpc('get_database_schema')
    } else if (operation === 'tables') {
      result = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .not('table_name', 'like', 'pg_%')
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid operation' 
      }, { status: 400 })
    }

    if (result.error) {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      data: result.data,
      operation: operation,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
