import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { CalendarClient } from './calendar-client'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

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
  })

  // Fetch timeline events for this user (e.g. deadlines, milestones, rejections, offers)
  const dbTimelineEvents = await db.timelineEvent.findMany({
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
  })

  // Format events dynamically
  const interviews = dbInterviews.map((item) => ({
    id: item.id,
    applicationId: item.applicationId,
    type: 'interview' as const,
    title: item.type === 'CUSTOM' ? (item.customType || 'Interview') : `${item.type.charAt(0) + item.type.slice(1).replace('_', ' ').toLowerCase()} Interview`,
    company: item.application.company,
    role: item.application.role,
    date: item.scheduledAt.toISOString(),
  }))

  // Only include timeline events that represent actual scheduled events, screens, calls, or custom events.
  // Exclude static status logs like "Applied", "Rejected", "Offer Received", "Follow-up Sent".
  const timelineEvents = dbTimelineEvents
    .filter((item) => {
      const t = item.title.toLowerCase()
      return (
        t.includes('scheduled') ||
        t.includes('interview') ||
        t.includes('screen') ||
        t.includes('onsite') ||
        t.includes('call') ||
        t.includes('custom event')
      )
    })
    .map((item) => ({
      id: item.id,
      applicationId: item.applicationId,
      type: 'timeline' as const,
      title: item.title,
      company: item.application.company,
      role: item.application.role,
      date: item.date.toISOString(),
    }))

  const allEvents = [...interviews, ...timelineEvents]

  return (
    <CalendarClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      events={allEvents}
    />
  )
}
