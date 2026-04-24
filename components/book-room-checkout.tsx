"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatInrFromPaise, type Room } from "@/lib/rooms"

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string
      amount: number
      currency: string
      name: string
      description: string
      order_id: string
      prefill?: {
        email?: string
      }
      notes?: Record<string, string>
      theme?: {
        color?: string
      }
      modal?: {
        ondismiss?: () => void
      }
      handler: (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => void | Promise<void>
    }) => {
      open: () => void
    }
  }
}

type BookRoomCheckoutProps = {
  room: Room
  userEmail: string
  bookingAmountPaise: number | null
  razorpayKeyId: string | null
}

function getScriptErrorMessage() {
  return "Unable to load Razorpay checkout right now. Please try again."
}

async function readJsonOrThrow(response: Response, fallbackMessage: string) {
  const contentType = response.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  const body = await response.text()

  if (response.status === 404) {
    throw new Error("Payment API route is unavailable right now. Restart the dev server and try again.")
  }

  const trimmedBody = body.trim()
  const shortBody = trimmedBody.slice(0, 120)

  throw new Error(shortBody || fallbackMessage)
}

export function BookRoomCheckout({
  room,
  userEmail,
  bookingAmountPaise,
  razorpayKeyId,
}: BookRoomCheckoutProps) {
  const router = useRouter()
  const [isScriptReady, setIsScriptReady] = useState(false)
  const [isStartingPayment, setIsStartingPayment] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (window.Razorpay) {
      setIsScriptReady(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => setIsScriptReady(true)
    script.onerror = () => setError(getScriptErrorMessage())
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  async function handleBookNow() {
    if (!bookingAmountPaise || !razorpayKeyId) {
      setError("This room does not have a valid payable amount yet.")
      return
    }

    if (!window.Razorpay) {
      setError(getScriptErrorMessage())
      return
    }

    try {
      setError(null)
      setIsStartingPayment(true)

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: room.id,
        }),
      })

      const orderPayload = await readJsonOrThrow(
        orderResponse,
        "Unable to start payment."
      )

      if (!orderResponse.ok) {
        throw new Error(orderPayload.error || "Unable to start payment.")
      }

      const razorpay = new window.Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.amount,
        currency: orderPayload.currency,
        name: "StayCraft",
        description: `Room booking payment for ${room.location}`,
        order_id: orderPayload.orderId,
        prefill: {
          email: userEmail,
        },
        notes: {
          bookingId: orderPayload.bookingId,
          roomId: String(room.id),
        },
        theme: {
          color: "#111827",
        },
        modal: {
          ondismiss: () => setIsStartingPayment(false),
        },
        handler: async (paymentResponse) => {
          try {
            setIsVerifyingPayment(true)

            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                bookingId: orderPayload.bookingId,
                ...paymentResponse,
              }),
            })

            const verifyPayload = await readJsonOrThrow(
              verifyResponse,
              "Unable to verify payment."
            )

            if (!verifyResponse.ok) {
              throw new Error(verifyPayload.error || "Unable to verify payment.")
            }

            const successQuery = new URLSearchParams({
              bookingId: orderPayload.bookingId,
              roomId: String(room.id),
              location: room.location,
            })

            router.push(`/book/success?${successQuery.toString()}`)
          } catch (verificationError) {
            const message =
              verificationError instanceof Error
                ? verificationError.message
                : "Unable to verify payment."
            setError(message)
          } finally {
            setIsStartingPayment(false)
            setIsVerifyingPayment(false)
          }
        },
      })

      razorpay.open()
    } catch (paymentError) {
      const message =
        paymentError instanceof Error
          ? paymentError.message
          : "Unable to start payment."
      setError(message)
      setIsStartingPayment(false)
    }
  }

  const isBusy = isStartingPayment || isVerifyingPayment
  const bookingAmountLabel = bookingAmountPaise
    ? formatInrFromPaise(bookingAmountPaise)
    : "Price unavailable"

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={room.image}
            alt={`Room in ${room.location}`}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.18em] text-white/80">
              Booking payment
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{room.location}</h1>
            <p className="mt-2 text-sm text-white/80">
              Complete the payment for this room online and we&apos;ll take the next steps from there.
            </p>
          </div>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Room type</p>
            <p className="mt-1 text-base font-semibold text-foreground">{room.type}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly rent</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {`\u20B9${room.price}/mo`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pincode</p>
            <p className="mt-1 text-base font-semibold text-foreground">{room.pincode}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Availability</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {room.bedsAvailable} room{room.bedsAvailable > 1 ? "s" : ""} left
            </p>
          </div>
        </div>
      </Card>

      <Card className="border-0 shadow-xl">
        <div className="p-6">
          <div className="flex items-start gap-3 rounded-2xl bg-secondary/70 p-4">
            <div className="rounded-full bg-background p-2 text-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Secure booking checkout</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your payment is initiated only after a signed server-side order is created for this room.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Amount to pay</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{bookingAmountLabel}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>Using the room price shown on the card</p>
                <p className="mt-1">{userEmail}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p>1. Click Book now to open Razorpay checkout.</p>
            <p>2. Complete the payment using your preferred payment method.</p>
            <p>3. We verify the payment and confirm your booking reference instantly.</p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            size="lg"
            className="mt-6 h-12 w-full rounded-full"
            onClick={handleBookNow}
            disabled={!isScriptReady || !bookingAmountPaise || !razorpayKeyId || isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {isVerifyingPayment ? "Verifying payment" : "Opening checkout"}
              </>
            ) : (
              <>
                Book now
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          {!isScriptReady && !error && (
            <p className="mt-3 text-sm text-muted-foreground">Preparing secure checkout...</p>
          )}
        </div>
      </Card>
    </div>
  )
}
