import { NextRequest, NextResponse } from "next/server"
import { getMongoClient } from "@/lib/mongodb"

type PropertyLead = {
  ownerName: string
  phone: string
  email?: string
  propertyType: string
  city: string
  pincode: string
  address: string
  expectedRent?: string
  roomsAvailable?: string
  notes?: string
  status: "new"
  createdAt: Date
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const lead: PropertyLead = {
      ownerName: clean(body.ownerName),
      phone: clean(body.phone),
      email: clean(body.email) || undefined,
      propertyType: clean(body.propertyType),
      city: clean(body.city),
      pincode: clean(body.pincode),
      address: clean(body.address),
      expectedRent: clean(body.expectedRent) || undefined,
      roomsAvailable: clean(body.roomsAvailable) || undefined,
      notes: clean(body.notes) || undefined,
      status: "new",
      createdAt: new Date(),
    }

    if (!lead.ownerName || !lead.phone || !lead.propertyType || !lead.city || !lead.pincode || !lead.address) {
      return NextResponse.json(
        { error: "Please fill all required property details." },
        { status: 400 }
      )
    }

    const client = await getMongoClient()
    const db = client.db(process.env.MONGODB_DB || "staycraft")
    const result = await db.collection<PropertyLead>("property_leads").insertOne(lead)

    return NextResponse.json({
      ok: true,
      id: result.insertedId.toString(),
      message: "Property details submitted. Our team will contact you shortly.",
    })
  } catch (error) {
    console.error("Property lead API error:", error)
    return NextResponse.json(
      { error: "Unable to submit property details right now." },
      { status: 500 }
    )
  }
}
