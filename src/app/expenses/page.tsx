import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ExpensesClient } from './expenses-client'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const userId = session.user.id as string

  // 1. Fetch budget limit or create one
  let budget = await db.userBudget.findFirst({
    where: { userId }
  })

  if (!budget) {
    budget = await db.userBudget.create({
      data: {
        userId,
        limit: 500.00,
      }
    })
  }

  // 2. Fetch expenses
  let expenses = await db.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  })



  // 4. Perform computations
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const thisMonthSpent = expenses
    .filter(e => new Date(e.date) >= thisMonthStart)
    .reduce((sum, e) => sum + e.amount, 0)

  const thisMonthTransportation = expenses
    .filter(e => {
      const expDate = new Date(e.date)
      const cat = e.category.toLowerCase()
      return expDate >= thisMonthStart && (cat.includes('transport') || cat === 'transportation')
    })
    .reduce((sum, e) => sum + e.amount, 0)

  const thisMonthFoodCoffee = expenses
    .filter(e => {
      const expDate = new Date(e.date)
      const cat = e.category.toLowerCase()
      return expDate >= thisMonthStart && (cat === 'food' || cat === 'coffee' || cat.includes('meal') || cat.includes('coffee') || cat.includes('food'))
    })
    .reduce((sum, e) => sum + e.amount, 0)

  const percentUsed = budget.limit > 0 ? Math.round((thisMonthSpent / budget.limit) * 100) : 0

  // 5. Dynamic AI-like Cost Advice (Calculated locally with rules to ensure speed and 0 token usage)
  const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0)
  
  return (
    <ExpensesClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      expenses={expenses.map(e => ({
        id: e.id,
        date: e.date,
        category: e.category,
        description: e.description,
        amount: e.amount,
        receiptPath: e.receiptPath,
      }))}
      budgetLimit={budget.limit}
      stats={{
        totalSpentThisMonth: thisMonthSpent,
        totalTransportation: thisMonthTransportation,
        totalFoodCoffee: thisMonthFoodCoffee,
        percentUsed,
        pieData: [], // Re-computed reactively on the client side
      }}
    />
  )
}
