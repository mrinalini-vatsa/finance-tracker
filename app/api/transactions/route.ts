import { requirePrisma, type Transaction } from "@/lib/db"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

function toApiTransaction(transaction: {
  id: number
  userId: number
  amount: { toString(): string } | number
  type: "income" | "expense"
  category: string
  description: string | null
  date: Date
  createdAt: Date
}): Transaction {
  return {
    id: transaction.id,
    user_id: transaction.userId,
    amount: Number(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    description: transaction.description ?? "",
    date: transaction.date.toISOString().slice(0, 10),
    created_at: transaction.createdAt.toISOString(),
  }
}

export async function GET() {
  try {
    const prisma = requirePrisma()
    const session = await getServerSession(authOptions)
    const userId = Number(session?.user?.id)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(transactions.map(toApiTransaction))
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch transactions",
        message:
          error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  let rawBody: unknown
  try {
    const prisma = requirePrisma()
    const session = await getServerSession(authOptions)
    const sessionUserId = Number(session?.user?.id)
    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    try {
      rawBody = await request.json()
    } catch (error) {
      console.error("Invalid JSON body for POST /api/transactions:", error)
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 })
    }

    const body = rawBody as Record<string, unknown>
    const { amount, type, category, description, date } = body

    const missingFields: string[] = []

    if (amount === undefined || amount === null || amount === "") {
      missingFields.push("amount")
    }
    if (typeof type !== "string" || type.trim().length === 0) {
      missingFields.push("type")
    }
    if (typeof category !== "string" || category.trim().length === 0) {
      missingFields.push("category")
    }
    if (typeof date !== "string" || date.trim().length === 0) {
      missingFields.push("date")
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          fields: missingFields,
          message: "Required fields: amount, type, category, date",
        },
        { status: 400 }
      )
    }

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount", message: "Amount must be a positive number" },
        { status: 400 }
      )
    }

    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "Invalid type", message: "Type must be either 'income' or 'expense'" },
        { status: 400 }
      )
    }

    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date", message: "Date must be a valid ISO date string" },
        { status: 400 }
      )
    }

    const normalizedCategory = category.trim()
    const normalizedDescription =
      typeof description === "string" ? description.trim() : ""

    const transaction = await prisma.transaction.create({
      data: {
        userId: sessionUserId,
        amount: parsedAmount,
        type,
        category: normalizedCategory,
        description: normalizedDescription,
        date: parsedDate,
      },
    })

    return NextResponse.json(toApiTransaction(transaction), { status: 201 })
  } catch (error) {
    console.error("Error creating transaction:", {
      error,
      body: rawBody,
    })

    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to create transaction", message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create transaction", message: "Unexpected server error" },
      { status: 500 }
    )
  }
}
