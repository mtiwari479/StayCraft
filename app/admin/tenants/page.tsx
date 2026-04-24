import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireRole } from "@/lib/auth/server"

type TenantProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  is_active: boolean
}

type VerificationRow = {
  tenant_id: string
  status: string
}

type AssignmentRow = {
  tenant_id: string
  room_id: number
  status: string
}

export default async function AdminTenantsPage() {
  const { supabase } = await requireRole(["admin"])

  const [tenantResult, verificationResult, assignmentResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,email,is_active")
      .eq("role", "tenant")
      .order("created_at", { ascending: false }),
    supabase
      .from("tenant_verifications")
      .select("tenant_id,status")
      .order("submitted_at", { ascending: false }),
    supabase
      .from("tenant_room_assignments")
      .select("tenant_id,room_id,status")
      .order("created_at", { ascending: false }),
  ])

  const tenants = (tenantResult.data ?? []) as TenantProfileRow[]
  const verifications = (verificationResult.data ?? []) as VerificationRow[]
  const assignments = (assignmentResult.data ?? []) as AssignmentRow[]

  const latestVerificationByTenant = new Map<string, string>()
  for (const verification of verifications) {
    if (!latestVerificationByTenant.has(verification.tenant_id)) {
      latestVerificationByTenant.set(verification.tenant_id, verification.status)
    }
  }

  const activeAssignmentByTenant = new Map<string, AssignmentRow>()
  for (const assignment of assignments) {
    if (!activeAssignmentByTenant.has(assignment.tenant_id) && assignment.status === "active") {
      activeAssignmentByTenant.set(assignment.tenant_id, assignment)
    }
  }

  const primaryError =
    tenantResult.error || verificationResult.error || assignmentResult.error

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Tenant Management</h2>
        <p className="text-sm text-muted-foreground">
          Review tenant records, verification state, and room assignments.
        </p>
      </div>

      {primaryError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{primaryError.message}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Assigned Room</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No tenant profiles found.
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant) => {
                  const verificationStatus = latestVerificationByTenant.get(tenant.id) || "pending"
                  const assignment = activeAssignmentByTenant.get(tenant.id)

                  return (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.full_name || "-"}</TableCell>
                      <TableCell>{tenant.email || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            verificationStatus === "approved"
                              ? "default"
                              : verificationStatus === "rejected"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {verificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{assignment ? `#${assignment.room_id}` : "Unassigned"}</TableCell>
                      <TableCell>
                        <Badge variant={tenant.is_active ? "secondary" : "outline"}>
                          {tenant.is_active ? "active" : "inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}