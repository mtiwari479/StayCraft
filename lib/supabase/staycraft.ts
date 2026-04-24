import { createClient } from "@/lib/supabase/server"
import { demoRooms, type Room } from "@/lib/rooms"

type RoomRow = {
  id: number
  image: string
  price: string
  location: string
  city: string
  pincode: string
  type: "Student" | "Professional"
  is_ready: boolean
  for_girls_only: boolean
  beds_available: number
}

type PropertyLeadInsert = {
  owner_name: string
  phone: string
  email?: string | null
  property_type: string
  city: string
  pincode: string
  address: string
  expected_rent?: string | null
  rooms_available?: string | null
  notes?: string | null
  status: "new"
}

type RoomBookingInsert = {
  room_id: number
  room_snapshot: Room
  user_id: string
  user_email: string
  amount_paise: number
  currency: "INR"
  status: "created"
  intent: "book-room"
}

type RoomBookingUpdate = {
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
  status?: "created" | "paid"
  paid_at?: string
  updated_at: string
}

function mapRoomRowToRoom(room: RoomRow): Room {
  return {
    id: room.id,
    image: room.image,
    price: room.price,
    location: room.location,
    city: room.city,
    pincode: room.pincode,
    type: room.type,
    isReady: room.is_ready,
    forGirlsOnly: room.for_girls_only,
    bedsAvailable: room.beds_available,
  }
}

function applyRoomFilters(rooms: Room[], city?: string | null, pincode?: string | null) {
  return rooms.filter((room) => {
    const cityMatches = !city || city === "All" || room.city === city
    const pincodeMatches = !pincode || pincode === "All" || room.pincode === pincode
    return cityMatches && pincodeMatches && room.isReady
  })
}

export async function getRooms(input?: {
  city?: string | null
  pincode?: string | null
}) {
  const supabase = await createClient()
  let query = supabase
    .from("rooms")
    .select(
      "id,image,price,location,city,pincode,type,is_ready,for_girls_only,beds_available"
    )
    .eq("is_ready", true)
    .order("city", { ascending: true })
    .order("pincode", { ascending: true })
    .order("price", { ascending: true })

  if (input?.city && input.city !== "All") {
    query = query.eq("city", input.city)
  }

  if (input?.pincode && input.pincode !== "All") {
    query = query.eq("pincode", input.pincode)
  }

  const { data, error } = await query

  if (error) {
    console.error("Supabase rooms query error:", error)
    return {
      rooms: applyRoomFilters(demoRooms, input?.city, input?.pincode),
      fallback: true,
      message: "Showing demo rooms because Supabase rooms could not be loaded.",
    }
  }

  return {
    rooms: (data ?? []).map(mapRoomRowToRoom),
    fallback: false,
    message: null,
  }
}

export async function getRoomById(roomId: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("rooms")
    .select(
      "id,image,price,location,city,pincode,type,is_ready,for_girls_only,beds_available"
    )
    .eq("id", roomId)
    .maybeSingle()

  if (error) {
    console.error("Supabase room lookup error:", error)
    return demoRooms.find((room) => room.id === roomId) ?? null
  }

  const room = data as RoomRow | null

  if (!room) {
    return demoRooms.find((room) => room.id === roomId) ?? null
  }

  return mapRoomRowToRoom(room)
}

export async function createPropertyLead(input: PropertyLeadInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("property_leads")
    .insert(input)
    .select("id")
    .single()

  if (error) {
    throw error
  }

  return (data as { id: string }).id
}

export async function createRoomBooking(input: RoomBookingInsert) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("room_bookings")
    .insert(input)
    .select("id")
    .single()

  if (error) {
    throw error
  }

  return (data as { id: string }).id
}

export async function updateRoomBooking(bookingId: string, userId: string, updates: RoomBookingUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("room_bookings")
    .update(updates)
    .eq("id", bookingId)
    .eq("user_id", userId)
    .select("id,status,razorpay_order_id,razorpay_payment_id")
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}
