import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { SalaryClient } from './salary-client'

export const dynamic = 'force-dynamic'

export default async function SalaryOffersPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // 1. Fetch offers
  const offers = await db.offer.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  })

  // 2. Fetch applications (for linking)
  const applications = await db.application.findMany({
    where: { userId },
    select: {
      id: true,
      company: true,
      role: true,
    }
  })

  // 3. Construct Combined Negotiation Strategy summary
  let overallStrategy = ''
  if (offers.length > 0) {
    const sorted = [...offers].sort((a, b) => (b.score || 0) - (a.score || 0))
    const bestOffer = sorted[0]
    
    if (offers.length > 1) {
      const otherCompanyNames = sorted.slice(1).map(o => o.company).join(' and ')
      overallStrategy = `${bestOffer.company} offers the highest total compensation package and quality index. If you prefer the culture of another firm like ${otherCompanyNames}, use the ${bestOffer.company} offer as leverage to request an additional 10-15% in base salary or RSU equity grant value from their recruiters.`
    } else {
      overallStrategy = `You have logged an offer from ${bestOffer.company} for the ${bestOffer.role} position with a quality score of ${bestOffer.score}/100. Consider checking if there is flexibility to negotiate a sign-on bonus or additional PTO before accepting.`
    }
  }

  return (
    <SalaryClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      offers={offers.map(o => ({
        id: o.id,
        company: o.company,
        role: o.role,
        baseSalary: o.baseSalary,
        bonus: o.bonus,
        equity: o.equity,
        location: o.location,
        status: o.status,
        expirationDate: o.expirationDate,
        score: o.score,
        scoreExplanation: o.scoreExplanation,
        negotiationEmail: o.negotiationEmail,
        applicationId: o.applicationId,
      }))}
      applications={applications}
      overallStrategy={overallStrategy}
    />
  )
}
