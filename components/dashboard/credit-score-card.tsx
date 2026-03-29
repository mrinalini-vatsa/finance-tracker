"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { Summary } from "@/lib/db"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function getCreditScoreInfo(score: number): {
  label: string
  color: string
  bgColor: string
} {
  if (score >= 800)
    return { label: "Excellent", color: "text-emerald-500", bgColor: "bg-emerald-500" }
  if (score >= 740)
    return { label: "Very Good", color: "text-emerald-400", bgColor: "bg-emerald-400" }
  if (score >= 670)
    return { label: "Good", color: "text-primary", bgColor: "bg-primary" }
  if (score >= 580)
    return { label: "Fair", color: "text-amber-500", bgColor: "bg-amber-500" }
  return { label: "Poor", color: "text-rose-500", bgColor: "bg-rose-500" }
}

export function CreditScoreCard() {
  const { data, isLoading } = useSWR<Summary>("/api/summary", fetcher)

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    )
  }

  const score = data?.creditScore || 650
  const scoreInfo = getCreditScoreInfo(score)
  const progressValue = ((score - 300) / 550) * 100

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Credit Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative flex h-36 w-36 items-center justify-center">
          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${progressValue * 2.64} 264`}
              strokeLinecap="round"
              className={scoreInfo.bgColor}
            />
          </svg>
          <div className="text-center">
            <div className="text-3xl font-bold">{score}</div>
            <div className={`text-sm font-medium ${scoreInfo.color}`}>
              {scoreInfo.label}
            </div>
          </div>
        </div>
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>300</span>
            <span>850</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Based on your savings rate and transaction history
        </p>
      </CardContent>
    </Card>
  )
}
