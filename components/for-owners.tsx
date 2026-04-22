"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Wallet, UserCheck, Wrench, ArrowRight, Loader2 } from "lucide-react"

const benefits = [
  {
    title: "Guaranteed rent",
    description: "Receive fixed monthly payments on time, every time. No more chasing tenants.",
    icon: Wallet,
  },
  {
    title: "No tenant handling",
    description: "We manage all tenant interactions, complaints, and requests on your behalf.",
    icon: UserCheck,
  },
  {
    title: "Property maintained",
    description: "Regular upkeep and professional cleaning keeps your property in top condition.",
    icon: Wrench,
  },
]

export function ForOwners() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submitProperty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(formData.entries())

    try {
      const response = await fetch("/api/property-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit property details.")
      }

      event.currentTarget.reset()
      setMessage(data.message || "Property details submitted.")
      window.setTimeout(() => setOpen(false), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit property details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="for-owners" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                For property owners
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance">
                Earn fixed rent without the stress
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Partner with StayCraft and transform your property into a hassle-free income source. We handle everything.
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="self-start group">
                  List Your Property
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>List your property</DialogTitle>
                  <DialogDescription>
                    Share the basics and StayCraft will review your property for managed rentals.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={submitProperty} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      Owner name
                      <Input name="ownerName" placeholder="Your full name" required />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Phone
                      <Input name="phone" placeholder="Mobile number" required />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      Email
                      <Input name="email" type="email" placeholder="you@example.com" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Property type
                      <select
                        name="propertyType"
                        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:border-foreground"
                        required
                      >
                        <option value="">Select type</option>
                        <option value="Flat">Flat</option>
                        <option value="Room">Room</option>
                        <option value="PG">PG</option>
                        <option value="House">House</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      City
                      <Input name="city" placeholder="Indore" required />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Pincode
                      <Input name="pincode" placeholder="452010" required />
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-medium">
                    Address
                    <Textarea name="address" placeholder="Area, landmark, building name" required />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      Expected rent
                      <Input name="expectedRent" placeholder="15000" />
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      Rooms available
                      <Input name="roomsAvailable" placeholder="2" />
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-medium">
                    Notes
                    <Textarea name="notes" placeholder="Furnishing, tenant preference, availability date" />
                  </label>

                  {message && <p className="text-sm font-medium text-emerald-700">{message}</p>}
                  {error && <p className="text-sm font-medium text-red-600">{error}</p>}

                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-fit">
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    Submit property
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg"
              >
                <div className="size-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <benefit.icon className="size-6 text-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
