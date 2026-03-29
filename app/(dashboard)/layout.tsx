import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardNavbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
