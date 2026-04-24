import { redirect } from "next/navigation"
import { getPostLoginRedirectPath } from "@/lib/auth/server"

export default async function DashboardRedirectPage() {
  const destination = await getPostLoginRedirectPath()
  redirect(destination)
}