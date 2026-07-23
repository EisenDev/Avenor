'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { parseOfferLetterWithGemini, generateNegotiationWithGemini } from '@/lib/gemini'

export type ActionResult<T = any> =
  | { success: true; data?: T }
  | { success: false; error: string }

const OfferFormSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  baseSalary: z.number().nonnegative('Base salary must be positive'),
  bonus: z.number().nonnegative('Bonus must be positive or zero'),
  equity: z.number().nonnegative('Equity must be positive or zero'),
  location: z.string().min(1, 'Location is required'),
  status: z.string().default('PENDING'),
  expirationDate: z.string().or(z.date()).nullable().optional(),
  applicationId: z.string().nullable().optional(),
})

/**
 * Adds a new job offer and triggers a Gemini AI evaluation to calculate
 * its quality score and draft a negotiation email template based on current leverage.
 */
export async function addOfferAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  const userId = session.user.id

  const company = formData.get('company') as string
  const role = formData.get('role') as string
  const baseSalary = parseFloat(formData.get('baseSalary') as string || '0')
  const bonus = parseFloat(formData.get('bonus') as string || '0')
  const equity = parseFloat(formData.get('equity') as string || '0')
  const location = formData.get('location') as string
  const status = formData.get('status') as string || 'PENDING'
  const expirationDateStr = formData.get('expirationDate') as string
  const applicationId = formData.get('applicationId') as string

  // Validate form fields
  const parsed = OfferFormSchema.safeParse({
    company,
    role,
    baseSalary,
    bonus,
    equity,
    location,
    status,
    expirationDate: expirationDateStr || null,
    applicationId: applicationId || null,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input data' }
  }

  try {
    // 1. Fetch other offers for comparison leverage
    const otherOffers = await db.offer.findMany({
      where: { userId, NOT: { company } },
      select: { company: true, role: true, baseSalary: true, bonus: true, equity: true, location: true },
    })

    // 2. Call Gemini to calculate score and negotiation template
    const analysis = await generateNegotiationWithGemini(
      { company, role, baseSalary, bonus, equity, location },
      otherOffers
    )

    const expDate = expirationDateStr ? new Date(expirationDateStr) : null

    // 3. Save to database
    const newOffer = await db.offer.create({
      data: {
        userId,
        company,
        role,
        baseSalary,
        bonus,
        equity,
        location,
        status,
        expirationDate: expDate,
        score: analysis.score,
        scoreExplanation: analysis.explanation,
        negotiationEmail: analysis.negotiationEmail,
        applicationId: applicationId || null,
      }
    })

    // 4. Update the status of linked application if accepted
    if (applicationId) {
      const appStatus = status === 'ACCEPTED' 
        ? 'ACCEPTED' 
        : status === 'DECLINED' 
          ? 'REJECTED' 
          : 'OFFER'
      await db.application.update({
        where: { id: applicationId },
        data: { status: appStatus }
      })
    }

    revalidatePath('/salary')
    return { success: true, data: newOffer }
  } catch (error) {
    console.error('Error adding offer:', error)
    return { success: false, error: 'Failed to record offer and score.' }
  }
}

/**
 * Parses an offer letter file (PDF/Image) using Gemini to autofill form values on the client.
 */
export async function parseOfferLetterAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) {
    return { success: false, error: 'No file uploaded.' }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const parsedData = await parseOfferLetterWithGemini(buffer, file.name, file.type)

    return { success: true, data: parsedData }
  } catch (error) {
    console.error('Error parsing offer letter:', error)
    return { success: false, error: 'Failed to extract terms from offer letter.' }
  }
}

/**
 * Updates an offer status (e.g. ACCEPTED, DECLINED, PENDING).
 * If status changes, updates any linked application's status to remain in sync.
 */
export async function updateOfferStatusAction(id: string, status: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  try {
    const updatedOffer = await db.offer.update({
      where: { id, userId: session.user.id },
      data: { status }
    })

    if (updatedOffer.applicationId) {
      const appStatus = status === 'ACCEPTED' 
        ? 'ACCEPTED' 
        : status === 'DECLINED' 
          ? 'REJECTED' 
          : 'OFFER'
      await db.application.update({
        where: { id: updatedOffer.applicationId },
        data: { status: appStatus }
      })
    }

    revalidatePath('/salary')
    return { success: true, data: updatedOffer }
  } catch (error) {
    console.error('Error updating offer status:', error)
    return { success: false, error: 'Failed to update status.' }
  }
}

/**
 * Deletes an offer from the database.
 */
export async function deleteOfferAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized.' }
  }

  try {
    await db.offer.delete({
      where: { id, userId: session.user.id }
    })

    revalidatePath('/salary')
    return { success: true }
  } catch (error) {
    console.error('Error deleting offer:', error)
    return { success: false, error: 'Failed to delete offer.' }
  }
}
