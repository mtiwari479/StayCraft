"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const heroPhotos = [
  {
    src: "/images/1bhk_demo01.jpeg",
    alt: "Modern minimalist private room with warm lighting",
  },
  {
    src: "/images/1bhk_demo02.jpeg",
    alt: "Student room with organized furniture and natural light",
  },
  {
    src: "/images/1bhk_demo03.jpeg",
    alt: "Professional ready-to-move private room",
  },
]

export function Hero() {
  const [activePhoto, setActivePhoto] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePhoto((current) => (current + 1) % heroPhotos.length)
    }, 3500)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.1] text-balance">
                Ready-to-move private rooms. No hassle.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Standardized, verified spaces for students & professionals. Move in today, stress-free.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="group">
                Explore Rooms
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Apply Now
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-foreground">500+</span>
                <span className="text-sm text-muted-foreground">Verified rooms</span>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-foreground">98%</span>
                <span className="text-sm text-muted-foreground">Happy tenants</span>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-foreground">24h</span>
                <span className="text-sm text-muted-foreground">Move-in ready</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              {heroPhotos.map((photo, index) => (
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className={`object-cover transition-opacity duration-700 ${
                    activePhoto === index ? "opacity-100" : "opacity-0"
                  }`}
                  priority={index === 0}
                />
              ))}
            </div>
            <div className="mt-5 flex justify-center gap-2">
              {heroPhotos.map((photo, index) => (
                <button
                  key={photo.src}
                  type="button"
                  aria-label={`Show room photo ${index + 1}`}
                  onClick={() => setActivePhoto(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    activePhoto === index
                      ? "w-8 bg-foreground"
                      : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  }`}
                />
              ))}
            </div>
            <div className="absolute -bottom-3 -left-3 bg-white/90 backdrop-blur-md rounded-lg px-3 py-2 shadow-md border border-border">
  <div className="flex items-center gap-2">
    
    <div className="size-7 rounded-full bg-emerald-100 flex items-center justify-center">
      <svg className="size-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <div className="leading-tight">
      <p className="text-xs font-medium text-foreground">Ready to move in</p>
      <p className="text-[10px] text-muted-foreground">Verified & trusted</p>
    </div>

  </div>
</div>
          </div>
        </div>
      </div>
    </section>
  )
}
