import { notFound, redirect } from "next/navigation"
import { Header } from "@/components/header"
import { BookRoomCheckout } from "@/components/book-room-checkout"
import { getBookingAmountPaise, getRoomById } from "@/lib/booking"
import { getRazorpayKeyId } from "@/lib/razorpay"
import { createClient } from "@/lib/supabase/server"

type BookPageProps = {
  searchParams?: Promise<{
    roomId?: string
    location?: string
  }>
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const roomId = Number(resolvedSearchParams?.roomId)

  if (!Number.isInteger(roomId) || roomId <= 0) {
    notFound()
  }

  const room = await getRoomById(roomId)

  if (!room) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const roomQuery = new URLSearchParams({
    roomId: String(room.id),
    location: room.location,
  })

  if (!user?.id || !user.email) {
    const loginQuery = new URLSearchParams({
      intent: "book-room",
      roomId: String(room.id),
      location: room.location,
      returnTo: `/book?${roomQuery.toString()}`,
    })

    redirect(`/auth/login?${loginQuery.toString()}`)
  }

  let bookingAmountPaise: number | null = null

  try {
    bookingAmountPaise = getBookingAmountPaise(room)
  } catch (error) {
    console.error("Room price error:", error)
  }

  return (
    <main className="min-h-screen bg-card">
      <Header />
      <div className="px-6 pb-16 pt-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
              StayCraft bookings
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
              Complete your booking
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Review your room details and complete the payment using the listed room amount.
            </p>
          </div>

          <BookRoomCheckout
            room={room}
            userEmail={user.email}
            bookingAmountPaise={bookingAmountPaise}
            razorpayKeyId={getRazorpayKeyId()}
          />
        </div>
      </div>
    </main>
  )
}
