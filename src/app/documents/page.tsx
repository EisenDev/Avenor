import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { DocumentsClient } from './documents-client'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // Fetch documents for the active user
  const documents = await db.document.findMany({
    where: {
      userId,
    },
    include: {
      application: {
        select: {
          company: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Fetch applications to populate dropdown for linked files
  const applications = await db.application.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      company: true,
      role: true,
    },
    orderBy: {
      company: 'asc',
    },
  })

  return (
    <DocumentsClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      documents={documents}
      applications={applications}
    />
  )
}
