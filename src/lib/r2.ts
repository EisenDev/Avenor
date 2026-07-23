import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import path from 'path'

// Initialize S3 client for Cloudflare R2
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
const rawEndpoint = process.env.CLOUDFLARE_R2_ENDPOINT || ''
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'avenor'
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || ''

// Clean endpoint if it contains bucket suffix
const endpoint = rawEndpoint.replace(/\/avenor$/, '')

const isR2Configured = !!(accessKeyId && secretAccessKey && endpoint)

let s3Client: S3Client | null = null
if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

interface UploadParams {
  buffer: Buffer
  filename: string
  mimeType: string
  company?: string | null
  role?: string | null
}

/**
 * Uploads a file buffer to Cloudflare R2.
 * Falls back to local public uploads folder if R2 is not fully configured.
 * Returns the public URL of the uploaded document.
 */
export async function uploadFileToR2({
  buffer,
  filename,
  mimeType,
  company,
  role
}: UploadParams): Promise<{ path: string; isR2: boolean }> {
  const fileExtension = path.extname(filename) || '.pdf'
  const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  // Build folder path key
  let folderSlug = 'general'
  if (company && role) {
    const companySlug = company.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    const roleSlug = role.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    folderSlug = `${companySlug}-${roleSlug}`
  }
  const key = `documents/${folderSlug}/${cleanFilename}`

  if (s3Client && isR2Configured) {
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        })
      )
      // Construct public Cloudflare R2 access URL
      const fileUrl = `${publicUrl.replace(/\/$/, '')}/${key}`
      return { path: fileUrl, isR2: true }
    } catch (error) {
      console.error('Error uploading to Cloudflare R2, falling back to local storage:', error)
    }
  }

  // Fallback to local storage
  const localDir = path.join(process.cwd(), 'public', 'uploads', 'documents', folderSlug)
  await fs.mkdir(localDir, { recursive: true })
  const localPath = path.join(localDir, cleanFilename)
  await fs.writeFile(localPath, buffer)

  const relativeUrl = `/uploads/documents/${folderSlug}/${cleanFilename}`
  return { path: relativeUrl, isR2: false }
}
