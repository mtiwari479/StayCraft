import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function getSafeRedirectPath(candidate: string | null) {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) {
    return '/dashboard'
  }

  return candidate
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = getSafeRedirectPath(searchParams.get('next'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}