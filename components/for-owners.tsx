"use client"

import { Button } from "@/components/ui/button"
import { Wallet, UserCheck, Wrench, ArrowRight } from "lucide-react"

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
                Partner with nestd and transform your property into a hassle-free income source. We handle everything.
              </p>
            </div>

            <Button size="lg" className="self-start group">
              List Your Property
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
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
