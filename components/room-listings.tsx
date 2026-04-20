"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight } from "lucide-react"

const rooms = [
  {
    id: 1,
    image: "/images/room-1.jpg",
    price: "12,000",
    location: "Vijay Nagar, Indore",
    type: "Student",
    isReady: true,
  },
  {
    id: 2,
    image: "/images/room-2.jpg",
    price: "18,500",
    location: "BhnwarKua, Indore",
    type: "Professional",
    isReady: true,
  },
  {
    id: 3,
    image: "/images/room-3.jpg",
    price: "10,500",
    location: "Silicon city, Indore",
    type: "Student",
    isReady: true,
  },
  {
    id: 4,
    image: "/images/room-4.jpg",
    price: "22,000",
    location: "Dwarkapuri, Indore",
    type: "Professional",
    isReady: true,
  },
]

export function RoomListings() {
  return (
    <section className="py-24 lg:py-32 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Available rooms
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore our curated selection of ready-to-move spaces.
            </p>
          </div>
          <Button variant="outline" className="group self-start sm:self-auto">
            View all rooms
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={room.image}
                  alt={`Room in ${room.location}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground border-0">
                    {room.type}
                  </Badge>
                  {room.isReady && (
                    <Badge className="bg-accent text-accent-foreground border-0">
                      Ready to move
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-foreground">
                    {"₹"}{room.price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-4" />
                  <span className="text-sm">{room.location}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
