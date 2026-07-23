import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Avenor | Career Tracker',
    template: '%s | Avenor',
  },
  description:
    'Avenor helps you manage job applications, track interviews, analyze resumes with AI, and grow your career—all in one place.',
  keywords: ['career management', 'job tracker', 'interview tracker', 'AI career', 'job search'],
  icons: {
    icon: '/avenor-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
