import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs/promises'
import path from 'path'

interface RouteParams {
  params: Promise<{
    id: string
    filename: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id, filename } = await params

  // Fetch application
  const app = await db.application.findUnique({
    where: { id }
  })

  if (!app) {
    return new NextResponse('Application not found', { status: 404 })
  }

  // Determine file type requested
  const isResume = filename.toLowerCase().endsWith('resume.pdf')
  const isCoverLetter =
    filename.toLowerCase().endsWith('cover-letter.pdf') ||
    filename.toLowerCase().endsWith('coverletter.pdf')

  let relativePath: string | null = null
  let originalName: string | null = null

  if (isResume) {
    relativePath = app.resumePath
    originalName = app.resumeName || 'resume.pdf'
  } else if (isCoverLetter) {
    relativePath = app.coverLetterPath
    originalName = app.coverLetterName || 'cover-letter.pdf'
  }

  if (!relativePath) {
    return new NextResponse('Document not found for this application', { status: 404 })
  }

  // If remote URL (Cloudflare R2), redirect to it
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return NextResponse.redirect(new URL(relativePath))
  }

  try {
    const fullPath = path.join(process.cwd(), 'public', relativePath)
    const fileBuffer = await fs.readFile(fullPath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${originalName}"`,
      },
    })
  } catch (error) {
    console.error('Error serving PDF document:', error)
    return new NextResponse('File error. The document might have been moved or deleted.', { status: 500 })
  }
}
