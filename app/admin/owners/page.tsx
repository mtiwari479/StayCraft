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

type OwnerProfileRow = {
  id: string
  full_name: string | null
  email: string | null
  is_active: boolean
}

export default async function AdminOwnersPage() {
  const { supabase } = await requireRole(["admin"])

  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,is_active")
    .eq("role", "owner")
    .order("created_at", { ascending: false })

  const owners = (data ?? []) as OwnerProfileRow[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Owner Management</h2>
        <p className="text-sm text-muted-foreground">
          Owners are managed from the `profiles` table with role = `owner`.
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error.message}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Owners</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profile ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No owner profiles found.
                  </TableCell>
                </TableRow>
              ) : (
                owners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell className="font-medium">{owner.full_name || "-"}</TableCell>
                    <TableCell>{owner.email || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={owner.is_active ? "default" : "outline"}>
                        {owner.is_active ? "active" : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{owner.id}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}