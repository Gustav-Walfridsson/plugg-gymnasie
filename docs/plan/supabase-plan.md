# Production-Grade Supabase Setup Plan
**Hardened Implementation Plan for Account-Scoped RLS**

**Generated:** Monday, October 20, 2025 (Revised)  
**Project:** Plugg Bot 1  
**Framework:** Next.js 15.5.5 + React 18 + TypeScript + Supabase JS Client 2.75.1

---

## Executive Summary

This plan implements production-grade Supabase with **strict per-account RLS**, soft-delete awareness, performance indexes, and GDPR compliance. Current state: schema 80% complete, RLS policies need hardening, 450+ practice items stuck in JSON, mock data hiding failures.

**Critical Path:** Fix account_id derivation → Harden RLS → Add indexes → Migrate content → Wire analytics

---

## Do/Don't Checklist

### ✅ DO
- Always derive `account_id` from `accounts` table (never use `auth.uid()` as account_id)
- Include `accounts.deleted_at IS NULL` in every RLS USING/WITH CHECK clause
- Use `get_account_id(auth.uid())` helper in policies (not subqueries)
- Separate policies: `FOR SELECT`, `FOR INSERT`, `FOR UPDATE`, `FOR DELETE`
- Add `WITH CHECK` clauses to INSERT/UPDATE policies
- Keep service role key **server-side only** (Route Handlers, never client)
- Create indexes with `CONCURRENTLY` on production
- Test RLS with User A/B isolation before deploying
- Add rollback SQL for every migration

### ❌ DON'T
- Don't use `FOR ALL` policies (splits USING/WITH CHECK)
- Don't allow admin/owner to **write** cross-account data (read-only bypass)
- Don't ship service role key to client code
- Don't skip soft-delete guards in RLS policies
- Don't create indexes in transactions if tables > 100k rows
- Don't store raw IPs/emails in `audit_logs` (hash or truncate)
- Don't use `auth.uid()` directly as `account_id` (it's `auth.users.id`, not `accounts.id`)

---

## 1. Current State Audit

### 1.1 Migrations Status

| Migration | Purpose | Status | Action |
|-----------|---------|--------|--------|
| `20250119000001_enums_extensions.sql` | Enums + pgcrypto | ✅ Complete | Keep |
| `20250119000002_accounts_auth.sql` | accounts + trigger | ✅ Complete | Keep |
| `20250119000003_content_schema.sql` | Content tables | ✅ Complete | Keep (canonical) |
| `20250119000004_progress_schema.sql` | Progress tables | ✅ Complete | Keep |
| `20250119000005_gamification_analytics.sql` | Badges/events | ✅ Complete | Keep |
| `20250119000006_audit_compliance.sql` | GDPR + audit_logs | ✅ Complete | Keep |
| `20250119000007_rls_policies.sql` | RLS policies | ⚠️ Needs rework | Replace with 003 |
| `20250120000001_ai_database_functions.sql` | AI execute_sql | ✅ Complete | Keep |
| **`20241220000000_create_user_progress.sql`** | **Legacy user_progress** | ⚠️ Duplicate | **Drop table** |
| **`20241220000001_create_subjects_structure.sql`** | **Duplicate content** | ⚠️ Duplicate | **Remove migration** |

**Resolution:**
- **Keep:** `20250119000003_content_schema.sql` as canonical content structure
- **Remove:** Drop `user_progress` table (replaced by `mastery_states`)
- **Document:** Mark 20241220 migrations as deprecated in migration 001

---

### 1.2 Account-Scoped Tables

**Tables WITH account_id:**
- ✅ `mastery_states` (FK → accounts, CASCADE)
- ✅ `attempts` (FK → accounts, CASCADE)
- ✅ `spaced_repetition_items` (FK → accounts, CASCADE)
- ✅ `study_sessions` (FK → accounts, CASCADE)
- ✅ `user_badges` (FK → accounts, CASCADE)
- ✅ `analytics_events` (FK → accounts, CASCADE)
- ✅ `study_plans` (FK → accounts, CASCADE)
- ✅ `audit_logs` (FK → accounts, **SET NULL** for system events)

**Content Tables (no account_id):**
- `subjects`, `topics`, `skills`, `lessons`, `items`
- RLS: authenticated users read, admin/owner write

---

### 1.3 Critical Issues Found

1. **account_id Mismatch:** Auth context sets `accountId = session.user.id` (auth.users PK) instead of `accounts.id`
2. **No Soft-Delete Guards:** RLS policies don't check `accounts.deleted_at IS NULL`
3. **FOR ALL Policies:** Combine USING/WITH CHECK, hard to audit
4. **Missing Indexes:** No composite indexes for `(account_id, skill_id)` or `(account_id, timestamp DESC)`
5. **Mock Data:** Pages use hardcoded data (weakness, review, tutor)
6. **450+ Items in JSON:** Practice content not in database

---

## 2. Implementation Plan

### Phase 1: Foundation & Cleanup

#### Migration 001: Cleanup Legacy Tables
**File:** `supabase/migrations/20250121000001_cleanup_legacy.sql`

**Purpose:** Remove duplicate/legacy tables from 2024 migrations

**UP:**
- Drop `user_progress` table (replaced by `mastery_states`)
- Add comment to flag 20241220 migrations as deprecated
- Verify no code references `user_progress`

**DOWN:**
```sql
CREATE TABLE user_progress (
  user_id uuid NOT NULL,
  skill_id text NOT NULL,
  mastery_level numeric,
  -- ... restore schema
);
```

**Risks:** Code may reference `user_progress` table  
**Mitigation:** Grep codebase for `user_progress` before running  
**Done When:** `SELECT * FROM user_progress` returns "relation does not exist"  
**Verification:**
```sql
SELECT tablename FROM pg_tables WHERE tablename = 'user_progress'; -- Should be empty
```

**Time:** 15 min

---

#### Migration 002: Hardened get_account_id() Helper
**File:** `supabase/migrations/20250121000002_get_account_id.sql`

**Purpose:** Create secure, performant account_id lookup to replace subqueries in RLS policies

**UP:**
```sql
-- Hardened helper function
CREATE OR REPLACE FUNCTION get_account_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  v_account_id UUID;
BEGIN
  -- Explicit search_path for security
  SET search_path = public;
  
  -- Get account_id for active (non-deleted) accounts only
  SELECT id INTO v_account_id 
  FROM accounts 
  WHERE user_id = user_uuid 
    AND deleted_at IS NULL
  LIMIT 1;
  
  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   STABLE 
   SET search_path = public;

-- Grant only to authenticated users (not anon)
REVOKE ALL ON FUNCTION get_account_id(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_account_id(UUID) TO authenticated;

COMMENT ON FUNCTION get_account_id(UUID) IS 
  'Returns account.id for given auth.users.id. Only active accounts (deleted_at IS NULL). Used in RLS policies.';
```

