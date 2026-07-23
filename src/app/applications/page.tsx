import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ApplicationsClient } from './applications-client'

export const dynamic = 'force-dynamic'

export default async function ApplicationsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // Fetch applications from Postgres DB via Prisma
  const dbApplications = await db.application.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  // Format DB payload for Client Component props
  const applications = dbApplications.map((app) => ({
    id: app.id,
    company: app.company,
    role: app.role,
    status: app.status,
    location: app.location,
    url: app.url,
    salary: app.salary,
    notes: app.notes,
    appliedAt: app.appliedAt ? app.appliedAt.toISOString() : null,
    logoUrl: app.logoUrl,
    priority: app.priority,
  }))

  return (
    <ApplicationsClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      initialApplications={applications}
    />
  )
}
