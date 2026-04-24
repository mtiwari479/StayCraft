"use client"

import { FileText, Calendar, Home } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Schedule visit",
    description: "Pick a convenient time slot to visit the room. Our team will guide you through the space.",
    icon: Calendar,
  },
  {
    step: "02",
    title: "Book online",
    description: "Secure your room online with a simple booking flow and quick confirmation.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Move in hassle-free",
    description: "Sign digitally, pay securely, and move into your new home. It&apos;s that simple.",
    icon: Home,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="pt-12 pb-10 lg:pt-14 lg:pb-12 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance">
            Three steps to your new home
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;ve simplified the rental process so you can focus on what matters.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border hover:border-accent/50 transition-colors"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 -right-6 lg:-right-8 w-12 lg:w-16">
                  <svg
                    className="w-full text-border"
                    viewBox="0 0 48 8"
                    fill="none"
                  >
                    <path
                      d="M0 4H44M44 4L40 1M44 4L40 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
              
              <div className="size-14 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                <item.icon className="size-6 text-foreground" />
              </div>
              
              <span className="text-sm font-medium text-accent-foreground/60 mb-2">
                Step {item.step}
              </span>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
