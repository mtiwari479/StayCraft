import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

type AssignmentRow = {
  id: string
  room_id: number
  owner_id: string
  status: string
  start_date: string | null
}

type RoomRow = {
  id: number
  location: string
  city: string
  pincode: string
  type: "Student" | "Professional"
  beds_available: number
  monthly_rent_paise: number | null
  price: string
}

type RentInvoiceRow = {
  id: string
  invoice_month: string
  due_date: string
  total_amount_paise: number
  status: string
}

type RentPaymentRow = {
  id: string
  amount_paise: number
  status: string
  paid_at: string | null
  created_at: string
}

type VerificationRow = {
  status: string
  submitted_at: string
  reviewed_at: string | null
}

type BookingRow = {
  id: string
  room_id: number
  booking_status?: string | null
  payment_status?: string | null
  status: string
  created_at: string
}

type ProfileRow = {
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

function formatMonth(value: string | null | undefined) {
  if (!value) {
    return "-"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })
}

export default async function TenantDashboardPage() {
  const { supabase, profile } = await requireRole(["tenant"])

  const [assignmentResult, invoiceResult, paymentResult, verificationResult, bookingResult] =
    await Promise.all([
      supabase
        .from("tenant_room_assignments")
        .select("id,room_id,owner_id,status,start_date")
        .eq("tenant_id", profile.id)
        .in("status", ["active", "pending_move_in"])
        .order("start_date", { ascending: false })
        .limit(1),
      supabase
        .from("rent_invoices")
        .select("id,invoice_month,due_date,total_amount_paise,status")
        .eq("tenant_id", profile.id)
        .order("invoice_month", { ascending: false })
        .limit(12),
      supabase
        .from("rent_payments")
        .select("id,amount_paise,status,paid_at,created_at")
        .eq("tenant_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("tenant_verifications")
        .select("status,submitted_at,reviewed_at")
        .eq("tenant_id", profile.id)
        .order("submitted_at", { ascending: false })
        .limit(1),
      supabase
        .from("room_bookings")
        .select("id,room_id,booking_status,payment_status,status,created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const currentAssignment = ((assignmentResult.data ?? []) as AssignmentRow[])[0] || null
  const invoices = (invoiceResult.data ?? []) as RentInvoiceRow[]
  const payments = (paymentResult.data ?? []) as RentPaymentRow[]
  const latestVerification = ((verificationResult.data ?? []) as VerificationRow[])[0] || null
  const bookings = (bookingResult.data ?? []) as BookingRow[]

  let room: RoomRow | null = null
  let ownerName = "-"

  if (currentAssignment) {
    const [roomLookup, ownerLookup] = await Promise.all([
      supabase
        .from("rooms")
        .select("id,location,city,pincode,type,beds_available,monthly_rent_paise,price")
        .eq("id", currentAssignment.room_id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("id,full_name,email")
        .eq("id", currentAssignment.owner_id)
        .maybeSingle(),
    ])

    room = (roomLookup.data as RoomRow | null) || null
    const owner = ownerLookup.data as ProfileRow | null
    ownerName = owner?.full_name || owner?.email || "-"
  }

  const currentBill =
    invoices.find((invoice) => invoice.status === "issued" || invoice.status === "overdue") ||
    invoices[0] ||
    null

  const primaryError =
    assignmentResult.error ||
    invoiceResult.error ||
    paymentResult.error ||
    verificationResult.error ||
    bookingResult.error

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Your room, bills, and payments</h2>
        <p className="text-sm text-muted-foreground">
          Current assignment details, monthly bills, rent payment receipts, and verification status.
        </p>
      </div>

      {primaryError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{primaryError.message}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Current Room</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              {room ? room.location : "No room assigned"}
            </p>
            <p className="text-xs text-muted-foreground">Owner: {ownerName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Current Bill</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-foreground">
              {currentBill ? formatInrFromPaise(currentBill.total_amount_paise) : "No dues"}
            </p>
            <p className="text-xs text-muted-foreground">
              Due: {currentBill ? formatDate(currentBill.due_date) : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                latestVerification?.status === "approved"
                  ? "default"
                  : latestVerification?.status === "rejected"
                    ? "destructive"
                    : "outline"
              }
            >
              {latestVerification?.status || "pending"}
            </Badge>
            <p className="mt-2 text-xs text-muted-foreground">
              Reviewed: {formatDate(latestVerification?.reviewed_at || latestVerification?.submitted_at)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current room details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {room ? (
            <>
              <p>
                <span className="text-muted-foreground">Room:</span> #{room.id} - {room.location}
              </p>
              <p>
                <span className="text-muted-foreground">Type:</span> {room.type}
              </p>
              <p>
                <span className="text-muted-foreground">City/Pincode:</span> {room.city} - {room.pincode}
              </p>
              <p>
                <span className="text-muted-foreground">Monthly rent:</span>{" "}
                {room.monthly_rent_paise
                  ? formatInrFromPaise(room.monthly_rent_paise)
                  : `Rs. ${room.price}`}
              </p>
              <p>
                <span className="text-muted-foreground">Move-in status:</span> {currentAssignment?.status}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">No active room assignment yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly rent bills</CardTitle>
        </CardHeader>
        <CardContent>
          {currentBill && (currentBill.status === "issued" || currentBill.status === "overdue") && (
            <div className="mb-4 rounded-lg border bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground">
                Online rent payment flow should use `rent_invoices` and `rent_payments` (separate from booking payments).
              </p>
              <Button className="mt-3" disabled>
                Pay rent online (coming next)
              </Button>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No rent invoices yet.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{formatMonth(invoice.invoice_month)}</TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "default" : "outline"}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatInrFromPaise(invoice.total_amount_paise)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past payments / receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No rent payments recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id.slice(0, 8)}</TableCell>
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

      <Card>
        <CardHeader>
          <CardTitle>Booking info</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Booking Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No booking records yet.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id.slice(0, 8)}</TableCell>
                    <TableCell>#{booking.room_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.booking_status || booking.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(booking.payment_status || booking.status) === "paid" ? "default" : "outline"}>
                        {booking.payment_status || booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(booking.created_at)}</TableCell>
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