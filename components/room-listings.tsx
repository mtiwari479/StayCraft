"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight, Search, SlidersHorizontal } from "lucide-react"

type Room = {
  id: number
  image: string
  price: string
  location: string
  city: string
  pincode: string
  type: "Student" | "Professional"
  isReady: boolean
  forGirlsOnly: boolean
  bedsAvailable: number
}

const demoRooms: Room[] = [
  {
    id: 1,
    image: "/images/room-1.jpg",
    price: "12,000",
    location: "Vijay Nagar, Indore",
    city: "Indore",
    pincode: "452010",
    type: "Student",
    isReady: true,
    forGirlsOnly: true,
    bedsAvailable: 2,
  },
  {
    id: 2,
    image: "/images/room-2.jpg",
    price: "18,500",
    location: "Bhanwar Kuwa, Indore",
    city: "Indore",
    pincode: "452001",
    type: "Professional",
    isReady: true,
    forGirlsOnly: false,
    bedsAvailable: 1,
  },
  {
    id: 3,
    image: "/images/room-3.jpg",
    price: "10,500",
    location: "Silicon City, Indore",
    city: "Indore",
    pincode: "452012",
    type: "Student",
    isReady: true,
    forGirlsOnly: false,
    bedsAvailable: 3,
  },
  {
    id: 4,
    image: "/images/room-4.jpg",
    price: "22,000",
    location: "Dwarkapuri, Indore",
    city: "Indore",
    pincode: "452009",
    type: "Professional",
    isReady: true,
    forGirlsOnly: true,
    bedsAvailable: 1,
  },
  {
    id: 5,
    image: "/images/room-1.jpg",
    price: "15,000",
    location: "Vaishali Nagar, Jaipur",
    city: "Jaipur",
    pincode: "302021",
    type: "Student",
    isReady: true,
    forGirlsOnly: false,
    bedsAvailable: 2,
  },
  {
    id: 6,
    image: "/images/room-2.jpg",
    price: "20,000",
    location: "Koramangala, Bengaluru",
    city: "Bengaluru",
    pincode: "560034",
    type: "Professional",
    isReady: true,
    forGirlsOnly: false,
    bedsAvailable: 1,
  },
]

export function RoomListings() {
  const [selectedCity, setSelectedCity] = useState("Indore")
  const [selectedPincode, setSelectedPincode] = useState("All")
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [roomsError, setRoomsError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadRooms() {
      try {
        setIsLoadingRooms(true)
        setRoomsError(null)

        const response = await fetch("/api/rooms", {
          cache: "no-store",
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Unable to load rooms")
        }

        if (isMounted) {
          setRooms(Array.isArray(data.rooms) ? data.rooms : [])
        }
      } catch (error) {
        console.error("Room loading error:", error)
        if (isMounted) {
          setRooms(demoRooms)
          setRoomsError("Showing demo rooms because database rooms could not be loaded.")
        }
      } finally {
        if (isMounted) {
          setIsLoadingRooms(false)
        }
      }
    }

    loadRooms()

    return () => {
      isMounted = false
    }
  }, [])

  const cities = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.city))).sort(),
    [rooms]
  )

  useEffect(() => {
    if (cities.length > 0 && !cities.includes(selectedCity)) {
      setSelectedCity(cities[0])
      setSelectedPincode("All")
    }
  }, [cities, selectedCity])

  const pincodes = useMemo(() => {
    return Array.from(
      new Set(
        rooms
          .filter((room) => room.city === selectedCity)
          .map((room) => room.pincode)
      )
    ).sort()
  }, [rooms, selectedCity])

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const cityMatches = room.city === selectedCity
      const pincodeMatches = selectedPincode === "All" || room.pincode === selectedPincode
      return cityMatches && pincodeMatches && room.isReady
    })
  }, [rooms, selectedCity, selectedPincode])

  function selectCity(city: string) {
    setSelectedCity(city)
    setSelectedPincode("All")
  }

  return (
    <section id="rooms" className="pt-10 pb-20 lg:pt-12 lg:pb-28 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Available rooms
            </h2>
            <p className="text-lg text-muted-foreground">
              Select a location and pincode to see rooms ready in that area.
            </p>
          </div>
          <Button variant="outline" className="group self-start sm:self-auto">
            {isLoadingRooms ? "Loading" : `${filteredRooms.length} available`}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {roomsError && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {roomsError}
          </div>
        )}

        <div className="mb-8 grid gap-4 rounded-xl border bg-background p-4 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Location
            </span>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={selectedCity}
                onChange={(event) => selectCity(event.target.value)}
                className="h-11 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-foreground"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pincode
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={selectedPincode}
                onChange={(event) => setSelectedPincode(event.target.value)}
                className="h-11 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-foreground"
              >
                <option value="All">All pincodes</option>
                {pincodes.map((pincode) => (
                  <option key={pincode} value={pincode}>
                    {pincode}
                  </option>
                ))}
              </select>
            </div>
          </label>

          <div className="flex h-11 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            {selectedCity}
            {selectedPincode !== "All" ? ` - ${selectedPincode}` : ""}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className="h-3 w-3 rounded-full bg-pink-500 shadow-sm"
            aria-hidden="true"
          />
          <span>Girls only</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
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
                {room.forGirlsOnly && (
                  <div className="absolute top-3 right-3">
                    <div
                      className="w-3 h-3 bg-pink-500 rounded-full shadow-lg animate-pulse"
                      title="Girls only room"
                      aria-label="Girls only room"
                    />
                  </div>
                )}
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
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Pincode {room.pincode}</span>
                  <span>{room.bedsAvailable} room{room.bedsAvailable > 1 ? "s" : ""} left</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!isLoadingRooms && filteredRooms.length === 0 && (
          <div className="rounded-xl border bg-background p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">No rooms available here</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different pincode or nearby location.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
