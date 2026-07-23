import { PrismaClient } from '@prisma/client'

// Prevent multiple Prisma client instances in development
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Cache-busting: Increment this schema version number to force reset cache on schema updates
const SCHEMA_VERSION = 4
if (globalForPrisma.prisma && (globalThis as any).__schemaVersion !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined
  ;(globalThis as any).__schemaVersion = SCHEMA_VERSION
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

