import { authConfig } from '@/lib/auth'
import NextAuth from 'next-auth'

export default NextAuth(authConfig).auth

export const config = {
  // Protect routes starting with overview, dashboard, applications, interviews
  matcher: ['/overview/:path*', '/dashboard/:path*', '/applications/:path*', '/interviews/:path*'],
}
