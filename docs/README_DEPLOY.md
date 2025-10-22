# Deployment Guide

## Pre-Flight
- [ ] Supabase migrations applied (see supabase-plan.md)
- [ ] RLS tests passing
- [ ] All files from Section 12 created
- [ ] Service role key only in server code

## Step 1: Vercel Project
1. https://vercel.com/new → Import `Plugg hemsida`
2. Root Directory: `plugg-bot-1`
3. Deploy (will fail without env vars)

## Step 2: Environment Variables
Vercel → Settings → Environment Variables → Add for all environments:

| Variable | Get From |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |
| `SLACK_WEBHOOK_URL` | Slack → Incoming Webhooks |
| `BACKUP_PASSWORD` | Your chosen passphrase (20+ chars) |

## Step 3: Redeploy
Vercel → Deployments → Latest → Redeploy

## Step 4: Update Supabase Auth
Supabase → Authentication → URL Configuration:
- Site URL: `https://your-vercel-url.vercel.app`
- Redirect URLs: `https://your-vercel-url.vercel.app/auth/callback`

## Step 5: Verify EU Regions
Visit `https://your-vercel-url.vercel.app/api/health`  
Check `"region": "arn1"` or `"fra1"` (not us-east, us-west, etc.)

## Step 6: Test Flows
- [ ] Signup → Magic link received
- [ ] Login → Redirect to /study
- [ ] Export data → JSON download
- [ ] Delete account → Soft-delete + logout

## Step 7: Enable Analytics (Optional)
Vercel → Analytics → Enable Web Analytics  
Then add `https://va.vercel-scripts.com` to CSP `connect-src` in vercel.json → Redeploy

## Step 8: GitHub Actions
GitHub → Settings → Secrets → Add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SLACK_WEBHOOK_URL`
- `BACKUP_PASSWORD`

## Rollback
Vercel → Deployments → Previous working → "Promote to Production"

## Success Criteria
✅ `/api/health` returns `region: "arn1"` or `"fra1"`  
✅ Login works  
✅ Study pages load DB data  
✅ Export/delete work  
✅ No console errors  
✅ Rate limiting active (test 15+ rapid requests)
