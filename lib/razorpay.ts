import { createHmac } from "crypto"

type RazorpayOrderResponse = {
  id: string
  entity: "order"
  amount: number
  amount_due: number
  amount_paid: number
  currency: string
  receipt: string
  status: "created" | "attempted" | "paid"
}

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error("Missing Razorpay credentials")
  }

  return { keyId, keySecret }
}

export function getRazorpayKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || null
}

export async function createRazorpayOrder(input: {
  amount: number
  receipt: string
  notes?: Record<string, string>
}) {
  const { keyId, keySecret } = getRazorpayCredentials()
  const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64")

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes,
    }),
    cache: "no-store",
  })

  const payload = (await response.json()) as RazorpayOrderResponse & {
    error?: { description?: string }
  }

  if (!response.ok) {
    throw new Error(payload.error?.description || "Unable to create Razorpay order")
  }

  return payload
}

export function verifyRazorpaySignature(input: {
  orderId: string
  paymentId: string
  signature: string
}) {
  const { keySecret } = getRazorpayCredentials()
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex")

  return expectedSignature === input.signature
}
