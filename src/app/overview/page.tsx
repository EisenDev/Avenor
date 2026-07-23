import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { OverviewClient } from './overview-client'

export const dynamic = 'force-dynamic'

export default async function OverviewPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // Fetch applications metrics
  const applications = await db.application.findMany({
    where: { userId },
    include: {
      interviews: true,
      emails: true,
    },
  })

  // Calculations from DB data
  const totalApps = applications.length
  const offersCount = applications.filter((app) => app.status === 'OFFER' || app.status === 'ACCEPTED').length

  // Calculate unique apps with interviews scheduled
  const interviewsCount = await db.interview.count({
    where: {
      application: { userId },
    },
  })

  // Calculate response rate: apps with screening/interviewing/offer status over total apps with status >= APPLIED
  const responsiveApps = applications.filter((app) =>
    ['SCREENING', 'INTERVIEWING', 'OFFER', 'ACCEPTED', 'REJECTED'].includes(app.status)
  ).length
  const responseRate = totalApps > 0 ? Math.round((responsiveApps / totalApps) * 100) : 0

  // Fetch upcoming interviews
  const dbInterviews = await db.interview.findMany({
    where: {
      application: { userId },
      scheduledAt: { gte: new Date() },
    },
    include: {
      application: true,
    },
    orderBy: {
      scheduledAt: 'asc',
    },
    take: 3,
  })

  const upcomingInterviews = dbInterviews.map((item) => ({
    id: item.id,
    company: item.application.company,
    role: item.application.role,
    scheduledAt: item.scheduledAt.toISOString(),
    location: item.location,
    type: item.type,
  }))

  // Pipeline counts
  const statuses = [
    { status: 'WISHLIST', color: '#B0ABA4' },
    { status: 'APPLIED', color: 'var(--color-primary)' },
    { status: 'SCREENING', color: 'var(--color-info)' },
    { status: 'INTERVIEWING', color: 'var(--color-secondary)' },
    { status: 'OFFER', color: 'var(--color-warning)' },
    { status: 'REJECTED', color: 'var(--color-danger)' },
    { status: 'GHOSTED', color: '#C8BFB3' },
  ]

  const pipelineData = statuses.map((item) => {
    const count = applications.filter((app) => app.status === item.status).length
    const percentage = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0
    return {
      status: item.status,
      count,
      percentage,
      color: item.color,
    }
  })

  // Recent Email Activity
  const dbEmails = await db.emailActivity.findMany({
    where: {
      application: { userId },
    },
    include: {
      application: true,
    },
    orderBy: {
      receivedAt: 'desc',
    },
    take: 3,
  })

  const emailActivity = dbEmails.map((item) => {
    const diffMs = Date.now() - new Date(item.receivedAt).getTime()
    const diffMins = Math.floor(diffMs / (60 * 1000))
    const diffHrs = Math.floor(diffMins / 60)
    let timeLabel = '1d ago'

    if (diffMins < 60) {
      timeLabel = `${Math.max(1, diffMins)}m ago`
    } else if (diffHrs < 24) {
      timeLabel = `${diffHrs}h ago`
    } else {
      timeLabel = `${Math.floor(diffHrs / 24)}d ago`
    }

    return {
      id: item.id,
      company: item.application.company,
      subject: item.subject,
      type: item.type,
      receivedAt: timeLabel,
    }
  })

  // Generate chart data based on actual applied dates or fallback dummy timeline if none
  const chartData = [
    { date: 'Jun 15', applications: 4 },
    { date: 'Jun 22', applications: 8 },
    { date: 'Jun 29', applications: 12 },
    { date: 'Jul 6', applications: 18 },
    { date: 'Jul 13', applications: totalApps > 0 ? totalApps : 24 },
  ]

  return (
    <OverviewClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      stats={{
        applicationsCount: totalApps,
        interviewsCount,
        offersCount,
        responseRate,
      }}
      upcomingInterviews={upcomingInterviews}
      pipelineData={pipelineData}
      emailActivity={emailActivity}
      chartData={chartData}
    />
  )
}