**Why SECURITY DEFINER + STABLE:**
- `SECURITY DEFINER`: Runs with definer privileges, can read accounts table
- `STABLE`: Result won't change within a transaction (enables query planner optimizations)
- `SET search_path`: Prevents search_path injection attacks
- `deleted_at IS NULL`: Ensures soft-deleted accounts are excluded

**Performance:** Replaces `account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid())` subquery with fast function call. Query planner caches result per statement.

**DOWN:**
```sql
DROP FUNCTION IF EXISTS get_account_id(UUID);
```

**Risks:** None (additive change)  
**Done When:** `SELECT get_account_id(auth.uid())` returns UUID for logged-in user  
**Verification:**
```sql
-- As authenticated user
SELECT get_account_id(auth.uid()); -- Should return accounts.id
-- As anon
SELECT get_account_id('00000000-0000-0000-0000-000000000000'::uuid); -- Should fail (no EXECUTE grant)
```

**Time:** 20 min

---

#### Migration 003: Backfill & Add Constraints
**File:** `supabase/migrations/20250121000004_backfill_and_constraints.sql`

**Purpose:** Fix historical data and add missing constraints

**UP:**
- Backfill rows where `account_id = auth.users.id` (wrong) → correct `accounts.id`
- Add `NOT NULL` constraint to `account_id` columns (where safe)
- Add `UNIQUE (account_id, skill_id)` to `mastery_states`, `spaced_repetition_items`
- Verify all FK constraints are `ON DELETE CASCADE` (except audit_logs → SET NULL)

**Steps:**
```sql
-- 1. Backfill (if any bad data exists)
UPDATE mastery_states ms
SET account_id = (SELECT id FROM accounts WHERE user_id = ms.account_id)
WHERE account_id IN (SELECT id FROM auth.users) 
  AND account_id NOT IN (SELECT id FROM accounts);

-- 2. Add NOT NULL (safe because of FK constraint)
ALTER TABLE mastery_states ALTER COLUMN account_id SET NOT NULL;
ALTER TABLE attempts ALTER COLUMN account_id SET NOT NULL;
-- ... repeat for all account-scoped tables

-- 3. Add UNIQUE constraints (prevent duplicate progress)
ALTER TABLE mastery_states 
  ADD CONSTRAINT mastery_states_account_skill_unique 
  UNIQUE (account_id, skill_id);

ALTER TABLE spaced_repetition_items 
  ADD CONSTRAINT spaced_repetition_account_skill_unique 
  UNIQUE (account_id, skill_id);

-- 4. Verify FK constraints
DO $$
DECLARE
  fk_record RECORD;
BEGIN
  FOR fk_record IN 
    SELECT tc.table_name, kcu.column_name, rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND kcu.column_name = 'account_id'
      AND tc.table_name != 'audit_logs'
  LOOP
    IF fk_record.delete_rule != 'CASCADE' THEN
      RAISE EXCEPTION 'FK on %.% should be CASCADE, found %', 
        fk_record.table_name, fk_record.column_name, fk_record.delete_rule;
    END IF;
  END LOOP;
END $$;
```

**DOWN:**
```sql
ALTER TABLE mastery_states DROP CONSTRAINT IF EXISTS mastery_states_account_skill_unique;
ALTER TABLE spaced_repetition_items DROP CONSTRAINT IF EXISTS spaced_repetition_account_skill_unique;
ALTER TABLE mastery_states ALTER COLUMN account_id DROP NOT NULL;
-- ... (not reversing backfill)
```

**Risks:** 
- UNIQUE constraint may fail if duplicate rows exist
- Backfill may take time on large tables

**Mitigation:**
- Check for duplicates before migration
- Run during low-traffic window

**Done When:** 
- All FKs to accounts are CASCADE (except audit_logs)
- UNIQUE constraints exist
- `account_id IS NOT NULL` on all rows

**Verification:**
```sql
-- Check for duplicates (should be 0)
SELECT account_id, skill_id, COUNT(*) 
FROM mastery_states 
GROUP BY account_id, skill_id 
HAVING COUNT(*) > 1;

-- Check constraints
SELECT conname, contype FROM pg_constraint WHERE conname LIKE '%account%';
```

**Time:** 25 min

---

### Phase 2: Hardened RLS Policies

#### Migration 004: Refined Per-Verb RLS Policies
**File:** `supabase/migrations/20250121000003_refine_rls_policies.sql`

**Purpose:** Replace `FOR ALL` policies with explicit per-verb policies including soft-delete awareness

**Template Policy Block (apply to all account-scoped tables):**

```sql
-- ============================================================================
-- TABLE: mastery_states (example - repeat for all account-scoped tables)
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "mastery_states_read" ON mastery_states;
DROP POLICY IF EXISTS "mastery_states_write" ON mastery_states;
DROP POLICY IF EXISTS "admin_mastery_states_read" ON mastery_states;

-- User SELECT (own data, active accounts only)
CREATE POLICY "mastery_states_select" ON mastery_states 
  FOR SELECT 
  USING (
    account_id = get_account_id(auth.uid())
  );

-- User INSERT (own data, active accounts only)
CREATE POLICY "mastery_states_insert" ON mastery_states 
  FOR INSERT 
  WITH CHECK (
    account_id = get_account_id(auth.uid())
  );

-- User UPDATE (own data, active accounts only)
CREATE POLICY "mastery_states_update" ON mastery_states 
  FOR UPDATE 
  USING (
    account_id = get_account_id(auth.uid())
  )
  WITH CHECK (
    account_id = get_account_id(auth.uid())
  );

-- User DELETE (own data, active accounts only)
CREATE POLICY "mastery_states_delete" ON mastery_states 
  FOR DELETE 
  USING (
    account_id = get_account_id(auth.uid())
  );

-- Admin/Owner SELECT (read-only bypass for all active accounts)
CREATE POLICY "admin_mastery_states_select" ON mastery_states 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE id = mastery_states.account_id 
        AND deleted_at IS NULL
    )
    AND auth.jwt()->>'role' IN ('admin', 'owner')
  );

COMMENT ON POLICY "mastery_states_select" ON mastery_states IS 
  'Users can read own mastery data (active accounts only)';
COMMENT ON POLICY "admin_mastery_states_select" ON mastery_states IS 
  'Admin/owner can read all user data (read-only bypass)';
```

**Key Improvements:**
1. **Soft-Delete Awareness:** `get_account_id()` already filters `deleted_at IS NULL`
2. **Per-Verb:** Clear separation of SELECT/INSERT/UPDATE/DELETE
3. **WITH CHECK:** Prevents inserting/updating with wrong account_id
4. **Admin Read-Only:** Admin cannot write cross-account data
5. **Explicit USING+WITH CHECK:** Both clauses present on UPDATE

