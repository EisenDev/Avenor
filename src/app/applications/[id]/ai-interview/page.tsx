import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { InterviewClient } from './interview-client'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}

export default async function AIInterviewPage({ params, searchParams }: Props) {
  const { id } = await params
  const { type } = await searchParams

  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // Fetch application detail from Postgres DB
  const app = await db.application.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      company: true,
      role: true,
      notes: true,
    }
  })

  if (!app) {
    notFound()
  }

  const interviewType = type === 'HR' ? 'HR' : type === 'BOTH' ? 'BOTH' : 'TECHNICAL'

  return (
    <InterviewClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      application={{
        id: app.id,
        company: app.company,
        role: app.role,
        notes: app.notes,
      }}
      interviewType={interviewType}
    />
  )
}
