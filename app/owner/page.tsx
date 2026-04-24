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
import { formatInrFromPaise, parseInrToPaise } from "@/lib/rooms"

type RoomRow = {
  id: number
  location: string
  city: string
  pincode: string
  status: string
  beds_available: number
  monthly_rent_paise: number | null
  price: string
}

type AssignmentRow = {
  room_id: number
  tenant_id: string
  status: string
  start_date: string | null
}

type BookingRow = {
  room_id: number
  booking_status?: string | null
  payment_status?: string | null
  status: string
  created_at: string
}

type VerificationRow = {
  tenant_id: string
  status: string
}

type PaymentRow = {
  id: string
  tenant_id: string
  status: string
  amount_paise: number
  paid_at: string | null
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

function getMonthlyRentPaise(room: RoomRow) {
  if (room.monthly_rent_paise && room.monthly_rent_paise > 0) {
    return room.monthly_rent_paise
  }

  return parseInrToPaise(room.price)
}

export default async function OwnerDashboardPage() {
  const { supabase, profile } = await requireRole(["owner"])

  const { data: roomData, error: roomError } = await supabase
    .from("rooms")
    .select("id,location,city,pincode,status,beds_available,monthly_rent_paise,price")
    .eq("owner_id", profile.id)
    .order("id", { ascending: true })

  const rooms = (roomData ?? []) as RoomRow[]
  const roomIds = rooms.map((room) => room.id)

  let assignments: AssignmentRow[] = []
  let bookings: BookingRow[] = []

  if (roomIds.length > 0) {
    const [assignmentResult, bookingResult] = await Promise.all([
      supabase
        .from("tenant_room_assignments")
        .select("room_id,tenant_id,status,start_date")
        .eq("owner_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("room_bookings")
        .select("room_id,booking_status,payment_status,status,created_at")
        .in("room_id", roomIds)
        .order("created_at", { ascending: false }),
    ])

    assignments = (assignmentResult.data ?? []) as AssignmentRow[]
    bookings = (bookingResult.data ?? []) as BookingRow[]
  }

  const { data: paymentData, error: paymentError } = await supabase
    .from("rent_payments")
    .select("id,tenant_id,status,amount_paise,paid_at,created_at")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20)

  const payments = (paymentData ?? []) as PaymentRow[]

  const tenantIds = Array.from(
    new Set(
      [...assignments.map((assignment) => assignment.tenant_id), ...payments.map((payment) => payment.tenant_id)].filter(
        Boolean
      )
    )
  ) as string[]

  let tenantLookup = new Map<string, string>()
  let latestVerificationByTenant = new Map<string, string>()

  if (tenantIds.length > 0) {
    const [tenantResult, verificationResult] = await Promise.all([
      supabase.from("profiles").select("id,full_name,email").in("id", tenantIds),
      supabase
        .from("tenant_verifications")
        .select("tenant_id,status")
        .in("tenant_id", tenantIds)
        .order("submitted_at", { ascending: false }),
    ])

    const tenants = (tenantResult.data ?? []) as ProfileRow[]
    const verifications = (verificationResult.data ?? []) as VerificationRow[]

    tenantLookup = new Map(
      tenants.map((tenant) => [tenant.id, tenant.full_name || tenant.email || tenant.id])
    )

    for (const verification of verifications) {
      if (!latestVerificationByTenant.has(verification.tenant_id)) {
        latestVerificationByTenant.set(verification.tenant_id, verification.status)
      }
    }
  }

  const activeAssignmentByRoom = new Map<number, AssignmentRow>()
  for (const assignment of assignments) {
    if (assignment.status === "active" && !activeAssignmentByRoom.has(assignment.room_id)) {
      activeAssignmentByRoom.set(assignment.room_id, assignment)
    }
  }

  const latestBookingByRoom = new Map<number, BookingRow>()
  for (const booking of bookings) {
    if (!latestBookingByRoom.has(booking.room_id)) {
      latestBookingByRoom.set(booking.room_id, booking)
    }
  }

  const occupiedRooms = activeAssignmentByRoom.size
  const totalRooms = rooms.length
  const vacantRooms = Math.max(totalRooms - occupiedRooms, 0)
  const totalPaidRent = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount_paise, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Your rooms and tenants</h2>
        <p className="text-sm text-muted-foreground">
          Room occupancy, booking state, verification status, and rent payment history.
        </p>
      </div>

      {(roomError || paymentError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">
            {roomError?.message || paymentError?.message}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalRooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{occupiedRooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Vacant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{vacantRooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Rent Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatInrFromPaise(totalPaidRent)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Rent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No rooms assigned to your owner profile yet.
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => {
                  const assignment = activeAssignmentByRoom.get(room.id)
                  const tenantName = assignment
                    ? tenantLookup.get(assignment.tenant_id) || assignment.tenant_id
                    : "Vacant"
                  const verificationStatus = assignment
                    ? latestVerificationByTenant.get(assignment.tenant_id) || "pending"
                    : "-"
                  const booking = latestBookingByRoom.get(room.id)
                  const bookingLabel = booking?.booking_status || booking?.status || "no booking"

                  return (
                    <TableRow key={room.id}>
                      <TableCell>
                        <p className="font-medium">#{room.id}</p>
                        <p className="text-xs text-muted-foreground">{room.location}</p>
                      </TableCell>
                      <TableCell>{tenantName}</TableCell>
                      <TableCell>
                        {verificationStatus === "-" ? (
                          "-"
                        ) : (
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
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={bookingLabel === "paid" ? "default" : "outline"}>
                          {bookingLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={assignment ? "default" : "outline"}>
                          {assignment ? "occupied" : "vacant"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatInrFromPaise(getMonthlyRentPaise(room))}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rent payment history</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No rent payment history yet.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
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