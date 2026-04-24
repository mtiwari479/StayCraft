import { NextRequest, NextResponse } from "next/server"
import type { Room } from "@/lib/rooms"
import { getRooms } from "@/lib/supabase/staycraft"

export type RoomRecord = Room

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")
  const pincode = req.nextUrl.searchParams.get("pincode")

  try {
    const result = await getRooms({ city, pincode })
    return NextResponse.json(result)
  } catch (error) {
    console.error("Rooms API error:", error)
    return NextResponse.json(
      { error: "Unable to load rooms right now.", rooms: [] },
      { status: 500 }
    )
  }
}
