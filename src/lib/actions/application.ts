'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { ApplicationStatus } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { uploadFileToR2 } from '@/lib/r2'
import { analyzeDocumentWithGemini } from '@/lib/gemini'

const CreateApplicationSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100),
  role: z.string().min(1, 'Role title is required').max(100),
  status: z.nativeEnum(ApplicationStatus),
  location: z.string().max(100).optional().nullable(),
  url: z.string().url('Invalid URL format').or(z.literal('')).optional().nullable(),
  salary: z.preprocess((val) => (val === '' ? null : Number(val)), z.number().int().positive().nullable()),
  notes: z.string().max(5000).optional().nullable(),
  appliedAt: z.string().optional().nullable(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM').optional(),
})

const UpdateApplicationSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1, 'Company name is required').max(100).optional(),
  role: z.string().min(1, 'Role title is required').max(100).optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  location: z.string().max(100).optional().nullable(),
  url: z.string().url('Invalid URL format').or(z.literal('')).optional().nullable(),
  salary: z.preprocess((val) => (val === '' || val === null ? null : Number(val)), z.number().int().positive().nullable().optional()),
  notes: z.string().max(5000).optional().nullable(),
  appliedAt: z.string().optional().nullable(),
  recruiterName: z.string().max(100).optional().nullable(),
  recruiterEmail: z.string().email('Invalid email format').or(z.literal('')).optional().nullable(),
  recruiterPhone: z.string().max(30).optional().nullable(),
  interviewLink: z.string().url('Invalid URL format').or(z.literal('')).optional().nullable(),
  resumeName: z.string().max(100).optional().nullable(),
  coverLetterName: z.string().max(100).optional().nullable(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
})

const CreateTimelineEventSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().min(1, 'Event title is required').max(100),
  description: z.string().max(1000).optional().nullable(),
  date: z.string().optional().nullable(),
})

export type ActionResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createApplicationAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  const rawInput = {
    company: formData.get('company'),
    role: formData.get('role'),
    status: formData.get('status'),
    location: formData.get('location'),
    url: formData.get('url'),
    salary: formData.get('salary'),
    notes: formData.get('notes'),
    appliedAt: formData.get('appliedAt'),
    priority: formData.get('priority') || undefined,
  }

  const parsed = CreateApplicationSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input parameters',
    }
  }

  try {
    const { company, role, status, location, url, salary, notes, appliedAt, priority } = parsed.data

    const app = await db.application.create({
      data: {
        userId: session.user.id,
        company,
        role,
        status,
        location: location || null,
        url: url || null,
        salary: salary || null,
        notes: notes || null,
        appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
        priority: priority ?? 'MEDIUM',
      },
    })

    // Create an initial timeline event
    await db.timelineEvent.create({
      data: {
        applicationId: app.id,
        title: 'Applied',
        description: `Submitted application for ${role} position`,
        date: appliedAt ? new Date(appliedAt) : new Date(),
      }
    })

    revalidatePath('/applications')
    return { success: true, data: { id: app.id } }
  } catch (error) {
    console.error('Error creating application:', error)
    return { success: false, error: 'Failed to create job application. Please try again.' }
  }
}

