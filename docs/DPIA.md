# Data Protection Impact Assessment (DPIA)
**Project:** Plugg Gymnasie MVP  
**Date:** [TODAY]  
**Assessor:** [YOUR NAME]

## 1. Nature & Scope
- **Purpose:** Adaptive learning for Swedish high-school students
- **Data subjects:** Students 13+ years (no parental consent required in Sweden)
- **Personal data:** Email, study progress, attempt history
- **Volume:** ~100-1000 users (MVP)
- **Retention:** 24 months

## 2. Necessity & Proportionality
- **Email:** Required for passwordless auth
- **Study progress:** Core feature (personalized learning)
- **Analytics:** Aggregated only, no individual marketing

## 3. Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Data breach | Low | High | RLS policies, EU-only compute, encrypted DB |
| Account takeover | Medium | Medium | Magic link, rate limiting, session expiry |
| Unauthorized cross-account access | Low | High | Hardened RLS, A/B isolation tests |
| Data retention too long | Low | Low | Auto-deletion after 24 months |
| US data transfer | None | N/A | Compute in EU (arn1/fra1), DB in Ireland, CDN global (static only) |

## 4. Measures
- ✅ HTTPS (TLS 1.3), DB encrypted at rest
- ✅ RLS, service role key server-only
- ✅ No names/addresses collected
- ✅ 24-month retention script
- ✅ Self-service export/delete
- ✅ EU compute regions locked
- ✅ DPAs signed (Vercel + Supabase)
- ✅ CSP, HSTS, rate limiting

## 5. Sign-off
- [X] Risks identified and mitigated
- [X] GDPR compliance verified
- [X] Approved for production

**Signed:** [YOUR NAME], [DATE]
