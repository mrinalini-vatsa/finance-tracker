import { Suspense } from "react"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { CreditScoreCard } from "@/components/dashboard/credit-score-card"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Your financial overview at a glance
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

async function DashboardContent() {
  return (
    <div className="space-y-6">
      <SummaryCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CreditScoreCard />
        <div className="lg:col-span-2">
          <MonthlyChart />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <CategoryChart />
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </div>
  )
}
