"use client"

import useSWR from "swr"
import { TrendingUp, TrendingDown, PiggyBank, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Summary } from "@/lib/db"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SummaryCards() {
  const { data, isLoading } = useSWR<Summary>("/api/summary", fetcher)

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const savings = (data?.totalIncome || 0) - (data?.totalExpenses || 0)
  const savingsRatePercent = ((data?.savingsRate || 0) * 100).toFixed(1)

  const cards = [
    {
      title: "Total Income",
      value: formatCurrency(data?.totalIncome || 0),
      description: "All time earnings",
      icon: TrendingUp,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(data?.totalExpenses || 0),
      description: "All time spending",
      icon: TrendingDown,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      title: "Net Savings",
      value: formatCurrency(savings),
      description: savings >= 0 ? "You are saving!" : "Spending exceeds income",
      icon: PiggyBank,
      iconColor: savings >= 0 ? "text-primary" : "text-rose-500",
      bgColor: savings >= 0 ? "bg-primary/10" : "bg-rose-500/10",
    },
    {
      title: "Savings Rate",
      value: `${savingsRatePercent}%`,
      description: "Of total income saved",
      icon: ArrowUpRight,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="rounded-2xl transition-shadow hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
