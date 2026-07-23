'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { uploadFileToR2 } from '@/lib/r2'
import { analyzeDocumentWithGemini } from '@/lib/gemini'
import fs from 'fs/promises'
import path from 'path'

export type ActionResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string }

const UploadDocumentSchema = z.object({
  description: z.string().max(1000).optional().nullable(),
  fileType: z.enum(['resume', 'coverletter', 'other']),
  applicationId: z.string().optional().nullable(),
})

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Uploads a document to R2, runs Gemini feedback analysis, and stores the document in the DB.
 */
export async function uploadDocumentAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  const file = formData.get('file') as File | null
  const fileType = formData.get('fileType') as 'resume' | 'coverletter' | 'other'
  const description = formData.get('description') as string | null
  const applicationId = formData.get('applicationId') as string | null

  if (!file || !(file instanceof File) || file.size === 0) {
    return { success: false, error: 'A valid file is required for upload.' }
  }

  const parsed = UploadDocumentSchema.safeParse({ fileType, description, applicationId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input fields' }
  }

  try {
    // 1. Check application details to get company and role for folder structure if linked
    let company: string | null = null
    let role: string | null = null
    if (applicationId) {
      const app = await db.application.findFirst({
        where: { id: applicationId, userId: session.user.id }
      })
      if (app) {
        company = app.company
        role = app.role
      }
    }

    // 2. Read file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 3. Upload to R2
    const uploadRes = await uploadFileToR2({
      buffer,
      filename: file.name,
      mimeType: file.type,
      company,
      role
    })

    // 5. If fileType is resume/coverletter and applicationId is specified, we can set as active or update paths on application
    if (applicationId) {
      const updateData: Record<string, any> = {}
      if (fileType === 'resume') {
        updateData.resumeName = file.name
        updateData.resumePath = uploadRes.path
      } else if (fileType === 'coverletter') {
        updateData.coverLetterName = file.name
        updateData.coverLetterPath = uploadRes.path
      }

      await db.application.update({
        where: { id: applicationId },
        data: updateData
      })
    }

    // 6. Save document to DB
    const newDoc = await db.document.create({
      data: {
        userId: session.user.id,
        name: file.name,
        description: description || null,
        path: uploadRes.path,
        fileSize: formatBytes(file.size),
        fileType,
        active: false,
        aiScore: null,
        aiFeedback: null,
        applicationId: applicationId || null,
      },
      include: {
        application: {
          select: {
            company: true,
            role: true,
          }
        }
      }
    })

    revalidatePath('/documents')
    if (applicationId) {
      revalidatePath(`/applications/${applicationId}`)
    }

    return { success: true, data: newDoc }
  } catch (error) {
    console.error('Error handling document upload:', error)
    return { success: false, error: 'Upload failed: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

/**
 * Toggles a document's active status.
 * If setting a resume to active, disables all other resumes.
 */
export async function toggleDocumentActiveAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  try {
    const doc = await db.document.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!doc) {
      return { success: false, error: 'Document not found.' }
    }

    const nextActive = !doc.active

    if (nextActive && doc.fileType === 'resume') {
      // Set all other resumes to inactive
      await db.document.updateMany({
        where: { userId: session.user.id, fileType: 'resume' },
        data: { active: false }
      })
    }

    const updated = await db.document.update({
      where: { id },
      data: { active: nextActive }
    })

    revalidatePath('/documents')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Error toggling document active status:', error)
    return { success: false, error: 'Failed to update active state.' }
  }
}

/**
 * Deletes a document record and its association.
 */
export async function deleteDocumentAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  try {
    const doc = await db.document.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!doc) {
      return { success: false, error: 'Document not found.' }
    }

    await db.document.delete({
      where: { id }
    })

    revalidatePath('/documents')
    if (doc.applicationId) {
      revalidatePath(`/applications/${doc.applicationId}`)
    }

    return { success: true, data: { id } }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { success: false, error: 'Failed to delete document.' }
  }
}

/**
 * Analyzes a document asynchronously with Gemini and saves the results in the DB.
 */
export async function analyzeDocumentAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  try {
    const doc = await db.document.findFirst({
      where: { id, userId: session.user.id }
    })

    if (!doc) {
      return { success: false, error: 'Document not found.' }
    }

    // 1. Get file content as a Buffer
    let buffer: Buffer
    if (doc.path.startsWith('http://') || doc.path.startsWith('https://')) {
      const res = await fetch(doc.path)
      if (!res.ok) throw new Error('Failed to fetch file from remote storage')
      const arrayBuffer = await res.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else {
      const localPath = path.join(process.cwd(), 'public', doc.path)
      buffer = await fs.readFile(localPath)
    }

    // 2. Determine mimeType
    const ext = path.extname(doc.name).toLowerCase()
    let mimeType = 'application/pdf'
    if (ext === '.txt') {
      mimeType = 'text/plain'
    } else if (ext === '.docx') {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    } else if (ext === '.doc') {
      mimeType = 'application/msword'
    }

    // 3. Call Gemini
    const aiAnalysis = await analyzeDocumentWithGemini(buffer, doc.name, mimeType)

    // 4. Update in DB
    const updated = await db.document.update({
      where: { id },
      data: {
        aiScore: aiAnalysis.score,
        aiFeedback: JSON.stringify(aiAnalysis.feedback),
      }
    })

    revalidatePath('/documents')
    if (doc.applicationId) {
      revalidatePath(`/applications/${doc.applicationId}`)
    }

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error analyzing document:', error)
    return { success: false, error: 'AI Analysis failed: ' + (error instanceof Error ? error.message : String(error)) }
  }
}