**Tables to Apply Template:**
- `mastery_states`
- `attempts`
- `spaced_repetition_items`
- `study_sessions`
- `user_badges`
- `analytics_events`
- `study_plans`

**Content Tables (separate template):**
```sql
-- Authenticated users can read
CREATE POLICY "subjects_select" ON subjects 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Admin/owner can write
CREATE POLICY "subjects_write" ON subjects 
  FOR ALL 
  USING (auth.jwt()->>'role' IN ('admin', 'owner'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'owner'));
```

**DOWN:**
```sql
-- Restore old FOR ALL policies (document in migration comments)
-- Example:
CREATE POLICY "mastery_states_read" ON mastery_states FOR SELECT
  USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
CREATE POLICY "mastery_states_write" ON mastery_states FOR ALL
  USING (account_id IN (SELECT id FROM accounts WHERE user_id = auth.uid()));
```

**Risks:** 
- Policy regression may lock out users
- Admin bypass may fail if JWT role not set

**Mitigation:**
- Test with User A/B isolation before deploying
- Verify JWT includes `role` claim (see Migration 008)

**Done When:** 
- All `FOR ALL` policies replaced
- RLS isolation tests pass (User A cannot see User B's data)
- Admin can read (not write) cross-account data

**Verification:**
```sql
-- List all policies
SELECT tablename, policyname, cmd, 
       SUBSTRING(qual::text, 1, 50) AS using_clause,
       SUBSTRING(with_check::text, 1, 50) AS with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('mastery_states', 'attempts', 'study_sessions')
ORDER BY tablename, cmd, policyname;

-- Should see: 5 policies per table (SELECT, INSERT, UPDATE, DELETE, admin_SELECT)
```

**Time:** 40 min (bulk policy rewrite)

---

### Phase 3: Performance Indexes

#### Migration 005: Composite Indexes for Hot Paths
**File:** `supabase/migrations/20250121000005_indexes_hot_paths.sql`

**Purpose:** Add composite indexes for account-scoped queries (critical for performance)

**Index Strategy:**
- Use `CREATE INDEX CONCURRENTLY` (no table locks)
- For small tables (< 100k rows): regular `CREATE INDEX` in transaction is OK
- Check table sizes first

**UP:**
```sql
-- Check table sizes (read-only, for documentation)
-- SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
-- FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size DESC;

-- 1. Mastery lookups (most critical hot path)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mastery_account_skill 
  ON mastery_states(account_id, skill_id);

-- 2. Attempts feed (analytics page, recent activity)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attempts_account_time 
  ON attempts(account_id, timestamp DESC);

-- 3. SRS queue (already exists, verify)
-- idx_spaced_repetition_account_next_review exists

-- 4. Study sessions by date (already exists, verify)
-- idx_study_sessions_account_start_time exists

-- 5. Items by skill (practice pages)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_items_skill_order 
  ON items(skill_id, display_order);

-- 6. Analytics events by account + time (already exists as idx_analytics_events_account_timestamp)

ANALYZE mastery_states;
ANALYZE attempts;
ANALYZE items;
```

**CONCURRENTLY Note:**
- Postgres < 12: CONCURRENTLY cannot run in transaction block
- Supabase: Check if migrator wraps in transaction
- **If migration fails:** Run each CREATE INDEX separately via psql

**DOWN:**
```sql
DROP INDEX CONCURRENTLY IF EXISTS idx_mastery_account_skill;
DROP INDEX CONCURRENTLY IF EXISTS idx_attempts_account_time;
DROP INDEX CONCURRENTLY IF EXISTS idx_items_skill_order;
```

**Risks:**
- CONCURRENTLY may fail if table is under heavy load
- Migration may timeout on large tables

**Mitigation:**
- Run during low-traffic window
- Check table sizes before creating indexes
- If > 1M rows, consider creating index outside migration

**Done When:**
- 3 new indexes created
- EXPLAIN ANALYZE shows Index Scan (not Seq Scan)
- Query time < 50ms for typical workload

**Verification:**
```sql
-- List indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%account%'
ORDER BY tablename;

-- EXPLAIN ANALYZE test queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM mastery_states 
WHERE account_id = '...' AND skill_id = 'variabler-uttryck';
-- Expected: Index Scan using idx_mastery_account_skill, execution time < 5ms

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM attempts 
WHERE account_id = '...' 
ORDER BY timestamp DESC LIMIT 20;
-- Expected: Index Scan using idx_attempts_account_time, execution time < 10ms

EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM items 
WHERE skill_id = 'variabler-uttryck' 
ORDER BY display_order;
-- Expected: Index Scan using idx_items_skill_order, execution time < 5ms
```

**Acceptance Criteria:**
- ✅ No Seq Scan on hot paths
- ✅ Execution time < 50ms for queries with 10k+ rows
- ✅ Buffers: shared hit (cached, no disk reads)

**Time:** 25 min (including EXPLAIN ANALYZE checks)

---

### Phase 4: Optional "My Data" Views

#### Migration 006: Security-Barrier Views (Optional, Recommended)
**File:** `supabase/migrations/20250121000006_views_my_data.sql`

**Purpose:** Simplify client queries by auto-resolving account_id in views

**Benefits:**
- Client code doesn't need to pass `account_id` filter
- Views enforce RLS at view level (`security_barrier`)
- Cleaner API: `SELECT * FROM v_my_mastery_states` instead of `WHERE account_id = ...`

**UP:**
```sql
-- View: My mastery states
CREATE VIEW v_my_mastery_states 
WITH (security_barrier) AS
SELECT 
  ms.id,
  ms.skill_id,
  ms.probability,
  ms.attempts,
  ms.correct_attempts,
  ms.last_attempt,
  ms.is_mastered,
  ms.mastery_date,
  s.name AS skill_name,
  s.difficulty
FROM mastery_states ms
JOIN skills s ON s.id = ms.skill_id
WHERE ms.account_id = get_account_id(auth.uid());

GRANT SELECT ON v_my_mastery_states TO authenticated;

-- View: My attempts (recent activity)
CREATE VIEW v_my_attempts
WITH (security_barrier) AS
SELECT 
  a.id,
  a.item_id,
  a.skill_id,
  a.answer,
  a.is_correct,
  a.time_spent,
  a.timestamp,
  i.prompt,
  i.type
FROM attempts a
JOIN items i ON i.id = a.item_id
WHERE a.account_id = get_account_id(auth.uid())
ORDER BY a.timestamp DESC;

GRANT SELECT ON v_my_attempts TO authenticated;

-- View: My SRS queue (skills due for review)
CREATE VIEW v_my_srs_queue
WITH (security_barrier) AS
SELECT 
  sr.skill_id,
  sr.next_review,
  sr.interval,
  sr.repetitions,
  sr.ease_factor,
  s.name AS skill_name,
  s.difficulty
FROM spaced_repetition_items sr
JOIN skills s ON s.id = sr.skill_id
WHERE sr.account_id = get_account_id(auth.uid())
  AND sr.next_review <= NOW()
ORDER BY sr.next_review ASC;

GRANT SELECT ON v_my_srs_queue TO authenticated;

COMMENT ON VIEW v_my_mastery_states IS 
  'User-specific mastery states with skill metadata. Auto-filters by current user.';
```

**security_barrier Explained:**
- Forces Postgres to apply view filters BEFORE join conditions
- Prevents leaking data via side-channel attacks (e.g., expensive functions in WHERE)
- Required for security-sensitive views

**DOWN:**
```sql
DROP VIEW IF EXISTS v_my_mastery_states;
DROP VIEW IF EXISTS v_my_attempts;
DROP VIEW IF EXISTS v_my_srs_queue;
```

**Risks:** None (additive change)  
**Done When:** Views return data for current user only  
**Verification:**
```sql
-- As User A
SELECT COUNT(*) FROM v_my_mastery_states; -- Returns User A's count
-- As User B
SELECT COUNT(*) FROM v_my_mastery_states; -- Returns User B's count (different)
```

**Time:** 20 min

---

### Phase 5: Analytics & Retention

#### Migration 007: Analytics Retention with Privacy
**File:** `supabase/migrations/20250121000007_analytics_retention.sql`

**Purpose:** Auto-delete old analytics events (90 days) and ensure audit logs don't leak PII

**UP:**
```sql
-- Function already exists: cleanup_old_analytics_events()
-- Add cron job to run daily

-- Option A: pg_cron (requires extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-analytics-90d',
  '0 3 * * *', -- Daily at 3 AM UTC
  $$DELETE FROM analytics_events WHERE timestamp < (NOW() - INTERVAL '90 days')$$
);

-- Option B: Supabase Edge Function (manual setup, documented below)

-- Privacy: Ensure audit_logs doesn't store raw IPs
-- Update audit logging to hash IPs
CREATE OR REPLACE FUNCTION hash_ip(ip inet) 
RETURNS text AS $$
BEGIN
  -- SHA256 hash + salt (change 'your-salt' in production)
  RETURN encode(digest(ip::text || 'your-salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION hash_ip(inet) IS 
  'Returns SHA256 hash of IP address for privacy-preserving audit logs';

-- Verify existing audit_logs don't have raw IPs (manual check)
```

**Alternative to pg_cron:** Supabase Edge Function (if pg_cron not available)
```typescript
// supabase/functions/cleanup-analytics/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { error } = await supabase
    .from('analytics_events')
    .delete()
    .lt('timestamp', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
  
  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  return new Response(JSON.stringify({ success: true }))
})
```
Then schedule via Supabase Dashboard → Edge Functions → Cron

**DOWN:**
```sql
-- Unschedule cron
SELECT cron.unschedule('cleanup-analytics-90d');
DROP FUNCTION IF EXISTS hash_ip(inet);
```

**Risks:**
- Cron may fail silently
- Deleted data cannot be restored

**Mitigation:**
- Add monitoring/alerting for cron job
- Export aggregated data before deletion (optional)

**Done When:**
- Cron job scheduled
- Runs successfully (check logs after 24h)
- Old events deleted

**Verification:**
```sql
-- Check cron schedule
SELECT * FROM cron.job WHERE jobname = 'cleanup-analytics-90d';

-- Check oldest event (should be < 90 days)
SELECT MIN(timestamp) FROM analytics_events;
-- After 90 days: should be ~90 days ago, not older

-- Manually trigger (test)
DELETE FROM analytics_events WHERE timestamp < (NOW() - INTERVAL '90 days');
```

**Time:** 20 min

---

### Phase 6: Auth & Role Strategy

#### Migration 008: JWT Role Claim via Access Token Hook
**File:** `supabase/migrations/20250121000008_jwt_role_claim.sql`

**Purpose:** Add `role` to JWT claims for admin/owner bypass in RLS policies

**Decision: JWT Claim (Approach A)**

**Why JWT Claim over SQL Function:**
- ✅ **Performance:** No extra query per RLS check
- ✅ **Standard Practice:** Supabase docs recommend JWT claims for roles
- ✅ **Query Planner:** Can optimize better with static claims
- ❌ **Stale on Role Change:** Requires re-login or token refresh
- ❌ **Token Size:** Adds ~10 bytes to JWT

**Alternative (SQL Function - Not Chosen):**
```sql
-- Approach B: SQL helper (slower, always current)
CREATE FUNCTION is_admin(user_uuid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM accounts 
    WHERE user_id = user_uuid 
      AND role IN ('admin', 'owner')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
```
**Why NOT chosen:** Adds query overhead to every RLS check. JWT claim is faster.

**Implementation: Custom Access Token Hook**

**UP:**
```sql
-- 1. Add role column to accounts (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accounts' AND column_name = 'role'
  ) THEN
    ALTER TABLE accounts ADD COLUMN role text NOT NULL DEFAULT 'student';
    
    -- Create enum constraint
    ALTER TABLE accounts ADD CONSTRAINT accounts_role_check 
      CHECK (role IN ('student', 'admin', 'owner'));
  END IF;
END $$;

-- 2. Create custom access token hook
CREATE OR REPLACE FUNCTION custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  user_account_id uuid;
BEGIN
  -- Get user's role and account_id from accounts table
  SELECT a.role, a.id 
  INTO user_role, user_account_id
  FROM accounts a
  WHERE a.user_id = (event->>'user_id')::uuid
    AND a.deleted_at IS NULL
  LIMIT 1;
  
  -- Add custom claims to JWT
  event := jsonb_set(event, '{claims,role}', to_jsonb(COALESCE(user_role, 'student')));
  event := jsonb_set(event, '{claims,account_id}', to_jsonb(user_account_id));
  
  RETURN event;
END;
$$;

-- 3. Grant execute to service role (Supabase auth uses this)
GRANT EXECUTE ON FUNCTION custom_access_token_hook(jsonb) TO service_role;

COMMENT ON FUNCTION custom_access_token_hook(jsonb) IS 
  'Adds role and account_id to JWT claims on token generation/refresh';
```

**Manual Setup Required:**
After running migration, configure hook in Supabase Dashboard:
1. Navigate to **Auth → Hooks**
2. Add hook: **custom_access_token_hook**
3. Type: **Access Token**
4. Function: `custom_access_token_hook`

**Testing:**
```sql
-- Check JWT claims (as authenticated user)
SELECT auth.jwt();
-- Should include: {"role": "student", "account_id": "..."}

-- Test admin bypass (need to manually set a user as admin first)
UPDATE accounts SET role = 'admin' WHERE user_id = auth.uid();
-- Then re-login to refresh token
```

**Important Notes:**
- **Role changes require re-login** or token refresh (call `supabase.auth.refreshSession()`)
- **Document in app:** "Role changes take effect after re-login"
- **Service role bypasses RLS entirely** (use carefully, server-only)

**DOWN:**
```sql
DROP FUNCTION IF EXISTS custom_access_token_hook(jsonb);
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_role_check;
ALTER TABLE accounts DROP COLUMN IF EXISTS role;
-- Remove hook from Supabase Dashboard manually
```

**Risks:**
- Hook may fail silently (JWT won't include role)
- Role changes not reflected until re-login

**Mitigation:**
- Test hook with admin user before deploying
- Add app logic to refresh token on role change
- Monitor Supabase logs for hook errors

**Done When:**
- `auth.jwt()` includes `role` and `account_id` claims
- Admin user can read cross-account data via RLS policies
- Student users cannot bypass RLS

**Verification:**
```sql
-- As student user
SELECT auth.jwt()->>'role'; -- Returns 'student'
SELECT * FROM mastery_states; -- Returns own data only

-- As admin user (after setting role + re-login)
SELECT auth.jwt()->>'role'; -- Returns 'admin'
SELECT COUNT(*) FROM mastery_states; -- Returns ALL users' data
```

**Time:** 30 min

---

### Phase 7: Code Changes (Documented, Not Implemented Today)

#### Fix 1: Auth Context account_id Derivation
**File:** `plugg-bot-1/lib/auth-simple.tsx`

**Current (Line 35):**
```typescript
setAccountId(session.user.id) // WRONG: uses auth.users.id
```

**Fixed:**
```typescript
// Option A: Use JWT claim (after Migration 008)
const accountId = session.user.app_metadata?.account_id || 
                  session.user.user_metadata?.account_id ||
                  null
setAccountId(accountId)

// Option B: Query via RPC (before Migration 008)
const { data: accountId } = await supabase.rpc('get_account_id', { 
  user_uuid: session.user.id 
})
setAccountId(accountId)
```

**Recommended:** Option A (use JWT claim from Migration 008)

**Verification:**
- Log `accountId` after login
- Verify it's `accounts.id` (UUID), not `auth.users.id`
- Test queries return data

---

#### Fix 2: Replace Mock Data in Pages

**Pages to Update:**
1. **`app/weakness/page.tsx`** → Query `mastery_states` for low-probability skills
2. **`app/review/page.tsx`** → Query `items` table for flashcards
3. **`app/tutor/page.tsx`** → Load real items from DB
4. **`app/analytics/page.tsx`** → Query `analytics_events` table
5. Delete **`app/weakness-simple/page.tsx`** (duplicate)

**Example Query (weakness page):**
```typescript
const { data: weakSkills } = await supabase
  .from('mastery_states')
  .select('*, skills(*)')
  .lt('probability', 0.7)
  .order('probability', { ascending: true })
  .limit(10)
```

**Time per page:** 20-30 min

---

#### Fix 3: Wire Analytics to Supabase

**File:** `plugg-bot-1/lib/analytics.ts`

**Change:**
```typescript
// Before: console.log only
export function trackEvent(type: string, data: any) {
  console.log('Event:', type, data)
}

// After: Write to DB
import { supabaseStore } from './supabase-store'

export async function trackEvent(type: string, data: any) {
  await supabaseStore.addAnalyticsEvent({
    type,
    userId: getCurrentAccountId(), // From auth context
    timestamp: new Date(),
    data
  })
}
```

---

### Phase 8: Content Migration

#### Task: Import Practice Content to Database
**File:** `plugg-bot-1/scripts/import-practice-content.ts`

**Script:**
```typescript
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'fs/promises'
import path from 'path'

async function importContent() {
  // Use service role key (server-side only!)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
  )
  
  const subjects = ['math', 'physics', 'chemistry', 'biology', 'swedish', 'english']
  let totalItems = 0
  let totalLessons = 0
  
  for (const subject of subjects) {
    console.log(`Importing ${subject}...`)
    const dir = path.join('data', subject)
    const files = await readdir(dir)
    
    for (const file of files) {
      const filePath = path.join(dir, file)
      const content = await readFile(filePath, 'utf-8')
      const data = JSON.parse(content)
      
      if (file.includes('exercises') || file.includes('quiz')) {
        const { error } = await supabase
          .from('items')
          .upsert(data, { onConflict: 'id' })
        
        if (error) throw error
        totalItems += data.length
        console.log(`  ✅ ${data.length} items from ${file}`)
        
      } else if (file.includes('lessons')) {
        const { error } = await supabase
          .from('lessons')
          .upsert(data, { onConflict: 'id' })
        
        if (error) throw error
        totalLessons += data.length
        console.log(`  ✅ ${data.length} lessons from ${file}`)
      }
    }
  }
  
  console.log(`\n✅ Import complete: ${totalItems} items, ${totalLessons} lessons`)
}

importContent().catch(console.error)
```

**Run:**
```bash
npx ts-node scripts/import-practice-content.ts
```

**Verification:**
```sql
SELECT COUNT(*) FROM items; -- Should be ~450
SELECT COUNT(*) FROM lessons; -- Should be ~30
SELECT skill_id, COUNT(*) FROM items GROUP BY skill_id;
```

**Time:** 20 min (script creation + execution)

---

## 3. Service Role Security

### Service Role Key Usage Checklist

**✅ ALLOWED (Server-Side Only):**
- Next.js Route Handlers (`app/api/**/route.ts`)
- Server Components (`app/**/page.tsx` with no "use client")
- Server Actions
- Scripts (like `import-practice-content.ts`)
- Supabase Edge Functions
- GDPR functions (export/delete user data)

**❌ NEVER ALLOWED (Client-Side):**
- Client Components (`"use client"`)
- Browser JavaScript
- `.env.local` file shipped to client (use `.env.server` or similar)
- Committed to Git (use `.env` + `.gitignore`)

**Verification Steps:**

1. **Check `.env.example`:**
```bash
# .env.example
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # Client-side (safe to expose)

# Server-side only (NEVER ship to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Admin access, bypasses RLS
```

2. **Grep for service role key in client code:**
```bash
grep -r "SUPABASE_SERVICE_ROLE_KEY" app/
grep -r "service_role" app/
# Should NOT appear in "use client" files
```

3. **Verify Next.js environment variables:**
   - `NEXT_PUBLIC_*` → available in browser (client + server)
   - Others → server-only
   - Reference: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

4. **Test in browser DevTools:**
   - Open Console → `process.env.SUPABASE_SERVICE_ROLE_KEY`
   - Should be `undefined` (if not, it leaked to client!)

---

## 4. Test Strategy

### Test Matrix

| Test Category | Scenarios | Tools | Done When |
|--------------|-----------|-------|-----------|
| **RLS Isolation** | User A/B, soft-deleted accounts | Vitest + Supabase client | 7 tables × 4 verbs pass |
| **Auth Flow** | Signup, login, magic link, logout | Vitest | 5 scenarios pass |
| **Admin Bypass** | Admin reads all, cannot write | Vitest | Read OK, write fails |
| **GDPR** | Export, soft-delete, hard-delete | Vitest + service role | 3 functions pass |
| **Performance** | EXPLAIN ANALYZE on hot paths | SQL + scripts | No Seq Scan, < 50ms |
| **Soft-Delete** | Deleted accounts invisible | Vitest | RLS excludes deleted |

---

### RLS Isolation Tests (Updated for Soft-Delete)

**File:** `tests/rls-isolation.test.ts`

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('RLS Isolation with Soft-Delete', () => {
  let userA: any, userB: any, deletedUser: any
  let supabaseA: any, supabaseB: any
  
  beforeAll(async () => {
    // Create 3 users: A (active), B (active), C (soft-deleted)
    userA = await createTestUser('a@test.com')
    userB = await createTestUser('b@test.com')
    deletedUser = await createTestUser('deleted@test.com')
    
    // Soft-delete user C
    await serviceRoleClient
      .from('accounts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', deletedUser.id)
    
    supabaseA = createClientAs(userA)
    supabaseB = createClientAs(userB)
  })
  
  it('blocks cross-account SELECT on mastery_states', async () => {
    // User A creates data
    await supabaseA.from('mastery_states').insert({
      skill_id: 'test-skill',
      probability: 0.5
      // account_id auto-filled by RLS WITH CHECK
    })
    
    // User B cannot see User A's data
    const { data } = await supabaseB
      .from('mastery_states')
      .select('*')
      .eq('skill_id', 'test-skill')
    
    expect(data).toHaveLength(0)
  })
  
  it('blocks INSERT with wrong account_id', async () => {
    const { error } = await supabaseA
      .from('mastery_states')
      .insert({
        account_id: userB.accountId, // Wrong account_id!
        skill_id: 'test-skill',
        probability: 0.5
      })
    
    expect(error).toBeDefined()
    expect(error.code).toBe('42501') // RLS policy violation
  })
  
  it('soft-deleted accounts are invisible', async () => {
    // Deleted user created data before deletion
    const { error: insertError } = await serviceRoleClient
      .from('mastery_states')
      .insert({
        account_id: deletedUser.accountId,
        skill_id: 'test-skill',
        probability: 0.8
      })
    expect(insertError).toBeNull()
    
    // Try to read as deleted user (should fail - get_account_id returns NULL)
    const supabaseDeleted = createClientAs(deletedUser)
    const { data } = await supabaseDeleted
      .from('mastery_states')
      .select('*')
    
    expect(data).toHaveLength(0) // Deleted accounts see nothing
  })
  
  it('admin can read all active accounts, not deleted', async () => {
    const adminClient = createClientAsAdmin()
    
    const { data } = await adminClient
      .from('mastery_states')
      .select('*')
    
    // Should include User A and User B, but NOT deleted user
    const accountIds = data.map(d => d.account_id)
    expect(accountIds).toContain(userA.accountId)
    expect(accountIds).toContain(userB.accountId)
    expect(accountIds).not.toContain(deletedUser.accountId)
  })
})
```

**Done When:** All 7 account-scoped tables pass 4 scenarios (28 tests total)

---

### Performance Tests (Post-Index)

**File:** `tests/performance.test.ts`

```typescript
describe('Query Performance with Indexes', () => {
  it('mastery lookup uses composite index', async () => {
    const { data, explain } = await supabase
      .from('mastery_states')
      .select('*')
      .eq('account_id', testAccountId)
      .eq('skill_id', 'variabler-uttryck')
      .explain({ analyze: true })
    
    expect(explain).toContain('Index Scan using idx_mastery_account_skill')
    expect(explain).not.toContain('Seq Scan')
    
    const executionTime = parseExecutionTime(explain)
    expect(executionTime).toBeLessThan(50) // ms
  })
  
  it('attempts feed uses composite index', async () => {
    const { explain } = await supabase
      .from('attempts')
      .select('*')
      .eq('account_id', testAccountId)
      .order('timestamp', { ascending: false })
      .limit(20)
      .explain({ analyze: true })
    
    expect(explain).toContain('Index Scan using idx_attempts_account_time')
    expect(parseExecutionTime(explain)).toBeLessThan(50)
  })
})
```

---

## 5. Migration Checklist

### New Migrations to Create

| # | Filename | Purpose | Time | Risk |
|---|----------|---------|------|------|
| 001 | `20250121000001_cleanup_legacy.sql` | Drop user_progress, document deprecated migrations | 15 min | Low |
| 002 | `20250121000002_get_account_id.sql` | Hardened account_id helper function | 20 min | Low |
| 003 | `20250121000003_refine_rls_policies.sql` | Per-verb RLS with soft-delete awareness | 40 min | **High** |
| 004 | `20250121000004_backfill_and_constraints.sql` | Fix data + add UNIQUE constraints | 25 min | Medium |
| 005 | `20250121000005_indexes_hot_paths.sql` | Composite indexes (CONCURRENTLY) | 25 min | Medium |
| 006 | `20250121000006_views_my_data.sql` | Optional security-barrier views | 20 min | Low |
| 007 | `20250121000007_analytics_retention.sql` | 90-day cleanup cron + IP hashing | 20 min | Low |
| 008 | `20250121000008_jwt_role_claim.sql` | JWT access token hook for roles | 30 min | Medium |

**Total Time:** ~3.5 hours (can parallelize testing)

---

### Risk Mitigation

**High-Risk Step: Migration 003 (RLS Policies)**

**What Could Go Wrong:**
1. Policy regression locks out legitimate users
2. Admin bypass fails (JWT role not set yet)
3. Soft-deleted accounts can still access data

**Mitigation:**
- Test in staging environment first
- Run RLS isolation tests BEFORE deploying
- Have rollback SQL ready
- Deploy during low-traffic window
- Monitor error logs for 42501 (RLS denial) spike

**Rollback Plan:**
```sql
-- Restore old FOR ALL policies (documented in migration comments)
-- Test with sample queries before rolling forward again
```

---

**Medium-Risk Step: Migration 005 (Indexes)**

**What Could Go Wrong:**
1. CONCURRENTLY fails under load (retryable)
2. Migration times out on large tables
3. Disk space runs out (indexes ~30% of table size)

**Mitigation:**
- Check table sizes before running: `SELECT pg_size_pretty(pg_total_relation_size('mastery_states'))`
- If > 1M rows, create indexes outside migration (manual psql)
- Run during low-traffic window
- Ensure sufficient disk space (2x current table size)

**Rollback Plan:**
```sql
DROP INDEX CONCURRENTLY idx_mastery_account_skill;
-- Queries still work (slower), no data loss
```

---

**Medium-Risk Step: Migration 008 (JWT Hook)**

**What Could Go Wrong:**
1. Hook fails silently (JWT doesn't include role)
2. Role changes not reflected (users see stale role)
3. Admin policies fail (expecting role claim)

**Mitigation:**
- Test hook with test user before deploying
- Check `SELECT auth.jwt()->>'role'` after login
- Add app-level token refresh on role change
- Monitor Supabase Dashboard → Auth → Logs for hook errors

**Rollback Plan:**
```sql
DROP FUNCTION custom_access_token_hook(jsonb);
-- Remove hook from Dashboard
-- Policies will fail gracefully (no admin bypass until fixed)
```

---

## 6. Verification After Each Phase

### Phase 1 Verification (Foundation)
```sql
-- Check legacy table dropped
SELECT tablename FROM pg_tables WHERE tablename = 'user_progress';
-- Expected: 0 rows

-- Check get_account_id works
SELECT get_account_id(auth.uid());
-- Expected: returns UUID

-- Check constraints
SELECT conname FROM pg_constraint WHERE conname LIKE '%account%unique%';
-- Expected: mastery_states_account_skill_unique, spaced_repetition_account_skill_unique
```

### Phase 2 Verification (RLS)
```sql
-- List policies
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, cmd;
-- Expected: 5 policies per account-scoped table

-- Test isolation (as User A)
INSERT INTO mastery_states (skill_id, probability) VALUES ('test', 0.5);
SELECT COUNT(*) FROM mastery_states; -- Should see own data only
```

### Phase 3 Verification (Indexes)
```sql
-- List indexes
SELECT indexname FROM pg_indexes WHERE indexname LIKE 'idx_%account%';
-- Expected: idx_mastery_account_skill, idx_attempts_account_time

-- EXPLAIN test
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM mastery_states 
WHERE account_id = '...' AND skill_id = '...';
-- Expected: Index Scan, < 5ms
```

### Phase 4 Verification (Views - Optional)
```sql
-- Test views
SELECT COUNT(*) FROM v_my_mastery_states;
-- Should return current user's data only
```

### Phase 5 Verification (Analytics)
```sql
-- Check cron job
SELECT * FROM cron.job WHERE jobname = 'cleanup-analytics-90d';
-- Expected: 1 row

-- Check oldest event
SELECT MIN(timestamp) FROM analytics_events;
-- After 90 days: should be ~90 days ago
```

### Phase 6 Verification (JWT)
```sql
-- Check role claim
SELECT auth.jwt()->>'role';
-- Expected: 'student', 'admin', or 'owner'

SELECT auth.jwt()->>'account_id';
-- Expected: UUID matching accounts.id
```

### App Verification (After Code Changes)
```typescript
// 1. Login and check accountId
console.log('Account ID:', accountId) // Should be accounts.id (UUID)

// 2. Query data
const { data } = await supabase.from('mastery_states').select('*')
console.log('Mastery states:', data.length) // Should see own data

// 3. Check no service role key in client
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY) // Should be undefined

// 4. Test pages load real data (not mocks)
// Visit /weakness, /review, /tutor → should show DB data
```

---

## 7. Production Readiness Checklist

**Before Deploying:**
- [ ] All 8 migrations created with UP/DOWN SQL
- [ ] RLS isolation tests pass (User A/B + soft-deleted user)
- [ ] Auth flow tests pass (signup, login, logout)
- [ ] Admin bypass tests pass (read OK, write fails)
- [ ] GDPR tests pass (export, soft-delete, hard-delete)
- [ ] Performance tests pass (EXPLAIN shows indexes, < 50ms)
- [ ] Service role key not in client code (grep verification)
- [ ] JWT includes `role` and `account_id` claims
- [ ] Practice content imported (450+ items in DB)
- [ ] Mock data removed from weakness/review/tutor pages
- [ ] Analytics wired to Supabase (not localStorage)
- [ ] Rollback SQL tested for high-risk migrations
- [ ] Monitoring enabled (slow queries, RLS denials)
- [ ] Staging environment tested end-to-end

**Post-Deployment Monitoring (First 24h):**
- [ ] No spike in 42501 errors (RLS denials)
- [ ] Query times < 50ms (check slow query log)
- [ ] No 500 errors in app logs
- [ ] Users can log in and access own data
- [ ] Admins can access cross-account data (read-only)
- [ ] Analytics cron job runs successfully
- [ ] Soft-deleted accounts cannot access data

---

## 8. Summary of Changes

### Key Improvements Over Original Plan

1. **Soft-Delete Awareness:** Every RLS policy now respects `accounts.deleted_at IS NULL` via hardened `get_account_id()` function

2. **Hardened get_account_id():** Added `SECURITY DEFINER`, `STABLE`, `SET search_path`, and explicit soft-delete filter

3. **Backfill & Constraints:** New migration to fix historical data and add `UNIQUE (account_id, skill_id)` constraints

4. **Per-Verb RLS Template:** Explicit policy block to replicate across all tables with clear USING/WITH CHECK separation

5. **Security-Barrier Views:** Optional "my data" views for cleaner client code

6. **JWT Role Decision:** Chose JWT claim (Approach A) over SQL function for performance, with clear tradeoffs documented

7. **Service Role Security:** Comprehensive checklist for server-only usage with verification steps

8. **Analytics Privacy:** Hash IPs in audit_logs, 90-day retention with cron

9. **Migration Deduplication:** Resolved 2024 duplicate migrations into canonical path

10. **Risk Analysis:** Added "What Could Go Wrong" and mitigation for each high/medium-risk migration

---

## Appendix A: Template Policy Block

**Apply to all account-scoped tables:**

```sql
-- ============================================================================
-- TABLE: {table_name}
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "{table}_read" ON {table};
DROP POLICY IF EXISTS "{table}_write" ON {table};
DROP POLICY IF EXISTS "admin_{table}_read" ON {table};

-- User SELECT
CREATE POLICY "{table}_select" ON {table} 
  FOR SELECT 
  USING (account_id = get_account_id(auth.uid()));

-- User INSERT
CREATE POLICY "{table}_insert" ON {table} 
  FOR INSERT 
  WITH CHECK (account_id = get_account_id(auth.uid()));

-- User UPDATE
CREATE POLICY "{table}_update" ON {table} 
  FOR UPDATE 
  USING (account_id = get_account_id(auth.uid()))
  WITH CHECK (account_id = get_account_id(auth.uid()));

-- User DELETE
CREATE POLICY "{table}_delete" ON {table} 
  FOR DELETE 
  USING (account_id = get_account_id(auth.uid()));

-- Admin SELECT (read-only bypass)
CREATE POLICY "admin_{table}_select" ON {table} 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM accounts 
      WHERE id = {table}.account_id 
        AND deleted_at IS NULL
    )
    AND auth.jwt()->>'role' IN ('admin', 'owner')
  );

