'use server'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getNextInterviewQuestionWithGemini, evaluateMockInterviewWithGemini } from '@/lib/gemini'
import { InterviewType } from '@prisma/client'

export type ActionResult<T = any> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * Creates a new scheduled interview.
 */
export async function createInterviewAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  const applicationId = formData.get('applicationId') as string
  const typeStr = formData.get('type') as string
  const customType = formData.get('customType') as string
  const scheduledAtStr = formData.get('scheduledAt') as string
  const location = formData.get('location') as string
  const interviewer = formData.get('interviewer') as string
  const link = formData.get('link') as string
  const notes = formData.get('notes') as string
  const checklist = formData.get('checklist') as string

  if (!applicationId || !scheduledAtStr) {
    return { success: false, error: 'Application and scheduled time are required.' }
  }

  try {
    const scheduledAt = new Date(scheduledAtStr)
    const type = (typeStr in InterviewType) ? (typeStr as InterviewType) : InterviewType.CUSTOM

    // Create interview
    const interview = await db.interview.create({
      data: {
        applicationId,
        type,
        customType: type === InterviewType.CUSTOM ? customType : null,
        scheduledAt,
        location: location || null,
        interviewer: interviewer || null,
        link: link || null,
        notes: notes || null,
        checklist: checklist || null,
      }
    })

    // Auto-update application status to INTERVIEWING
    await db.application.update({
      where: { id: applicationId, userId: session.user.id },
      data: { status: 'INTERVIEWING' }
    })

    // Log a timeline event
    await db.timelineEvent.create({
      data: {
        applicationId,
        title: `Scheduled ${type.toLowerCase()} interview`,
        description: `Scheduled for ${scheduledAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`
      }
    })

    revalidatePath('/interviews')
    revalidatePath(`/applications/${applicationId}`)
    return { success: true, data: interview }
  } catch (error) {
    console.error('Error creating interview:', error)
    return { success: false, error: 'Failed to schedule interview.' }
  }
}

/**
 * Updates an existing scheduled interview.
 */
export async function updateInterviewAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  const id = formData.get('id') as string
  const typeStr = formData.get('type') as string
  const customType = formData.get('customType') as string
  const scheduledAtStr = formData.get('scheduledAt') as string
  const location = formData.get('location') as string
  const interviewer = formData.get('interviewer') as string
  const link = formData.get('link') as string
  const notes = formData.get('notes') as string
  const checklist = formData.get('checklist') as string

  if (!id || !scheduledAtStr) {
    return { success: false, error: 'Interview ID and scheduled time are required.' }
  }

  try {
    const scheduledAt = new Date(scheduledAtStr)
    const type = (typeStr in InterviewType) ? (typeStr as InterviewType) : InterviewType.CUSTOM

    // Check ownership before update
    const existing = await db.interview.findFirst({
      where: { id, application: { userId: session.user.id } }
    })

    if (!existing) {
      return { success: false, error: 'Interview not found or unauthorized.' }
    }

    const updated = await db.interview.update({
      where: { id },
      data: {
        type,
        customType: type === InterviewType.CUSTOM ? customType : null,
        scheduledAt,
        location: location || null,
        interviewer: interviewer || null,
        link: link || null,
        notes: notes || null,
        checklist: checklist || null,
      }
    })

    revalidatePath('/interviews')
    revalidatePath(`/applications/${existing.applicationId}`)
    return { success: true, data: updated }
  } catch (error) {
    console.error('Error updating interview:', error)
    return { success: false, error: 'Failed to update interview.' }
  }
}

/**
 * Toggles checklist task items for a scheduled interview.
 */
export async function updateInterviewChecklistAction(
  interviewId: string,
  checklistJson: string
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  try {
    // Check ownership
    const existing = await db.interview.findFirst({
      where: { id: interviewId, application: { userId: session.user.id } }
    })

    if (!existing) {
      return { success: false, error: 'Interview not found or unauthorized.' }
    }

    const updated = await db.interview.update({
      where: { id: interviewId },
      data: { checklist: checklistJson }
    })

    revalidatePath('/interviews')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Error updating interview checklist:', error)
    return { success: false, error: 'Failed to update checklist.' }
  }
}

