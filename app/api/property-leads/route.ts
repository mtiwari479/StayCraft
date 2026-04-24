import { NextRequest, NextResponse } from "next/server"
import { createPropertyLead } from "@/lib/supabase/staycraft"

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const lead = {
      owner_name: clean(body.ownerName),
      phone: clean(body.phone),
      email: clean(body.email) || undefined,
      property_type: clean(body.propertyType),
      city: clean(body.city),
      pincode: clean(body.pincode),
      address: clean(body.address),
      expected_rent: clean(body.expectedRent) || undefined,
      rooms_available: clean(body.roomsAvailable) || undefined,
      notes: clean(body.notes) || undefined,
      status: "new" as const,
    }

    if (!lead.owner_name || !lead.phone || !lead.property_type || !lead.city || !lead.pincode || !lead.address) {
      return NextResponse.json(
        { error: "Please fill all required property details." },
        { status: 400 }
      )
    }

    const id = await createPropertyLead(lead)

    return NextResponse.json({
      ok: true,
      id,
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
