'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { generateCareerCoachingWithGemini } from '@/lib/gemini'

export type ActionResult<T = any> =
  | { success: true; data?: T }
  | { success: false; error: string }

const GoalFormSchema = z.object({
  targetApplications: z.number().int().positive('Target applications must be greater than 0'),
  targetInterviews: z.number().int().positive('Target interviews must be greater than 0'),
  targetOffers: z.number().int().positive('Target offers must be greater than 0'),
  targetSalary: z.number().positive('Target salary must be greater than 0'),
})

/**
 * Updates the user's career progress targets.
 */
export async function updateGoalTargetsAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  const userId = session.user.id

  const targetApplications = parseInt(formData.get('targetApplications') as string || '50')
  const targetInterviews = parseInt(formData.get('targetInterviews') as string || '10')
  const targetOffers = parseInt(formData.get('targetOffers') as string || '3')
  const targetSalary = parseFloat(formData.get('targetSalary') as string || '150000')

  const parsed = GoalFormSchema.safeParse({
    targetApplications,
    targetInterviews,
    targetOffers,
    targetSalary,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input data' }
  }

  try {
    const updatedGoal = await db.userGoal.upsert({
      where: { userId },
      update: {
        targetApplications,
        targetInterviews,
        targetOffers,
        targetSalary,
      },
      create: {
        userId,
        targetApplications,
        targetInterviews,
        targetOffers,
        targetSalary,
      }
    })

    revalidatePath('/goals')
    return { success: true, data: updatedGoal }
  } catch (error) {
    console.error('Error updating goal targets:', error)
    return { success: false, error: 'Failed to update goal targets.' }
  }
}

/**
 * Calls Gemini to analyze the user's active job pipeline metrics
 * and generate a customized action plan recommendation.
 */
export async function getAICoachingAction(): Promise<ActionResult<string>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  const userId = session.user.id

  try {
    // 1. Gather all pipeline metrics
    const [goal, appsCount, interviewsCount, offersCount, maxSalaryAgg, apps] = await Promise.all([
      db.userGoal.findUnique({ where: { userId } }),
      db.application.count({ where: { userId } }),
      db.interview.count({ where: { application: { userId } } }),
      db.offer.count({ where: { userId } }),
      db.offer.aggregate({ where: { userId }, _max: { baseSalary: true } }),
      db.application.findMany({ where: { userId }, select: { status: true } }),
    ])

    const salaryTarget = goal?.targetSalary ?? 150000
    const currentMaxSalary = maxSalaryAgg._max.baseSalary ?? 0

    // Construct status breakdown string
    const statusCounts: Record<string, number> = {}
    apps.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1
    })
    const statusesSummary = Object.entries(statusCounts)
      .map(([status, count]) => `${status}: ${count}`)
      .join(', ') || 'No applications logged yet.'

    // 2. Call Gemini
    const advice = await generateCareerCoachingWithGemini({
      applicationsCount: appsCount,
      interviewsCount: interviewsCount,
      offersCount: offersCount,
      salaryTarget,
      currentMaxSalary,
      statusesSummary,
    })

    // 3. Save coaching summary to database
    await db.userGoal.upsert({
      where: { userId },
      update: { aiCoachAdvice: advice },
      create: { userId, aiCoachAdvice: advice },
    })

    revalidatePath('/goals')
    return { success: true, data: advice }
  } catch (error) {
    console.error('Error getting AI coaching:', error)
    return { success: false, error: 'Failed to generate AI Coach insights.' }
  }
}
