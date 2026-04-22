import { NextRequest, NextResponse } from "next/server"
import { getMongoClient } from "@/lib/mongodb"

export type RoomRecord = {
  id: number
  image: string
  price: string
  location: string
  city: string
  pincode: string
  type: "Student" | "Professional"
  isReady: boolean
  forGirlsOnly: boolean
  bedsAvailable: number
}

export async function GET(req: NextRequest) {
  try {
    const city = req.nextUrl.searchParams.get("city")
    const pincode = req.nextUrl.searchParams.get("pincode")

    const query: Partial<Pick<RoomRecord, "city" | "pincode" | "isReady">> = {
      isReady: true,
    }

    if (city && city !== "All") {
      query.city = city
    }

    if (pincode && pincode !== "All") {
      query.pincode = pincode
    }

    const client = await getMongoClient()
    const db = client.db(process.env.MONGODB_DB || "staycraft")
    const rooms = await db
      .collection<RoomRecord>("rooms")
      .find(query)
      .sort({ city: 1, pincode: 1, price: 1 })
      .toArray()

    return NextResponse.json({
      rooms: rooms.map(({ _id, ...room }) => room),
    })
  } catch (error) {
    console.error("Rooms API error:", error)
    return NextResponse.json(
      { error: "Unable to load rooms from database", rooms: [] },
      { status: 500 }
    )
  }
}