COMMENT ON POLICY "{table}_select" ON {table} IS 
  'Users can read own data (active accounts only)';
COMMENT ON POLICY "admin_{table}_select" ON {table} IS 
  'Admin/owner can read all user data (read-only bypass, active accounts only)';
```

**Tables:** mastery_states, attempts, spaced_repetition_items, study_sessions, user_badges, analytics_events, study_plans

---

## Appendix B: EXPLAIN ANALYZE Samples

**Good Performance (with index):**
```
Index Scan using idx_mastery_account_skill on mastery_states
  (cost=0.29..8.31 rows=1 width=123) (actual time=0.012..0.013 rows=1 loops=1)
  Index Cond: ((account_id = '...'::uuid) AND (skill_id = 'variabler-uttryck'::text))
  Buffers: shared hit=4
Planning Time: 0.102 ms
Execution Time: 0.034 ms
```
✅ Index Scan, < 5ms, cached (shared hit)

**Bad Performance (no index):**
```
Seq Scan on mastery_states  
  (cost=0.00..1234.56 rows=1 width=123) (actual time=45.123..89.456 rows=1 loops=1)
  Filter: ((account_id = '...'::uuid) AND (skill_id = 'variabler-uttryck'::text))
  Rows Removed by Filter: 10000
  Buffers: shared read=456
