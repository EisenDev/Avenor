import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { AnalyticsClient } from './analytics-client'

export const dynamic = 'force-dynamic'

function getApplicationSource(url: string | null, notes: string | null): string {
  const lowerUrl = url?.toLowerCase() || ''
  const lowerNotes = notes?.toLowerCase() || ''
  
  if (lowerUrl.includes('linkedin.com')) return 'LinkedIn'
  if (lowerUrl.includes('angellist.com') || lowerUrl.includes('wellfound.com')) return 'AngelList'
  if (lowerUrl.includes('indeed.com')) return 'Indeed'
  if (lowerUrl.includes('ziprecruiter.com')) return 'ZipRecruiter'
  if (
    lowerUrl.includes('greenhouse.io') || 
    lowerUrl.includes('lever.co') || 
    lowerUrl.includes('myworkdayjobs.com') || 
    lowerUrl.includes('careers')
  ) {
    return 'Company Site'
  }
  if (lowerNotes.includes('referral') || lowerNotes.includes('referred')) return 'Referral'
  return 'Other'
}

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // 1. Fetch real application data (including interviews)
  const applications = await db.application.findMany({
    where: { userId },
    include: {
      interviews: true,
    }
  })

  // 2. Fetch real active resume (or all resumes to calculate match score)
  const documents = await db.document.findMany({
    where: { userId, fileType: 'resume' },
    select: {
      aiScore: true,
      active: true,
    }
  })

  const appliedApps = applications.filter(app => app.status !== 'WISHLIST')
  const totalApplied = appliedApps.length

  // Date constants
  const now = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

  // 3. Stats Calculations
  // Total applications trend
  const appsLast30Days = appliedApps.filter(app => {
    const date = app.appliedAt || app.createdAt
    return date >= thirtyDaysAgo
  }).length

  const appsPrev30Days = appliedApps.filter(app => {
    const date = app.appliedAt || app.createdAt
    return date >= sixtyDaysAgo && date < thirtyDaysAgo
  }).length

  let appsDelta = 0
  if (appsPrev30Days > 0) {
    appsDelta = Math.round(((appsLast30Days - appsPrev30Days) / appsPrev30Days) * 100)
  } else if (appsLast30Days > 0) {
    appsDelta = 100
  }
  const appsDeltaStr = appsDelta >= 0 ? `+${appsDelta}%` : `${appsDelta}%`
  const isAppsDeltaPositive = appsDelta > 0

  // Response Rate
  const respondedApps = appliedApps.filter(app => 
    ['SCREENING', 'INTERVIEWING', 'OFFER', 'ACCEPTED', 'REJECTED'].includes(app.status)
  )
  const responseRate = totalApplied > 0 
    ? Math.round((respondedApps.length / totalApplied) * 100) 
    : 0

  const totalAppliedLast30 = appliedApps.filter(app => (app.appliedAt || app.createdAt) >= thirtyDaysAgo).length
  const totalAppliedPrev30 = appliedApps.filter(app => {
    const date = app.appliedAt || app.createdAt
    return date >= sixtyDaysAgo && date < thirtyDaysAgo
  }).length

  const respondedLast30 = appliedApps.filter(app => {
    const date = app.appliedAt || app.createdAt
    return date >= thirtyDaysAgo && ['SCREENING', 'INTERVIEWING', 'OFFER', 'ACCEPTED', 'REJECTED'].includes(app.status)
  }).length

  const respondedPrev30 = appliedApps.filter(app => {
    const date = app.appliedAt || app.createdAt
    return date >= sixtyDaysAgo && date < thirtyDaysAgo && ['SCREENING', 'INTERVIEWING', 'OFFER', 'ACCEPTED', 'REJECTED'].includes(app.status)
  }).length

  const respRateLast30 = totalAppliedLast30 > 0 ? (respondedLast30 / totalAppliedLast30) * 100 : 0
  const respRatePrev30 = totalAppliedPrev30 > 0 ? (respondedPrev30 / totalAppliedPrev30) * 100 : 0
  const respDelta = Math.round(respRateLast30 - respRatePrev30)
  const respDeltaStr = respDelta >= 0 ? `+${respDelta}%` : `${respDelta}%`
  const isRespDeltaPositive = respDelta > 0

  // Interview Rate
  const interviewedApps = appliedApps.filter(app => 
    ['INTERVIEWING', 'OFFER', 'ACCEPTED'].includes(app.status) || app.interviews.length > 0
  )
  const interviewRate = totalApplied > 0 
    ? Math.round((interviewedApps.length / totalApplied) * 100) 
    : 0

  const interviewedLast30 = appliedApps.filter(app => {
    const date = app.appliedAt || app.createdAt
    return date >= thirtyDaysAgo && (['INTERVIEWING', 'OFFER', 'ACCEPTED'].includes(app.status) || app.interviews.length > 0)
  }).length

  const interviewedPrev30 = appliedApps.filter(app => {
    const date = app.appliedAt || app.createdAt
    return date >= sixtyDaysAgo && date < thirtyDaysAgo && (['INTERVIEWING', 'OFFER', 'ACCEPTED'].includes(app.status) || app.interviews.length > 0)
  }).length

  const intRateLast30 = totalAppliedLast30 > 0 ? (interviewedLast30 / totalAppliedLast30) * 100 : 0
  const intRatePrev30 = totalAppliedPrev30 > 0 ? (interviewedPrev30 / totalAppliedPrev30) * 100 : 0
  const intDelta = Math.round(intRateLast30 - intRatePrev30)
  const intDeltaStr = intDelta >= 0 ? `+${intDelta}%` : `${intDelta}%`
  const isInterviewsDeltaPositive = intDelta > 0

  // Offer Rate
  const offerApps = appliedApps.filter(app => ['OFFER', 'ACCEPTED'].includes(app.status))
  const offerRate = totalApplied > 0 
    ? Math.round((offerApps.length / totalApplied) * 100) 
    : 0

  const offeredLast30 = appliedApps.filter(app => {
    const date = app.appliedAt || app.createdAt
    return date >= thirtyDaysAgo && ['OFFER', 'ACCEPTED'].includes(app.status)
  }).length

  const offeredPrev30 = appliedApps.filter(app => {
    const date = app.appliedAt || app.createdAt
    return date >= sixtyDaysAgo && date < thirtyDaysAgo && ['OFFER', 'ACCEPTED'].includes(app.status)
  }).length

  const offRateLast30 = totalAppliedLast30 > 0 ? (offeredLast30 / totalAppliedLast30) * 100 : 0
  const offRatePrev30 = totalAppliedPrev30 > 0 ? (offeredPrev30 / totalAppliedPrev30) * 100 : 0
  const offDelta = Math.round(offRateLast30 - offRatePrev30)
  let offDeltaStr = 'Steady'
  if (offDelta > 0) {
    offDeltaStr = `+${offDelta}%`
  } else if (offDelta < 0) {
    offDeltaStr = `${offDelta}%`
  }
  const isOffersDeltaPositive = offDelta > 0

  // Career Health Score
  // 1. Application Activity: target is 8 applications in 30 days
  const activityScore = Math.min(Math.round((appsLast30Days / 8) * 100), 100)
  // 2. Market Match: Active resume score or average score, default to 70
  const activeResume = documents.find(doc => doc.active)
  let marketMatch = 70
  if (activeResume?.aiScore) {
    marketMatch = parseInt(activeResume.aiScore) || 70
  } else if (documents.length > 0) {
    const scores = documents
      .map(d => parseInt(d.aiScore || ''))
      .filter(s => !isNaN(s))
    if (scores.length > 0) {
      marketMatch = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }
  }

  const healthScore = totalApplied > 0
    ? Math.round((activityScore * 0.25) + (responseRate * 0.3) + (interviewRate * 0.25) + (marketMatch * 0.2))
    : marketMatch // default to market match score if no applications logged yet

  // 4. Applications Per Month (last 6 months dynamically calculated)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const chartData = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthLabel = monthNames[d.getMonth()]
    const year = d.getFullYear()
    const monthIndex = d.getMonth()
    
    const count = appliedApps.filter(app => {
      const appDate = app.appliedAt || app.createdAt
      return appDate.getMonth() === monthIndex && appDate.getFullYear() === year
    }).length
    
    chartData.push({
      name: monthLabel,
      apps: count
    })
  }

  // 5. Source Performance
  const sourceCounts: Record<string, number> = {
    'LinkedIn': 0,
    'Referral': 0,
    'Company Site': 0,
    'AngelList': 0,
    'Other': 0
  }

  appliedApps.forEach(app => {
    const src = getApplicationSource(app.url, app.notes)
    sourceCounts[src] = (sourceCounts[src] || 0) + 1
  })

  const sourceData = Object.entries(sourceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // 6. Conversion Funnel
  const screeningCount = appliedApps.filter(app => app.status !== 'APPLIED').length
  const interviewingCount = interviewedApps.length
  const offerCount = offerApps.length
  const acceptedCount = appliedApps.filter(app => app.status === 'ACCEPTED').length

  const funnelData = [
    { stage: 'Applied', count: totalApplied, width: '100%' },
    { 
      stage: 'Screening', 
      count: screeningCount,
      width: totalApplied > 0 ? `${Math.max(10, Math.round((screeningCount / totalApplied) * 100))}%` : '0%' 
    },
    { 
      stage: 'Interviewing', 
      count: interviewingCount,
      width: totalApplied > 0 ? `${Math.max(10, Math.round((interviewingCount / totalApplied) * 100))}%` : '0%'
    },
    { 
      stage: 'Offer Received', 
      count: offerCount,
      width: totalApplied > 0 ? `${Math.max(10, Math.round((offerCount / totalApplied) * 100))}%` : '0%'
    },
    { 
      stage: 'Accepted Offer', 
      count: acceptedCount,
      width: totalApplied > 0 ? `${Math.max(10, Math.round((acceptedCount / totalApplied) * 100))}%` : '0%'
    }
  ]

  return (
    <AnalyticsClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      stats={{
        totalApps: totalApplied,
        appsDeltaStr,
        isAppsDeltaPositive,
        responseRate,
        respDeltaStr,
        isRespDeltaPositive,
        interviewRate,
        intDeltaStr,
        isInterviewsDeltaPositive,
        offerRate,
        offDeltaStr,
        isOffersDeltaPositive,
        healthScore,
        healthBreakdown: {
          activity: activityScore,
          responseRate,
          interviewRate,
          marketMatch,
        },
        chartData,
        sourceData,
        funnelData,
      }}
    />
  )
}
