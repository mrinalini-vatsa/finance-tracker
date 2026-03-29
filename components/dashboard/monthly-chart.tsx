"use client"

import useSWR from "swr"
import Link from "next/link"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import type { Summary } from "@/lib/db"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--color-chart-2)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--color-chart-4)",
  },
}

export function MonthlyChart() {
  const { data, isLoading } = useSWR<Summary>("/api/summary", fetcher)

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data?.monthlyData || []

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Monthly Overview</CardTitle>
        <CardDescription>Income vs Expenses over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <p>No transactions yet. Add your first transaction or explore demo data.</p>
            <Button asChild size="sm">
              <Link href="/add-transaction">Add Transaction</Link>
            </Button>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="month"
                  stroke="currentColor"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  stroke="currentColor"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  className="text-muted-foreground"
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
                  name="Income"
                />
                <Bar
                  dataKey="expenses"
                  fill="var(--color-chart-4)"
                  radius={[4, 4, 0, 0]}
                  name="Expenses"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