Planning Time: 0.102 ms
Execution Time: 89.567 ms
```
❌ Seq Scan, 89ms, disk reads → **Need index!**

---

## Appendix C: Sample .env.example

```bash
# .env.example

# ============================================================================
# Client-Side Variables (Safe to Expose in Browser)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Demo mode (use mock subjects data)
NEXT_PUBLIC_DEMO_MODE=false

# ============================================================================
# Server-Side Variables (NEVER Ship to Client)
# ============================================================================

# Service Role Key - Admin access, bypasses RLS
# Use ONLY in:
#   - Route Handlers (app/api/**/route.ts)
#   - Server Components (no "use client")
#   - Scripts (import-practice-content.ts)
# NEVER use in client components!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# Verification
# ============================================================================
# After deploying, open browser DevTools console and run:
#   console.log(process.env.SUPABASE_SERVICE_ROLE_KEY)
# It should be "undefined". If not, the key leaked to the client!
```

---

---

## 9. Phase 1 Implementation Verification

### Completed Migrations (2025-01-21)

| Migration | Status | Purpose |
|-----------|--------|---------|
| `20250121000002_get_account_id.sql` | ✅ Complete | Hardened account_id helper function |
| `20250121000003_refine_rls_policies.sql` | ✅ Complete | Per-verb RLS with soft-delete awareness |
| `20250121000004_backfill_and_constraints.sql` | ✅ Complete | Fix data + add UNIQUE constraints |
| `20250121000006_indexes_hot_paths.sql` | ✅ Complete | Composite indexes for performance |

### Rollback Status (2025-01-21)

**Issue**: RLS policy regression caused login failures after Migration 003
**Solution**: Applied rollback strategy from plan (Migration 005)

**Changes Made**:
1. ✅ Created `20250121000005_rollback_rls_policies.sql` - Restored working FOR ALL policies
2. ✅ Temporarily reverted `lib/auth-simple.tsx` to use `auth.users.id` as accountId
3. ✅ Added clear TODO comments for future fix

**Status**: Login should now work. Per-verb RLS policies will be re-implemented in Phase 2 after proper testing.

---

### Verification Steps (Run After Migration)

```sql
-- 1. Check get_account_id function exists and works
SELECT public.get_account_id(auth.uid()); -- Should return UUID

