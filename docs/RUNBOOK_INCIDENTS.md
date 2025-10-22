# Incident Response Runbook

## Severity Levels
- **P0 (Critical):** Service down (< 15 min response)
- **P1 (High):** Partial outage (< 1 hour)
- **P2 (Medium):** Degraded performance (< 4 hours)
- **P3 (Low):** Minor bug (< 1 day)

## Contacts
- Primary: [YOUR NAME/PHONE]
- Supabase Support: support@supabase.com
- Vercel Support: support@vercel.com

## Response Steps

### 1. Acknowledge
- Check Slack `#plugg-alerts`
- Check Vercel → Logs for errors
- Post: "Incident acknowledged, investigating"

### 2. Assess
- Check `/api/health` endpoint
- Check Supabase Dashboard → Logs
- Check https://www.vercel-status.com
- Check https://status.supabase.com
- Determine severity (P0-P3)

### 3. Mitigate
**If P0 (service down):**
- Vercel Dashboard → Deployments → Previous working deployment → "Promote to Production"
- Enable WAF Attack Mode: Settings → Firewall → Attack Challenge Mode (toggle on)

**If DB issue:**
- Supabase Dashboard → Database → Connection Pooling → Increase pool size

### 4. Communicate
- Slack update every 30 min
- If > 1 hour: Email users "Vi arbetar med ett tekniskt problem"

### 5. Resolve
- Deploy fix
- Verify `/api/health` returns 200 OK
- Test: login, study page, export data
- Post: "Incident resolved"

### 6. Post-Mortem
- Document root cause
- Action items to prevent recurrence

## Common Issues

### "Too many connections" (Supabase)
**Fix:** Supabase → Database → Connection Pooling → Increase max connections from 15 to 25.

### "Function timeout" (Vercel)
**Fix:** Check Logs for slow function → Add timeout to fetch: `fetch(url, { signal: AbortSignal.timeout(5000) })`.

### "Rate limit exceeded"
**Fix:** Check Firewall → Traffic logs. If attack: Enable Attack Challenge Mode. If legit: Increase limits in WAF rules.

## Rollback
**Via Dashboard:** Deployments → Find last working → "Promote to Production"  
**Via CLI:** `vercel rollback`

## GDPR Breach Notification
If personal data compromised:
- [ ] Assess scope (how many users, what data)
- [ ] Notify Datainspektionen within 72 hours: https://www.datainspektionen.se
- [ ] Email affected users with details and mitigation steps
- [ ] Document incident in `docs/incidents/[date]-breach.md`
