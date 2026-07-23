import { PrismaClient, ApplicationStatus, InterviewType, EmailType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo@1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'arjay@avenor.app' },
    update: {},
    create: {
      name: 'Arjay Escabas',
      email: 'arjay@avenor.app',
      hashedPassword,
    },
  })

  console.log(`✓ User created: ${user.email}`)

  // Clear existing data for this user
  await prisma.emailActivity.deleteMany({ where: { application: { userId: user.id } } })
  await prisma.interview.deleteMany({ where: { application: { userId: user.id } } })
  await prisma.application.deleteMany({ where: { userId: user.id } })

  // Create applications
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        userId: user.id,
        company: 'Acme Corporation',
        role: 'Senior Frontend Developer',
        status: ApplicationStatus.INTERVIEWING,
        location: 'Remote',
        url: 'https://acme.com/careers',
        salary: 120000,
        appliedAt: new Date('2026-07-01'),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: 'Stripe',
        role: 'Full Stack Engineer',
        status: ApplicationStatus.SCREENING,
        location: 'San Francisco, CA',
        url: 'https://stripe.com/jobs',
        salary: 140000,
        appliedAt: new Date('2026-07-03'),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: 'Microsoft',
        role: 'Software Engineer II',
        status: ApplicationStatus.INTERVIEWING,
        location: 'Seattle, WA',
        url: 'https://careers.microsoft.com',
        salary: 130000,
        appliedAt: new Date('2026-06-28'),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: 'Notion',
        role: 'Product Engineer',
        status: ApplicationStatus.APPLIED,
        location: 'Remote',
        url: 'https://notion.so/careers',
        salary: 125000,
        appliedAt: new Date('2026-07-05'),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: 'Vercel',
        role: 'Frontend Engineer',
        status: ApplicationStatus.OFFER,
        location: 'Remote',
        salary: 150000,
        appliedAt: new Date('2026-06-15'),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: 'Linear',
        role: 'Senior Engineer',
        status: ApplicationStatus.REJECTED,
        location: 'Remote',
        appliedAt: new Date('2026-06-10'),
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: 'Figma',
        role: 'Software Engineer',
        status: ApplicationStatus.WISHLIST,
        location: 'San Francisco, CA',
        salary: 135000,
      },
    }),
    prisma.application.create({
      data: {
        userId: user.id,
        company: 'Anthropic',
        role: 'Full Stack Developer',
        status: ApplicationStatus.GHOSTED,
        location: 'San Francisco, CA',
        appliedAt: new Date('2026-06-01'),
      },
    }),
  ])

  console.log(`✓ ${applications.length} applications created`)

  // Create upcoming interviews
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(14, 0, 0, 0)

  const dayAfter = new Date(now)
  dayAfter.setDate(dayAfter.getDate() + 4)
  dayAfter.setHours(10, 0, 0, 0)

  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 8)
  nextWeek.setHours(11, 0, 0, 0)

  await Promise.all([
    prisma.interview.create({
      data: {
        applicationId: applications[0].id,
        type: InterviewType.TECHNICAL,
        scheduledAt: new Date('2026-07-18T14:00:00Z'),
        location: 'Google Meet',
      },
    }),
    prisma.interview.create({
      data: {
        applicationId: applications[1].id,
        type: InterviewType.PHONE,
        scheduledAt: new Date('2026-07-18T10:00:00Z'),
        location: 'Zoom',
      },
    }),
    prisma.interview.create({
      data: {
        applicationId: applications[2].id,
        type: InterviewType.SYSTEM_DESIGN,
        scheduledAt: new Date('2026-07-22T11:00:00Z'),
        location: 'Microsoft Teams',
      },
    }),
  ])

  console.log('✓ Interviews created')

  // Create email activity
  await Promise.all([
    prisma.emailActivity.create({
      data: {
        applicationId: applications[0].id,
        subject: 'Interview Invitation - Senior Frontend Developer',
        type: EmailType.INTERVIEW_INVITATION,
        receivedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
      },
    }),
    prisma.emailActivity.create({
      data: {
        applicationId: applications[1].id,
        subject: 'Assessment Invite - Stripe Engineering',
        type: EmailType.ASSESSMENT_INVITE,
        receivedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
    }),
    prisma.emailActivity.create({
      data: {
        applicationId: applications[5].id,
        subject: 'Application Update - Linear',
        type: EmailType.REJECTION,
        receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    }),
  ])

  console.log('✓ Email activity created')
  console.log('\n✅ Seed complete!')
  console.log('\n Demo credentials:')
  console.log('  Email: arjay@avenor.app')
  console.log('  Password: Demo@1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
