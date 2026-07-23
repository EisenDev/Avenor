import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { InterviewsClient } from './interviews-client'

export const dynamic = 'force-dynamic'

export default async function InterviewsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // Fetch all applications to populate the drop-down selector
  const applications = await db.application.findMany({
    where: { userId },
    select: {
      id: true,
      company: true,
      role: true,
    },
    orderBy: {
      company: 'asc',
    },
  })

  // Fetch interviews for this user
  const dbInterviews = await db.interview.findMany({
    where: {
      application: {
        userId,
      },
    },
    include: {
      application: {
        select: {
          company: true,
          role: true,
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  })

  // Format datetimes to ISO string for Client Component transition
  const interviews = dbInterviews.map((item) => ({
    id: item.id,
    applicationId: item.applicationId,
    type: item.type,
    customType: item.customType,
    scheduledAt: item.scheduledAt.toISOString(),
    location: item.location,
    notes: item.notes,
    interviewer: item.interviewer,
    link: item.link,
    checklist: item.checklist,
    application: {
      company: item.application.company,
      role: item.application.role,
    },
  }))

  return (
    <InterviewsClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      initialInterviews={interviews}
      applications={applications}
    />
  )
}
