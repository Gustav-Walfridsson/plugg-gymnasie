# Security Configuration

## Headers (vercel.json)
- **HSTS:** 2-year preload
- **X-Frame-Options:** DENY (no iframes)
- **CSP:** No unsafe-eval; only unsafe-inline for styles
- **Permissions-Policy:** Deny geolocation, mic, camera, payment

## Rate Limiting
- **WAF:** 10 req/min on /api/auth/*, 5 req/5min on /api/gdpr/*
- **Middleware:** 10 req/min on sensitive paths (backup layer)

## Secrets
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only (API Routes, Server Components)
- Never use in client components or commit to Git
- Verify: `process.env.SUPABASE_SERVICE_ROLE_KEY` = undefined in browser console

## WAF Attack Mode
**When to enable:** During DDoS or brute-force attack  
**How:** Vercel Dashboard → Firewall → Attack Challenge Mode (toggle on)  
**Impact:** Shows CAPTCHA to all visitors  
**Revert:** Toggle off after attack subsides

## Dependencies
- Review all `npm install` requests for unknown packages
- Use `npm audit` before deploying
- No third-party front-end scripts without approval

## CSP Relaxation
If something breaks due to CSP:
1. Check browser console for blocked resource
2. Add only that specific domain/hash to CSP
3. Document reason in Git commit message
