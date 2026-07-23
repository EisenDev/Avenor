import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ApplicationDetailClient } from './application-detail-client'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params

  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // Fetch specific application from Postgres DB via Prisma
  const app = await db.application.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      timelineEvents: {
        orderBy: {
          date: 'desc'
        }
      }
    }
  })

  if (!app) {
    notFound()
  }

  // Format payload for Client Component props
  const applicationPayload = {
    id: app.id,
    company: app.company,
    role: app.role,
    status: app.status,
    location: app.location,
    url: app.url,
    salary: app.salary,
    notes: app.notes,
    appliedAt: app.appliedAt ? app.appliedAt.toISOString() : null,
    recruiterName: app.recruiterName,
    recruiterEmail: app.recruiterEmail,
    recruiterPhone: app.recruiterPhone,
    interviewLink: app.interviewLink,
    resumeName: app.resumeName,
    coverLetterName: app.coverLetterName,
    logoUrl: app.logoUrl,
    resumePath: app.resumePath,
    coverLetterPath: app.coverLetterPath,
    priority: app.priority,
    timelineEvents: app.timelineEvents.map(evt => ({
      id: evt.id,
      title: evt.title,
      description: evt.description,
      date: evt.date.toISOString(),
    }))
  }

  return (
    <ApplicationDetailClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      application={applicationPayload}
    />
  )
}
