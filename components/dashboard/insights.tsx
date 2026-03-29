"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Summary } from "@/lib/db"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Insights() {
  const { data } = useSWR<Summary>("/api/summary", fetcher)
  const topCategory = data?.categoryData?.[0]?.category
  const monthly = data?.monthlyData ?? []
  const latest = monthly[monthly.length - 1]
  const previous = monthly[monthly.length - 2]
  const latestRate =
    latest && latest.income > 0 ? (latest.income - latest.expenses) / latest.income : 0
  const previousRate =
    previous && previous.income > 0
      ? (previous.income - previous.expenses) / previous.income
      : 0
  const deltaPercent = Math.round((latestRate - previousRate) * 100)
  const savingsRate = data?.savingsRate ?? latestRate
  const percent = Math.round(savingsRate * 100)

  return (
    <Card className="rounded-2xl border-indigo-100/60 transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>
          {topCategory
            ? `You spent most on ${topCategory} this month.`
            : "Add transactions to unlock personalized spending insights."}
        </p>
        <p>
          {`Your savings rate is ${percent}%. ${
            monthly.length > 1
              ? `It ${deltaPercent >= 0 ? "improved" : "declined"} by ${Math.abs(deltaPercent)}% compared to last month.`
              : "Add one more month of data to track month-over-month improvement."
          }`}
        </p>
      </CardContent>
    </Card>
  )
}
