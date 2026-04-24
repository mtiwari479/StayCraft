import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { markBookingPaid } from "@/lib/booking"
import { verifyRazorpaySignature } from "@/lib/razorpay"

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 })
    }

    const body = await request.json()
    const bookingId = clean(body.bookingId)
    const orderId = clean(body.razorpay_order_id)
    const paymentId = clean(body.razorpay_payment_id)
    const signature = clean(body.razorpay_signature)

    if (!bookingId || !orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing payment verification details." },
        { status: 400 }
      )
    }

    const isValidSignature = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    })

    if (!isValidSignature) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 })
    }

    const booking = await markBookingPaid({
      bookingId,
      userId: user.id,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking record not found." }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      bookingId,
      paymentId,
    })
  } catch (error) {
    console.error("Verify payment API error:", error)
    return NextResponse.json(
      { error: "Unable to verify payment right now." },
      { status: 500 }
    )
  }
}
