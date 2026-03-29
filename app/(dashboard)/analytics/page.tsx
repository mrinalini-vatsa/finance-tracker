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
  Line,
  LineChart,
  Area,
  AreaChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Summary, Transaction } from "@/lib/db"

const fetcher = (url: string) => fetch(url).then((res) => res.json())
type TransactionsResponse =
  | Transaction[]
  | {
      transactions?: Transaction[]
    }

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--color-chart-2)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--color-chart-4)",
  },
  savings: {
    label: "Savings",
    color: "var(--color-chart-1)",
  },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useSWR<Summary>(
    "/api/summary",
    fetcher
  )
  const { data: transactions, isLoading: transactionsLoading } = useSWR<
    TransactionsResponse
  >("/api/transactions", fetcher)
  const safeData = Array.isArray(transactions)
    ? transactions
    : Array.isArray(transactions?.transactions)
    ? transactions.transactions
    : []

  const isLoading = summaryLoading || transactionsLoading

  // Calculate savings trend data
  const savingsData =
    summary?.monthlyData.map((item) => ({
      ...item,
      savings: item.income - item.expenses,
    })) || []

  // Calculate category totals for income
  const incomeCategoryData =
    safeData
      ?.filter((t) => t.type === "income")
      .reduce(
        (acc, t) => {
          const existing = acc.find((item) => item.category === t.category)
          if (existing) {
            existing.amount += t.amount
          } else {
            acc.push({ category: t.category, amount: t.amount })
          }
          return acc
        },
        [] as { category: string; amount: number }[]
      )
      .sort((a, b) => b.amount - a.amount) || []

  // Calculate spending trends by day of week
  const dayOfWeekData = safeData
    ?.filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        const day = new Date(t.date).toLocaleDateString("en-US", {
          weekday: "short",
        })
        const existing = acc.find((item) => item.day === day)
        if (existing) {
          existing.amount += t.amount
        } else {
          acc.push({ day, amount: t.amount })
        }
        return acc
      },
      [] as { day: string; amount: number }[]
    ) || []

  // Sort by day order
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  dayOfWeekData.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Detailed insights into your financial patterns
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="spending">Spending</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Savings Trend */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Savings Trend</CardTitle>
                <CardDescription>
                  Track how your savings change over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savingsData.length === 0 ? (
                  <div className="flex h-[350px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    <p>No transactions yet. Add your first transaction or explore demo data.</p>
                    <Button asChild size="sm">
                      <Link href="/add-transaction">Add Transaction</Link>
                    </Button>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={savingsData}>
                        <defs>
                          <linearGradient
                            id="savingsGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="var(--color-chart-1)"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="var(--color-chart-1)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
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
                        <Area
                          type="monotone"
                          dataKey="savings"
                          stroke="var(--color-chart-1)"
                          strokeWidth={2}
                          fill="url(#savingsGradient)"
                          name="Savings"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Income vs Expenses Line Chart */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Income vs Expenses</CardTitle>
                <CardDescription>Monthly comparison over time</CardDescription>
              </CardHeader>
              <CardContent>
                {savingsData.length === 0 ? (
                  <div className="flex h-[350px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    <p>No transactions yet. Add your first transaction or explore demo data.</p>
                    <Button asChild size="sm">
                      <Link href="/add-transaction">Add Transaction</Link>
                    </Button>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={savingsData}>
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
                        <Line
                          type="monotone"
                          dataKey="income"
                          stroke="var(--color-chart-2)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-chart-2)" }}
                          name="Income"
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke="var(--color-chart-4)"
                          strokeWidth={2}
                          dot={{ fill: "var(--color-chart-4)" }}
                          name="Expenses"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-6">
            {/* Income by Category */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Income by Source</CardTitle>
                <CardDescription>
                  Breakdown of your income streams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {incomeCategoryData.length === 0 ? (
                  <div className="flex h-[350px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    <p>No transactions yet. Add your first transaction or explore demo data.</p>
                    <Button asChild size="sm">
                      <Link href="/add-transaction">Add Transaction</Link>
                    </Button>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={incomeCategoryData} layout="vertical">
                        <XAxis
                          type="number"
                          stroke="currentColor"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                          className="text-muted-foreground"
                        />
                        <YAxis
                          type="category"
                          dataKey="category"
                          stroke="currentColor"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          width={80}
                          className="text-muted-foreground"
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="amount"
                          fill="var(--color-chart-2)"
                          radius={[0, 4, 4, 0]}
                          name="Amount"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Income Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(summary?.totalIncome || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Top Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {incomeCategoryData[0]?.category || "N/A"}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Income Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {incomeCategoryData.length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="spending" className="space-y-6">
            {/* Spending by Day of Week */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">Spending by Day</CardTitle>
                <CardDescription>
                  When do you spend the most?
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dayOfWeekData.length === 0 ? (
                  <div className="flex h-[350px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
                    <p>No transactions yet. Add your first transaction or explore demo data.</p>
                    <Button asChild size="sm">
                      <Link href="/add-transaction">Add Transaction</Link>
                    </Button>
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dayOfWeekData}>
                        <XAxis
                          dataKey="day"
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
                        <Bar
                          dataKey="amount"
                          fill="var(--color-chart-4)"
                          radius={[4, 4, 0, 0]}
                          name="Spending"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Spending Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(summary?.totalExpenses || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Top Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary?.categoryData[0]?.category || "N/A"}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary?.categoryData.length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
