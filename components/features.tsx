"use client"

import { CheckCircle2, Shield, Users, Sparkles } from "lucide-react"

const features = [
  {
    title: "Standardized setup",
    description: "Every room comes with essential furniture and amenities. What you see is what you get.",
    icon: CheckCircle2,
  },
  {
    title: "Verified rooms",
    description: "All listings are personally inspected and verified by our team for quality and safety.",
    icon: Shield,
  },
  {
    title: "No broker hassle",
    description: "Deal directly with us. No middlemen, no hidden fees, no unnecessary complications.",
    icon: Users,
  },
  {
    title: "Clean & managed",
    description: "Professional cleaning and maintenance included. Your space stays pristine.",
    icon: Sparkles,
  },
]

export function Features() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance">
            Why choose StayCraft
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;re not just another rental platform. We&apos;re building a better way to live.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col p-6 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all hover:shadow-lg"
            >
              <div className="size-12 rounded-xl bg-accent/20 flex items-center justify-center mb-5">
                <feature.icon className="size-6 text-foreground" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
