"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="py-24 lg:py-32 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance max-w-2xl">
            Find your next room today
          </h2>
          <p className="text-lg text-primary-foreground/70 max-w-lg">
            Join hundreds of happy tenants who found their perfect space through nestd.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="group"
          >
            Explore Rooms
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
