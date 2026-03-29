import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  hasLoggedMissingDatabaseUrl?: boolean
}

const databaseUrl = process.env.DATABASE_URL?.trim()

export const isDatabaseConfigured = Boolean(databaseUrl)

if (!isDatabaseConfigured && !globalForPrisma.hasLoggedMissingDatabaseUrl) {
  console.error(
    "DATABASE_URL is missing. Add it to .env.local before using API routes."
  )
  globalForPrisma.hasLoggedMissingDatabaseUrl = true
}

export const prisma = isDatabaseConfigured
  ? globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    })
  : null

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma
}

export function requirePrisma(): PrismaClient {
  if (!prisma) {
    throw new Error("DATABASE_URL is missing. Please configure it in .env.local.")
  }
  return prisma
}

export type Transaction = {
  id: number
  user_id: number
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
  created_at: string
}

export type User = {
  id: number
  name: string
  email: string
  created_at: string
}

export type Summary = {
  totalIncome: number
  totalExpenses: number
  savingsRate: number
  creditScore: number
  monthlyData: { month: string; income: number; expenses: number }[]
  categoryData: { category: string; amount: number; fill: string }[]
}
