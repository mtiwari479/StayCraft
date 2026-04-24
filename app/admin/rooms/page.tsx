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

type RoomRow = {
  id: number
  location: string
  city: string
  pincode: string
  price: string
  monthly_rent_paise: number | null
  beds_available: number
  status: string
  owner_id: string | null
}

type OwnerRow = {
  id: string
  full_name: string | null
  email: string | null
}

export default async function AdminRoomsPage() {
  const { supabase } = await requireRole(["admin"])

  const { data: roomData, error: roomError } = await supabase
    .from("rooms")
    .select("id,location,city,pincode,price,monthly_rent_paise,beds_available,status,owner_id")
    .order("id", { ascending: true })

  const rooms = (roomData ?? []) as RoomRow[]
  const ownerIds = Array.from(new Set(rooms.map((room) => room.owner_id).filter(Boolean))) as string[]

  let ownerMap = new Map<string, string>()

  if (ownerIds.length > 0) {
    const { data: ownerData } = await supabase
      .from("profiles")
      .select("id,full_name,email")
      .in("id", ownerIds)

    const owners = (ownerData ?? []) as OwnerRow[]
    ownerMap = new Map(
      owners.map((owner) => [owner.id, owner.full_name || owner.email || owner.id])
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Rooms and Photos</h2>
        <p className="text-sm text-muted-foreground">
          Admin controls for room creation/editing and room photos are backed by `rooms` + `room_images` tables.
        </p>
      </div>

      {roomError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{roomError.message}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Room inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Beds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No rooms found.
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">#{room.id}</TableCell>
                    <TableCell>
                      <p>{room.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {room.city} - {room.pincode}
                      </p>
                    </TableCell>
                    <TableCell>{room.owner_id ? ownerMap.get(room.owner_id) || room.owner_id : "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant={room.status === "published" ? "default" : "outline"}>{room.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {room.monthly_rent_paise
                        ? new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0,
                          }).format(room.monthly_rent_paise / 100)
                        : `₹${room.price}`}
                    </TableCell>
                    <TableCell>{room.beds_available}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photo uploads</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Store each room photo in `room_images` with `room_id`, `image_url`, and `sort_order`.
          This supports multiple photos per room while keeping the existing `rooms.image` field for compatibility.
        </CardContent>
      </Card>
    </div>
  )
}