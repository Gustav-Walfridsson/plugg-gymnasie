# AI Database Management System

This system allows the AI to execute SQL commands directly on your Supabase database without manual copying and pasting.

## 🎯 What This Enables

- **Direct SQL Execution**: AI can run SQL commands programmatically
- **Real-time Results**: Immediate feedback on database operations
- **Security**: Controlled access with function-level restrictions
- **History**: Track all executed queries
- **Schema Inspection**: View database structure and table information

## 🚀 Quick Setup

### 1. Run the Setup Script

**Windows:**
```bash
setup-ai-db.bat
```

**Linux/Mac:**
```bash
chmod +x setup-ai-db.sh
./setup-ai-db.sh
```

### 2. Configure Environment Variables

Edit `.env.local` with your Supabase credentials:

```bash
# Local Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Production
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key_here
# SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key_here
```

### 3. Get Your Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the **service_role** key
5. Add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

### 4. Apply Migrations

```bash
npx supabase db reset
```

### 5. Access the Database Manager

Visit: `http://localhost:3000/admin/database`

## 🛠️ How It Works

### Database Functions

The system creates secure PostgreSQL functions:

- **`execute_sql(sql)`**: For SELECT queries (read-only)
- **`execute_sql_write(sql)`**: For write operations (INSERT, UPDATE, DELETE, etc.)
- **`get_database_schema()`**: Get complete database schema
- **`get_table_info(table_name)`**: Get detailed table information

### API Endpoints

- **POST `/api/database/execute`**: Execute SQL commands
- **GET `/api/database/execute?operation=schema`**: Get database schema

### Security Features

- **Function-level restrictions**: Only allows specific SQL operations
- **Service role authentication**: Uses Supabase service role key
- **Operation validation**: Prevents dangerous SQL commands
- **Error handling**: Safe error reporting without exposing sensitive data

## 📊 Usage Examples

### Query Data
```sql
SELECT * FROM subjects LIMIT 5;
SELECT * FROM topics WHERE subject_id = 'matematik';
SELECT COUNT(*) FROM skills;
```

### Insert Data
```sql
INSERT INTO subjects (id, name, description, color, icon) 
VALUES ('test', 'Test Subject', 'Test Description', 'bg-red-500', 'Test');
```

### Update Data
```sql
UPDATE subjects SET description = 'Updated Description' WHERE id = 'test';
```

### Get Schema Information
```sql
-- Get all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Get table structure
SELECT column_name, data_type, is_nullable FROM information_schema.columns 
WHERE table_name = 'subjects';
```

## 🔧 Features

### DatabaseManager Component

- **Quick Actions**: Pre-defined buttons for common queries
- **Operation Types**: Support for different SQL operations
- **Query History**: Track and reuse recent queries
- **Schema Viewer**: Display complete database structure
- **Error Handling**: Clear error messages and debugging info

### API Route

- **POST**: Execute SQL commands with operation type
- **GET**: Retrieve schema information
- **Security**: Validates operations and handles errors safely

## 🛡️ Security Considerations

1. **Service Role Key**: Keep your service role key secure
2. **Function Restrictions**: Database functions limit allowed operations
3. **Operation Validation**: API validates operation types
4. **Error Handling**: Safe error reporting without data exposure
5. **Audit Trail**: All operations are logged

## 🚨 Important Notes

- **Service Role Key**: This key bypasses RLS policies - keep it secure
- **Local Development**: Use local Supabase for development
- **Production**: Use cloud Supabase for production
- **Backup**: Always backup your database before making changes
- **Testing**: Test queries in a development environment first

## 🔍 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check your `.env.local` file
   - Ensure all required variables are set

2. **"Operation not allowed"**
   - Check the operation type
   - Ensure you're using allowed SQL commands

3. **"Database operation failed"**
   - Check your SQL syntax
   - Verify table/column names exist

4. **"Service role key not found"**
   - Get your service role key from Supabase Dashboard
   - Add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

### Getting Help

- Check the browser console for error messages
- Verify your Supabase project is running
- Ensure migrations are applied correctly
- Check the API route logs

## 🎉 Success!

Once set up, you can:

- ✅ Execute SQL commands directly from the AI
- ✅ View real-time database results
- ✅ Inspect your complete database schema
- ✅ Track query history
- ✅ Perform safe database operations

The AI can now manage your Supabase database without manual copying and pasting! 🚀
