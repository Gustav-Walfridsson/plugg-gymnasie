import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function rateLimit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (record.count >= max) return false
  record.count++
  return true
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Skip static assets
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // Rate limit ONLY sensitive paths
  const sensitiveRoutes = ['/api/auth/', '/api/gdpr/', '/auth/login', '/auth/signup']
  if (sensitiveRoutes.some(r => pathname.startsWith(r))) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    
    if (!rateLimit(ip, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}