/**
 * Deletes a scheduled interview.
 */
export async function deleteInterviewAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  try {
    // Check ownership
    const existing = await db.interview.findFirst({
      where: { id, application: { userId: session.user.id } }
    })

    if (!existing) {
      return { success: false, error: 'Interview not found or unauthorized.' }
    }

    await db.interview.delete({
      where: { id }
    })

    revalidatePath('/interviews')
    revalidatePath(`/applications/${existing.applicationId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting interview:', error)
    return { success: false, error: 'Failed to delete interview.' }
  }
}

/**
 * Generates the next question in the voice interview simulation.
 */
export async function getInterviewTurnAction(
  applicationId: string,
  interviewType: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  userAnswer?: string
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  try {
    // Fetch application info
    const app = await db.application.findFirst({
      where: { id: applicationId, userId: session.user.id }
    })

    if (!app) {
      return { success: false, error: 'Application not found.' }
    }

    // Append user answer to history if provided
    const updatedHistory = [...history]
    if (userAnswer && userAnswer.trim() !== '') {
      updatedHistory.push({ role: 'user', content: userAnswer.trim() })
    }

    // Call Gemini
    const result = await getNextInterviewQuestionWithGemini(
      app.role,
      app.company,
      app.notes || '',
      interviewType,
      updatedHistory
    )

    // Append AI question if not ended
    if (!result.isEnded && result.question) {
      updatedHistory.push({ role: 'assistant', content: result.question })
    }

    return {
      success: true,
      data: {
        question: result.question,
        isEnded: result.isEnded,
        history: updatedHistory
      }
    }
  } catch (error) {
    console.error('Error in getInterviewTurnAction:', error)
    return { success: false, error: 'Failed to process interview turn.' }
  }
}

/**
 * Conducts a full transcript evaluation of the mock interview.
 */
export async function getInterviewEvaluationAction(
  applicationId: string,
  interviewType: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  try {
    const app = await db.application.findFirst({
      where: { id: applicationId, userId: session.user.id }
    })

    if (!app) {
      return { success: false, error: 'Application not found.' }
    }

    const evaluation = await evaluateMockInterviewWithGemini(
      app.role,
      app.company,
      interviewType,
      history
    )

    // Save session to database for history
    await db.mockInterviewSession.create({
      data: {
        applicationId,
        userId: session.user.id,
        interviewType,
        score: evaluation.score,
        decision: evaluation.decision,
        strengths: JSON.stringify(evaluation.strengths),
        weaknesses: JSON.stringify(evaluation.weaknesses),
        tips: JSON.stringify(evaluation.tips),
        transcript: JSON.stringify(history),
      }
    })

    // Add to timeline events for this application
    await db.timelineEvent.create({
      data: {
        applicationId,
        title: `AI ${interviewType.toLowerCase()} interview complete`,
        description: `Scored ${evaluation.score}/100. Hiring decision: ${evaluation.decision}.`
      }
    })

    revalidatePath(`/applications/${applicationId}`)
    return {
      success: true,
      data: evaluation
    }
  } catch (error) {
    console.error('Error in getInterviewEvaluationAction:', error)
    return { success: false, error: 'Failed to evaluate interview.' }
  }
}

/**
 * Fetches all past mock interview sessions for a given application.
 */
export async function getInterviewHistoryAction(applicationId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  try {
    const sessions = await db.mockInterviewSession.findMany({
      where: { applicationId, userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      data: sessions.map(s => ({
        id: s.id,
        interviewType: s.interviewType,
        score: s.score,
        decision: s.decision,
        strengths: JSON.parse(s.strengths),
        weaknesses: JSON.parse(s.weaknesses),
        tips: JSON.parse(s.tips),
        transcript: JSON.parse(s.transcript),
        createdAt: s.createdAt,
      }))
    }
  } catch (error) {
    console.error('Error fetching interview history:', error)
    return { success: false, error: 'Failed to fetch interview history.' }
  }
}

