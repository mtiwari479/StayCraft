import Link from "next/link"
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
import { formatInrFromPaise } from "@/lib/rooms"

type BookingRow = {
  id: string
  room_id: number
  user_email: string
  status: string
  booking_status?: string | null
  payment_status?: string | null
  amount_paise: number
  created_at: string
}

type RentPaymentRow = {
  id: string
  tenant_id: string
  status: string
  amount_paise: number
  paid_at: string | null
  created_at: string
}

type ProfileLookupRow = {
  id: string
  full_name: string | null
  email: string | null
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getBookingStatus(row: BookingRow) {
  return row.booking_status || row.status || "created"
}

function getPaymentStatus(row: BookingRow) {
  return row.payment_status || row.status || "created"
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireRole(["admin"])

  const [
    ownersCountResult,
    tenantsCountResult,
    roomsCountResult,
    occupiedCountResult,
    pendingVerificationCountResult,
    bookingsResult,
    rentPaymentsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "tenant"),
    supabase.from("rooms").select("id", { count: "exact", head: true }),
    supabase
      .from("tenant_room_assignments")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("tenant_verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("room_bookings")
      .select("id,room_id,user_email,status,booking_status,payment_status,amount_paise,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("rent_payments")
      .select("id,tenant_id,status,amount_paise,paid_at,created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ])

  const schemaError =
    ownersCountResult.error ||
    tenantsCountResult.error ||
    roomsCountResult.error ||
    occupiedCountResult.error ||
    pendingVerificationCountResult.error ||
    bookingsResult.error ||
    rentPaymentsResult.error

  const recentBookings = (bookingsResult.data ?? []) as BookingRow[]
  const recentRentPayments = (rentPaymentsResult.data ?? []) as RentPaymentRow[]

  const tenantIds = Array.from(
    new Set(recentRentPayments.map((payment) => payment.tenant_id).filter(Boolean))
  )

  let tenantLookup = new Map<string, string>()

  if (tenantIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id,full_name,email")
      .in("id", tenantIds)

    const rows = (data ?? []) as ProfileLookupRow[]
    tenantLookup = new Map(
      rows.map((row) => [row.id, row.full_name || row.email || row.id])
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Operations</p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground">Platform overview</h2>
      </div>

      {schemaError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            {schemaError.code === "PGRST205"
              ? "Required dashboard tables are missing. Run supabase/staycraft_schema.sql in the Supabase SQL editor."
              : schemaError.message}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{ownersCountResult.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{tenantsCountResult.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{roomsCountResult.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Occupied Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{occupiedCountResult.count ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pendingVerificationCountResult.count ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin controls</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 text-sm">
          <Link href="/admin/rooms" className="underline underline-offset-4">
            Add/edit rooms and room photos
          </Link>
          <Link href="/admin/owners" className="underline underline-offset-4">
            Manage owners
          </Link>
          <Link href="/admin/tenants" className="underline underline-offset-4">
            Manage tenants, assignments, verifications
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent booking payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Booking Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No booking payment records yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id.slice(0, 8)}</TableCell>
                    <TableCell>{booking.user_email}</TableCell>
                    <TableCell>#{booking.room_id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getBookingStatus(booking)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatus(booking) === "paid" ? "default" : "outline"}>
                        {getPaymentStatus(booking)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatInrFromPaise(booking.amount_paise)}</TableCell>
                    <TableCell>{formatDate(booking.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent monthly rent payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRentPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No rent payment records yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentRentPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id.slice(0, 8)}</TableCell>
                    <TableCell>{tenantLookup.get(payment.tenant_id) || payment.tenant_id}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === "paid" ? "default" : "outline"}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatInrFromPaise(payment.amount_paise)}</TableCell>
                    <TableCell>{formatDate(payment.paid_at || payment.created_at)}</TableCell>
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