export async function updateApplicationAction(
  formData: FormData
): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  const rawInput: Record<string, any> = {
    id: formData.get('id'),
    company: formData.get('company') || undefined,
    role: formData.get('role') || undefined,
    status: formData.get('status') || undefined,
    location: formData.get('location'),
    url: formData.get('url'),
    salary: formData.get('salary'),
    notes: formData.get('notes'),
    appliedAt: formData.get('appliedAt'),
    recruiterName: formData.get('recruiterName'),
    recruiterEmail: formData.get('recruiterEmail'),
    recruiterPhone: formData.get('recruiterPhone'),
    interviewLink: formData.get('interviewLink'),
    resumeName: formData.get('resumeName'),
    coverLetterName: formData.get('coverLetterName'),
    priority: formData.get('priority') || undefined,
  }

  const parsed = UpdateApplicationSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input parameters',
    }
  }

  try {
    const {
      id,
      company,
      role,
      status,
      location,
      url,
      salary,
      notes,
      appliedAt,
      recruiterName,
      recruiterEmail,
      recruiterPhone,
      interviewLink,
      resumeName,
      coverLetterName,
      priority,
    } = parsed.data

    // Check ownership
    const existing = await db.application.findFirst({
      where: { id, userId: session.user.id }
    })
    if (!existing) {
      return { success: false, error: 'Application not found or unauthorized' }
    }

    const updateData: Record<string, any> = {}
    if (company !== undefined) updateData.company = company
    if (role !== undefined) updateData.role = role
    if (status !== undefined) updateData.status = status
    if (location !== undefined) updateData.location = location || null
    if (url !== undefined) updateData.url = url || null
    if (salary !== undefined) updateData.salary = salary ?? null
    if (notes !== undefined) updateData.notes = notes || null
    if (appliedAt !== undefined) updateData.appliedAt = appliedAt ? new Date(appliedAt) : null
    if (recruiterName !== undefined) updateData.recruiterName = recruiterName || null
    if (recruiterEmail !== undefined) updateData.recruiterEmail = recruiterEmail || null
    if (recruiterPhone !== undefined) updateData.recruiterPhone = recruiterPhone || null
    if (interviewLink !== undefined) updateData.interviewLink = interviewLink || null
    if (resumeName !== undefined) updateData.resumeName = resumeName || null
    if (coverLetterName !== undefined) updateData.coverLetterName = coverLetterName || null
    if (priority !== undefined) updateData.priority = priority

    await db.application.update({
      where: { id },
      data: updateData
    })

    // If status changed, create a timeline event automatically
    if (status && status !== existing.status) {
      const statusLabel = status.charAt(0) + status.slice(1).toLowerCase()
      await db.timelineEvent.create({
        data: {
          applicationId: id,
          title: `Stage: ${statusLabel}`,
          description: `Updated status from ${existing.status} to ${status}`,
          date: new Date(),
        }
      })
    }

    revalidatePath('/applications')
    revalidatePath(`/applications/${id}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error updating application:', error)
    return { success: false, error: 'Failed to update application. Please try again.' }
  }
}

export async function createTimelineEventAction(
  formData: FormData
): Promise<ActionResult<void>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  const rawInput = {
    applicationId: formData.get('applicationId'),
    title: formData.get('title'),
    description: formData.get('description'),
    date: formData.get('date'),
  }

  const parsed = CreateTimelineEventSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input parameters',
    }
  }

function getStatusFromTimelineTitle(title: string): ApplicationStatus | null {
  const t = title.toLowerCase()
  if (t === 'applied') return ApplicationStatus.APPLIED
  if (t.includes('phone screen') || t.includes('screening')) return ApplicationStatus.SCREENING
  if (t.includes('interview') || t.includes('onsite')) return ApplicationStatus.INTERVIEWING
  if (t.includes('offer')) return ApplicationStatus.OFFER
  if (t.includes('reject')) return ApplicationStatus.REJECTED
  if (t.includes('ghost')) return ApplicationStatus.GHOSTED
  if (t.includes('withdraw')) return ApplicationStatus.WITHDRAWN
  if (t.includes('wishlist')) return ApplicationStatus.WISHLIST
  return null
}

  try {
    const { applicationId, title, description, date } = parsed.data

    // Check ownership of the application
    const app = await db.application.findFirst({
      where: { id: applicationId, userId: session.user.id }
    })
    if (!app) {
      return { success: false, error: 'Application not found or unauthorized' }
    }

    await db.timelineEvent.create({
      data: {
        applicationId,
        title,
        description: description || null,
        date: date ? new Date(date) : new Date(),
      }
    })

    const matchedStatus = getStatusFromTimelineTitle(title)
    if (matchedStatus && matchedStatus !== app.status) {
      await db.application.update({
        where: { id: applicationId },
        data: { status: matchedStatus }
      })
    }

    revalidatePath('/applications')
    revalidatePath(`/applications/${applicationId}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error creating timeline event:', error)
    return { success: false, error: 'Failed to add timeline event. Please try again.' }
  }
}


