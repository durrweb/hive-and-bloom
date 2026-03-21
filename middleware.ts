// middleware.ts (root of project)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — important, don't remove
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/community/dashboard', '/community/my-posts', '/community/settings']
  const isProtectedPath = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtectedPath && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ['/auth/login', '/auth/signup']
  const isAuthPath = authPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isAuthPath && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/community'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
