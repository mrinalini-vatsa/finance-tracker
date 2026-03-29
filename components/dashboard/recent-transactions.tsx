"use client"

import useSWR from "swr"
import { format } from "date-fns"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import type { Transaction } from "@/lib/db"

const fetcher = (url: string) => fetch(url).then((res) => res.json())
type TransactionsResponse =
  | Transaction[]
  | {
      transactions?: Transaction[]
    }

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function RecentTransactions() {
  const { data, isLoading } = useSWR<TransactionsResponse>("/api/transactions", fetcher)

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  const safeData = Array.isArray(data)
    ? data
    : Array.isArray(data?.transactions)
    ? data.transactions
    : []
  const transactions = safeData.slice(0, 10)

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
        <CardDescription>Your latest financial activity</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <Empty>
            <EmptyContent>
              <EmptyTitle>No transactions yet</EmptyTitle>
              <EmptyDescription>
                Start by adding your income and expenses to generate your financial
                insights.
              </EmptyDescription>
              <Button asChild>
                <Link href="/add-transaction">Add Transaction</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-full p-1.5 ${
                            transaction.type === "income"
                              ? "bg-emerald-500/10"
                              : "bg-rose-500/10"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-rose-500" />
                          )}
                        </div>
                        <Badge variant="secondary" className="font-normal">
                          {transaction.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate sm:table-cell">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(transaction.date), "MMM d")}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
