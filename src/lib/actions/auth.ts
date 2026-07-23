'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

const SignUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

export async function signUpAction(
  formData: FormData,
): Promise<ActionResult> {
  const rawInput = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = SignUpSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid input',
    }
  }

  const { name, email, password } = parsed.data

  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    return { success: false, error: 'An account with this email already exists' }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db.user.create({
    data: { name, email, hashedPassword },
  })

  // Auto sign-in after registration
  try {
    await signIn('credentials', { email, password, redirectTo: '/overview' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Account created. Please sign in.' }
    }
    throw error
  }

  return { success: true }
}

export async function signInAction(
  formData: FormData,
): Promise<ActionResult> {
  const rawInput = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = SignInSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: 'Invalid email or password' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/overview',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Invalid email or password' }
    }
    throw error
  }

  return { success: true }
}