export async function uploadApplicationLogoAction(
  formData: FormData
): Promise<ActionResult<{ logoUrl: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  const applicationId = formData.get('applicationId') as string
  const logoFile = formData.get('logo') as File | null

  if (!applicationId || !logoFile) {
    return { success: false, error: 'Application ID and logo file are required' }
  }

  // Check ownership
  const app = await db.application.findFirst({
    where: { id: applicationId, userId: session.user.id }
  })
  if (!app) {
    return { success: false, error: 'Application not found' }
  }

  try {
    const bytes = await logoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure public/logos directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'logos')
    await fs.mkdir(uploadDir, { recursive: true })

    const fileExtension = path.extname(logoFile.name) || '.png'
    const fileName = `${applicationId}-${Date.now()}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    await fs.writeFile(filePath, buffer)
    const logoUrl = `/logos/${fileName}`

    await db.application.update({
      where: { id: applicationId },
      data: { logoUrl }
    })

    revalidatePath('/applications')
    revalidatePath(`/applications/${applicationId}`)

    return { success: true, data: { logoUrl } }
  } catch (error) {
    console.error('Error uploading logo:', error)
    return { success: false, error: 'Failed to upload logo file' }
  }
}

export async function uploadApplicationDocumentAction(
  formData: FormData
): Promise<ActionResult<{ resumeName?: string; coverLetterName?: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  const applicationId = formData.get('applicationId') as string
  const documentType = formData.get('documentType') as 'resume' | 'coverletter'
  const file = formData.get('file') as File | null

  if (!applicationId || !documentType || !file) {
    return { success: false, error: 'Application ID, type, and file are required' }
  }

  // Check ownership
  const app = await db.application.findFirst({
    where: { id: applicationId, userId: session.user.id }
  })
  if (!app) {
    return { success: false, error: 'Application not found' }
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudflare R2
    const uploadRes = await uploadFileToR2({
      buffer,
      filename: file.name,
      mimeType: file.type,
      company: app.company,
      role: app.role
    })

    // Analyze with Gemini
    const aiAnalysis = await analyzeDocumentWithGemini(buffer, file.name, file.type)

    const updateData: Record<string, any> = {}
    if (documentType === 'resume') {
      updateData.resumeName = file.name
      updateData.resumePath = uploadRes.path
    } else {
      updateData.coverLetterName = file.name
      updateData.coverLetterPath = uploadRes.path
    }

    await db.application.update({
      where: { id: applicationId },
      data: updateData
    })

    function formatBytes(bytes: number, decimals = 1): string {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }

    // Save as document record
    await db.document.create({
      data: {
        userId: session.user.id,
        name: file.name,
        description: `Uploaded from application details for ${app.company} (${app.role})`,
        path: uploadRes.path,
        fileSize: formatBytes(file.size),
        fileType: documentType === 'resume' ? 'resume' : 'coverletter',
        active: false,
        aiScore: aiAnalysis.score,
        aiFeedback: JSON.stringify(aiAnalysis.feedback),
        applicationId,
      }
    })

    revalidatePath('/applications')
    revalidatePath(`/applications/${applicationId}`)
    revalidatePath('/documents')

    return {
      success: true,
      data: {
        resumeName: documentType === 'resume' ? file.name : undefined,
        coverLetterName: documentType === 'coverletter' ? file.name : undefined,
      }
    }
  } catch (error) {
    console.error('Error uploading application document:', error)
    return { success: false, error: 'Failed to upload document file: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

