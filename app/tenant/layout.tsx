import Link from "next/link"
import { requireRole } from "@/lib/auth/server"

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await requireRole(["tenant"])

  return (
    <main className="min-h-screen bg-card">
      <div className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">StayCraft</p>
            <h1 className="text-xl font-semibold text-foreground">Tenant Dashboard</h1>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{profile.full_name || profile.email || "Tenant"}</p>
            <p className="text-xs text-muted-foreground">Role: tenant</p>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 pb-4 text-sm lg:px-8">
          <Link href="/tenant" className="text-muted-foreground hover:text-foreground">Overview</Link>
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">{children}</div>
    </main>
  )
}