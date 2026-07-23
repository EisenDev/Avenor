'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { uploadFileToR2 } from '@/lib/r2'

export type ActionResult<T = any> =
  | { success: true; data: T }
  | { success: false; error: string }

const AddExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(500),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().or(z.date()).optional(),
})

/**
 * Adds an expense to the database.
 * If a receipt file is provided in the FormData, it uploads it to Cloudflare R2/local disk.
 */
export async function addExpenseAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const amountStr = formData.get('amount') as string
  const dateStr = formData.get('date') as string
  const receiptFile = formData.get('receipt') as File | null

  const amount = parseFloat(amountStr)

  // Validate fields
  const parsed = AddExpenseSchema.safeParse({ category, description, amount })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input data' }
  }

  try {
    let receiptPath: string | null = null

    // 1. Upload receipt if exists
    if (receiptFile && receiptFile instanceof File && receiptFile.size > 0) {
      const arrayBuffer = await receiptFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const uploadRes = await uploadFileToR2({
        buffer,
        filename: receiptFile.name,
        mimeType: receiptFile.type,
      })
      receiptPath = uploadRes.path
    }

    const expenseDate = dateStr ? new Date(dateStr) : new Date()

    // 2. Save in database
    const newExpense = await db.expense.create({
      data: {
        userId: session.user.id,
        category,
        description,
        amount,
        date: expenseDate,
        receiptPath,
      }
    })

    revalidatePath('/expenses')
    return { success: true, data: newExpense }
  } catch (error) {
    console.error('Error adding expense:', error)
    return { success: false, error: 'Failed to add expense: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

/**
 * Updates or creates the user's monthly budget limit.
 */
export async function updateBudgetAction(limit: number): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized. Please log in.' }
  }

  if (limit <= 0) {
    return { success: false, error: 'Budget limit must be greater than zero.' }
  }

  try {
    const budget = await db.userBudget.upsert({
      where: { userId: session.user.id },
      update: { limit },
      create: { userId: session.user.id, limit },
    })

    revalidatePath('/expenses')
    return { success: true, data: budget }
  } catch (error) {
    console.error('Error updating budget:', error)
    return { success: false, error: 'Failed to update budget limit.' }
  }
}
