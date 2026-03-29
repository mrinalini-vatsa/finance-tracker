import { requirePrisma, type Summary } from "@/lib/db"
import { ensureDemoData } from "@/lib/demo-data"
import { NextResponse } from "next/server"

const categoryColors: Record<string, string> = {
  Salary: "var(--color-chart-1)",
  Freelance: "var(--color-chart-2)",
  Investment: "var(--color-chart-3)",
  Rent: "var(--color-chart-4)",
  Food: "var(--color-chart-5)",
  Transport: "var(--color-chart-1)",
  Entertainment: "var(--color-chart-2)",
  Utilities: "var(--color-chart-3)",
  Shopping: "var(--color-chart-4)",
  Healthcare: "var(--color-chart-5)",
  Other: "var(--color-muted-foreground)",
}

function calculateCreditScore(
  savingsRate: number,
  transactionCount: number
): number {
  // Base score starts at 650
  let score = 650

  // Savings rate contribution (up to +100 points)
  if (savingsRate >= 0.3) score += 100
  else if (savingsRate >= 0.2) score += 75
  else if (savingsRate >= 0.1) score += 50
  else if (savingsRate >= 0) score += 25
  else score -= 50 // Negative savings

  // Consistency contribution based on transaction count (up to +100 points)
  if (transactionCount >= 20) score += 100
  else if (transactionCount >= 10) score += 75
  else if (transactionCount >= 5) score += 50
  else score += 25

  // Cap score between 300 and 850
  return Math.max(300, Math.min(850, score))
}

export async function GET() {
  try {
    const prisma = requirePrisma()
    await ensureDemoData()

    const transactions = await prisma.transaction.findMany({
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    })

    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const totalExpenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const savingsRate =
      totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0

    const transactionCount = transactions.length

    const creditScore = calculateCreditScore(savingsRate, transactionCount)

    const monthlyMap = new Map<string, { month: string; income: number; expenses: number }>()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    for (const item of transactions) {
      if (item.date < sixMonthsAgo) {
        continue
      }
      const key = `${item.date.getFullYear()}-${item.date.getMonth()}`
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: item.date.toLocaleString("en-US", { month: "short" }),
          income: 0,
          expenses: 0,
        })
      }
      const entry = monthlyMap.get(key)!
      if (item.type === "income") {
        entry.income += Number(item.amount)
      } else {
        entry.expenses += Number(item.amount)
      }
    }

    const monthlyData = Array.from(monthlyMap.values())

    const expenseCategoryMap = new Map<string, number>()
    for (const item of transactions) {
      if (item.type !== "expense") continue
      expenseCategoryMap.set(
        item.category,
        (expenseCategoryMap.get(item.category) ?? 0) + Number(item.amount)
      )
    }

    const categoryData = Array.from(expenseCategoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        fill: categoryColors[category] || "var(--color-chart-1)",
      }))
      .sort((a, b) => b.amount - a.amount)

    const summary: Summary = {
      totalIncome,
      totalExpenses,
      savingsRate,
      creditScore,
      monthlyData,
      categoryData,
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching summary:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch summary",
        message:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    )
  }
}
