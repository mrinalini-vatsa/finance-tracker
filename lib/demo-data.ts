import { requirePrisma } from "@/lib/db"

const DEMO_USER = {
  name: "Demo User",
  email: "demo@finflow.com",
}

export async function ensureDemoUser(): Promise<number> {
  const prisma = requirePrisma()
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: { name: DEMO_USER.name },
    create: DEMO_USER,
  })
  return user.id
}

export async function seedDemoTransactionsIfEmpty(userId: number): Promise<boolean> {
  const prisma = requirePrisma()
  const transactionCount = await prisma.transaction.count()
  if (transactionCount > 0) {
    return false
  }

  const daysAgo = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date
  }

  await prisma.transaction.createMany({
    data: [
      {
        userId,
        amount: 5400,
        type: "income",
        category: "Salary",
        description: "Monthly salary",
        date: daysAgo(2),
      },
      {
        userId,
        amount: 1200,
        type: "income",
        category: "Freelance",
        description: "Landing page project",
        date: daysAgo(7),
      },
      {
        userId,
        amount: 300,
        type: "income",
        category: "Investment",
        description: "Mutual fund dividend",
        date: daysAgo(13),
      },
      {
        userId,
        amount: 85,
        type: "expense",
        category: "Food",
        description: "Weekly groceries",
        date: daysAgo(1),
      },
      {
        userId,
        amount: 120,
        type: "expense",
        category: "Travel",
        description: "Cab and metro expenses",
        date: daysAgo(4),
      },
      {
        userId,
        amount: 220,
        type: "expense",
        category: "Shopping",
        description: "Everyday essentials",
        date: daysAgo(6),
      },
      {
        userId,
        amount: 160,
        type: "expense",
        category: "Bills",
        description: "Internet and electricity",
        date: daysAgo(3),
      },
      {
        userId,
        amount: 42,
        type: "expense",
        category: "Food",
        description: "Lunch",
        date: daysAgo(9),
      },
    ],
  })

  return true
}

export async function ensureDemoData() {
  const demoUserId = await ensureDemoUser()
  const seeded = await seedDemoTransactionsIfEmpty(demoUserId)

  return { demoUserId, seeded }
}
