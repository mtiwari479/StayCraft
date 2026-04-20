"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { ArrowRight, GraduationCap, Briefcase } from "lucide-react"

const categories = [
  {
    id: "student",
    title: "Student Living",
    description: "Affordable, functional, and study-ready spaces designed for academic success.",
    icon: GraduationCap,
    image: "/images/student-room.jpg",
    features: ["Study desk included", "High-speed WiFi", "Near campuses"],
  },
  {
    id: "professional",
    title: "Professional Living",
    description: "Clean, quiet, and premium spaces for working professionals who value comfort.",
    icon: Briefcase,
    image: "/images/professional-room.jpg",
    features: ["Work-from-home ready", "Premium amenities", "Prime locations"],
  },
]

export function RoomCategories() {
  return (
    <section id="rooms" className="py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance">
            Find your perfect space
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you&apos;re studying or working, we have rooms tailored to your lifestyle.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <div className="bg-card/90 backdrop-blur-sm rounded-full p-3">
                    <category.icon className="size-5 text-foreground" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-foreground">{category.title}</h3>
                  <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
