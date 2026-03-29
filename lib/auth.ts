import { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { requirePrisma } from "@/lib/db"
import { verifyPassword } from "@/lib/password"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null
        }

        const prisma = requirePrisma()
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user?.passwordHash || !verifyPassword(credentials.password, user.passwordHash)) {
          return null
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = Number(user.id)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? "")
      }
      return session
    },
  },
}
