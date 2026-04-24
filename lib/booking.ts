import { parseInrToPaise, type Room } from "@/lib/rooms"
import {
  createRoomBooking,
  getRoomById as getRoomByIdFromSupabase,
  updateRoomBooking,
} from "@/lib/supabase/staycraft"

export type RoomBooking = {
  id?: string
  roomId: number
  roomSnapshot: Room
  userId: string
  userEmail: string
  amountPaise: number
  currency: "INR"
  status: "created" | "paid"
  intent: "book-room"
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  createdAt?: string
  updatedAt?: string
  paidAt?: string
}

export async function getRoomById(roomId: number) {
  return getRoomByIdFromSupabase(roomId)
}

export function getBookingAmountPaise(room: Room) {
  const asPaise = parseInrToPaise(room.price)

  if (!Number.isFinite(asPaise) || asPaise <= 0) {
    throw new Error("Room price must be a valid positive amount")
  }

  return asPaise
}

export async function createPendingBooking(
  input: Omit<
    RoomBooking,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "status"
    | "currency"
    | "intent"
    | "razorpayOrderId"
    | "razorpayPaymentId"
    | "razorpaySignature"
    | "paidAt"
  >
) {
  return createRoomBooking({
    room_id: input.roomId,
    room_snapshot: input.roomSnapshot,
    user_id: input.userId,
    user_email: input.userEmail,
    amount_paise: input.amountPaise,
    currency: "INR",
    intent: "book-room",
    status: "created",
  })
}

export async function markBookingOrderCreated(bookingId: string, userId: string, razorpayOrderId: string) {
  await updateRoomBooking(bookingId, userId, {
    razorpay_order_id: razorpayOrderId,
    updated_at: new Date().toISOString(),
  })
}

export async function markBookingPaid(input: {
  bookingId: string
  userId: string
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}) {
  return updateRoomBooking(input.bookingId, input.userId, {
    status: "paid",
    razorpay_order_id: input.razorpayOrderId,
    razorpay_payment_id: input.razorpayPaymentId,
    razorpay_signature: input.razorpaySignature,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}
