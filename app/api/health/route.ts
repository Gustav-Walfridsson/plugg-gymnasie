import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION || 'unknown',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local',
  })
}
