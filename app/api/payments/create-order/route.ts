import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  createPendingBooking,
  getBookingAmountPaise,
  getRoomById,
  markBookingOrderCreated,
} from "@/lib/booking"
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay"

function isSupabaseSchemaCacheError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "PGRST205"
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 })
    }

    const body = await request.json()
    const roomId = Number(body.roomId)

    if (!Number.isInteger(roomId) || roomId <= 0) {
      return NextResponse.json({ error: "A valid room is required." }, { status: 400 })
    }

    const room = await getRoomById(roomId)
    if (!room) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 })
    }

    let amountPaise: number

    try {
      amountPaise = getBookingAmountPaise(room)
    } catch (amountError) {
      console.error("Room price error:", amountError)
      return NextResponse.json(
        { error: "This room does not have a valid payable amount yet." },
        { status: 500 }
      )
    }

    const keyId = getRazorpayKeyId()
    if (!keyId) {
      return NextResponse.json(
        { error: "Razorpay public key is missing." },
        { status: 503 }
      )
    }

    const bookingId = await createPendingBooking({
      roomId: room.id,
      roomSnapshot: room,
      userId: user.id,
      userEmail: user.email,
      amountPaise,
    })

    const order = await createRazorpayOrder({
      amount: amountPaise,
      receipt: `booking_${bookingId.slice(-10)}`,
      notes: {
        bookingId,
        roomId: String(room.id),
        roomLocation: room.location,
        userEmail: user.email,
      },
    })

    await markBookingOrderCreated(bookingId, user.id, order.id)

    return NextResponse.json({
      bookingId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    })
  } catch (error) {
    console.error("Create order API error:", error)

    if (isSupabaseSchemaCacheError(error)) {
      return NextResponse.json(
        {
          error:
            "Supabase tables are not set up yet. Run `supabase/staycraft_schema.sql` in the Supabase SQL editor, then try again.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Unable to start payment right now." },
      { status: 500 }
    )
  }
}
