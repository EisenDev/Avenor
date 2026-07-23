import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { GoalsClient } from './goals-client'

export const dynamic = 'force-dynamic'

export default async function GoalsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // 1. Fetch or create UserGoal targets atomically to prevent concurrency unique constraint errors
  const goal = await db.userGoal.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      targetApplications: 50,
      targetInterviews: 10,
      targetOffers: 3,
      targetSalary: 150000,
    }
  })

  // 2. Fetch current pipeline numbers
  const [appsCount, interviewsCount, offersCount, maxSalaryAgg] = await Promise.all([
    db.application.count({ where: { userId } }),
    db.interview.count({ where: { application: { userId } } }),
    db.offer.count({ where: { userId } }),
    db.offer.aggregate({ where: { userId }, _max: { baseSalary: true } }),
  ])

  const targetSalary = goal.targetSalary
  const currentMaxSalary = maxSalaryAgg._max.baseSalary ?? 0

  // 3. Construct Goals stats structure
  const goals = [
    {
      title: 'Applications Goal',
      current: appsCount,
      target: goal.targetApplications,
      percentage: goal.targetApplications > 0 ? Math.round((appsCount / goal.targetApplications) * 100) : 0,
      label: `Apply to ${goal.targetApplications} companies`,
      desc: 'Active applications status',
      unit: 'jobs',
    },
    {
      title: 'Interviews Goal',
      current: interviewsCount,
      target: goal.targetInterviews,
      percentage: goal.targetInterviews > 0 ? Math.round((interviewsCount / goal.targetInterviews) * 100) : 0,
      label: `Secure ${goal.targetInterviews} interviews`,
      desc: 'HR or technical screenings',
      unit: 'interviews',
    },
    {
      title: 'Offer Goal',
      current: offersCount,
      target: goal.targetOffers,
      percentage: goal.targetOffers > 0 ? Math.round((offersCount / goal.targetOffers) * 100) : 0,
      label: `Receive ${goal.targetOffers} written offers`,
      desc: 'Acceptance negotiation stages',
      unit: 'offers',
    },
    {
      title: 'Salary Target',
      current: `$${Math.round(currentMaxSalary / 1000)}k`,
      target: `$${Math.round(targetSalary / 1000)}k`,
      percentage: targetSalary > 0 ? Math.round((currentMaxSalary / targetSalary) * 100) : 0,
      label: `Target $${Math.round(targetSalary / 1000)}k base comp`,
      desc: 'Negotiation thresholds',
      unit: 'base',
    },
  ]

  // 4. Calculate current week's application volume (Mon-Sun)
  const now = new Date()
  const currentDay = now.getDay()
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1
  
  const monday = new Date(now)
  monday.setDate(now.getDate() - distanceToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const weeklyApps = await db.application.findMany({
    where: {
      userId,
      appliedAt: {
        gte: monday,
        lte: sunday,
      }
    },
    select: { appliedAt: true }
  })

  const daysName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weeklyData = daysName.map((name, index) => {
    const count = weeklyApps.filter(app => {
      if (!app.appliedAt) return false
      const d = new Date(app.appliedAt).getDay()
      const mappedIndex = d === 0 ? 6 : d - 1
      return mappedIndex === index
    }).length
    return { name, apps: count }
  })

  const streakDays = weeklyData.map(d => ({
    day: d.name[0],
    filled: d.apps > 0
  }))

  // 5. Calculate consecutive day streak
  const allAppDates = await db.application.findMany({
    where: { userId, NOT: { appliedAt: null } },
    select: { appliedAt: true },
    orderBy: { appliedAt: 'desc' }
  })

  let streak = 0
  const appliedDateSet = new Set(
    allAppDates
      .map(a => a.appliedAt ? new Date(a.appliedAt).toISOString().split('T')[0] : '')
      .filter(Boolean)
  )

  const checkDate = new Date()
  checkDate.setHours(0, 0, 0, 0)
  const todayStr = checkDate.toISOString().split('T')[0]

  const yesterday = new Date(checkDate)
  yesterday.setDate(checkDate.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (appliedDateSet.has(todayStr) || appliedDateSet.has(yesterdayStr)) {
    const currentCheck = appliedDateSet.has(todayStr) ? checkDate : yesterday
    while (appliedDateSet.has(currentCheck.toISOString().split('T')[0])) {
      streak++
      currentCheck.setDate(currentCheck.getDate() - 1)
    }
  }

  // 6. Achievements unlock logic
  const achievements = []

  // First Application
  const firstApp = await db.application.findFirst({
    where: { userId },
    orderBy: { appliedAt: 'asc' }
  })
  achievements.push({
    id: 1,
    title: 'First Application',
    icon: '🌟',
    active: appsCount >= 1,
    date: firstApp?.appliedAt
      ? `Earned ${new Date(firstApp.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : 'Locked',
  })

  // 7-Day Streak
  achievements.push({
    id: 2,
    title: '7-Day Streak',
    icon: '🔥',
    active: streak >= 7,
    date: streak >= 7 ? 'Earned Today' : 'Locked',
  })

  // First Interview
  const firstInt = await db.interview.findFirst({
    where: { application: { userId } },
    orderBy: { scheduledAt: 'asc' }
  })
  achievements.push({
    id: 3,
    title: 'First Interview',
    icon: '🏆',
    active: interviewsCount >= 1,
    date: firstInt?.scheduledAt
      ? `Earned ${new Date(firstInt.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : 'Locked',
  })

  // 50 Applications
  achievements.push({
    id: 4,
    title: '50 Applications',
    icon: '💼',
    active: appsCount >= 50,
    date: appsCount >= 50 ? 'Earned' : 'Locked',
  })

  return (
    <GoalsClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      goals={goals}
      achievements={achievements}
      weeklyData={weeklyData}
      streak={streak}
      streakDays={streakDays}
      aiCoachAdvice={goal.aiCoachAdvice || ''}
      targets={{
        targetApplications: goal.targetApplications,
        targetInterviews: goal.targetInterviews,
        targetOffers: goal.targetOffers,
        targetSalary: goal.targetSalary,
      }}
    />
  )
}