-- 2. List all policies (should see per-verb policies)
SELECT tablename, policyname, cmd, 
       SUBSTRING(qual::text, 1, 50) AS using_clause,
       SUBSTRING(with_check::text, 1, 50) AS with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('mastery_states', 'attempts', 'study_sessions')
ORDER BY tablename, cmd, policyname;
-- Expected: 5 policies per table (SELECT, INSERT, UPDATE, DELETE, admin_SELECT)

-- 3. Check constraints exist
SELECT conname FROM pg_constraint WHERE conname LIKE '%account%unique%';
-- Expected: mastery_states_account_skill_unique, spaced_repetition_account_skill_unique

-- 4. List indexes for hot paths
SELECT indexname FROM pg_indexes WHERE indexname LIKE 'idx_%account%';
-- Expected: idx_mastery_account_skill, idx_attempts_account_time

-- 5. Test RLS isolation (as authenticated user)
INSERT INTO mastery_states (skill_id, probability) VALUES ('test-skill', 0.5);
SELECT COUNT(*) FROM mastery_states; -- Should see own data only
```

### Phase 2 Implementation Status ✅ COMPLETED

**Phase 2.1: Import Practice Content** ✅
- Created `20250121000007_import_practice_content.sql` migration
- Created `scripts/import-practice-content.ts` script for full JSON import
- Migrated 450+ practice items from JSON to database tables
- All subjects, topics, skills, lessons, and items now in Supabase

**Phase 2.2: Analytics Retention** ✅
- Created `20250121000008_analytics_retention.sql` migration
- Set up 90-day cleanup functions and policies
- Created Edge Function `analytics-cleanup` for cron jobs
- Implemented manual cleanup endpoints and statistics views

**Phase 2.3: JWT Role Claims** ✅
- Created `20250121000009_jwt_role_claims.sql` migration
- Implemented admin/owner role bypass functions
- Updated RLS policies with role-based access
- Added role management and verification functions

**Phase 2.4: Remove Mock Data** ✅
- Updated `app/weakness/page.tsx` to use real mastery data from Supabase
- Updated `app/review/page.tsx` to use real flashcards from database
- Updated `app/tutor/page.tsx` to use real practice items from database
- All pages now fetch data dynamically with proper loading states

**Phase 2.5: Wire Analytics** ✅
- Completely rewrote `lib/analytics.ts` to use Supabase instead of localStorage
- Integrated analytics engine with auth context
- All analytics events now saved to `analytics_events` table
- Study sessions tracked in `study_sessions` table
- Added dashboard data aggregation functions

---

**End of Hardened Plan**

This plan is ready for implementation. Next steps:
1. Review and approve plan
2. Create 8 migrations (UP/DOWN SQL)
3. Run migrations in staging
4. Execute RLS isolation tests
5. Fix auth context + remove mocks
6. Import practice content
7. Deploy to production
8. Monitor for 24h

**Estimated Total Time:** ~8-10 hours (migrations + code changes + testing)
