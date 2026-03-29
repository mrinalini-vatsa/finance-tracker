import { NextRequest, NextResponse } from "next/server"
import { requirePrisma } from "@/lib/db"
import { hashPassword } from "@/lib/password"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string
      email?: string
      password?: string
    }

    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      )
    }

    const prisma = requirePrisma()
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      )
    }

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashPassword(password),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json(createdUser, { status: 201 })
  } catch (error) {
    console.error("Error signing up user:", error)
    return NextResponse.json(
      {
        error: "Failed to sign up user",
        message: error instanceof Error ? error.message : "Unexpected server error",
      },
      { status: 500 }
    )
  }
}
