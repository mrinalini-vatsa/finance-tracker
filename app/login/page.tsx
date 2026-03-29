"use client"

import Link from "next/link"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      toast.error("Invalid credentials. Please try again.")
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 to-background p-4 dark:from-indigo-950/30">
      <Card className="w-full max-w-md rounded-2xl border-indigo-100 shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Welcome to FinFlow
          </CardTitle>
          <CardDescription>
            Sign in to access your Smart Finance Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-500"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New to FinFlow?{" "}
            <Link className="font-medium text-indigo-600 hover:underline" href="/signup">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
