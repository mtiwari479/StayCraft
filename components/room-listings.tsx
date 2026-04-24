"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Home, MapPin, Search, SlidersHorizontal } from "lucide-react"
import { demoRooms, type Room } from "@/lib/rooms"

type PropertyType = "1RK" | "1BHK" | "2BHK"

const PROPERTY_TYPE_OPTIONS: PropertyType[] = ["1RK", "1BHK", "2BHK"]

function getLocalityFromLocation(location: string) {
  const [locality] = location.split(",")
  return locality?.trim() || location
}

function inferPropertyType(room: Room): PropertyType {
  if (room.bedsAvailable >= 3) {
    return "2BHK"
  }

  if (room.bedsAvailable === 2) {
    return "1BHK"
  }

  return "1RK"
}

export function RoomListings() {
  const [selectedCity, setSelectedCity] = useState("Indore")
  const [selectedPincode, setSelectedPincode] = useState("All")
  const [selectedLocality, setSelectedLocality] = useState("All")
  const [selectedPropertyType, setSelectedPropertyType] = useState("All")
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
          setRoomsError(
            data.fallback
              ? data.message ||
                  "Showing demo rooms because database rooms could not be loaded."
              : null
          )
        }
      } catch (error) {
        console.error("Room loading error:", error)
        if (isMounted) {
          setRooms(demoRooms)
          setRoomsError(
            "Showing demo rooms because database rooms could not be loaded."
          )
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
      setSelectedLocality("All")
      setSelectedPropertyType("All")
    }
  }, [cities, selectedCity])

  const cityScopedRooms = useMemo(
    () => rooms.filter((room) => room.city === selectedCity),
    [rooms, selectedCity]
  )

  const pincodes = useMemo(() => {
    return Array.from(new Set(cityScopedRooms.map((room) => room.pincode))).sort()
  }, [cityScopedRooms])

  const localities = useMemo(() => {
    return Array.from(
      new Set(cityScopedRooms.map((room) => getLocalityFromLocation(room.location)))
    ).sort()
  }, [cityScopedRooms])

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const cityMatches = room.city === selectedCity
      const pincodeMatches =
        selectedPincode === "All" || room.pincode === selectedPincode
      const localityMatches =
        selectedLocality === "All" ||
        getLocalityFromLocation(room.location) === selectedLocality
      const propertyTypeMatches =
        selectedPropertyType === "All" ||
        inferPropertyType(room) === selectedPropertyType

      return (
        cityMatches &&
        pincodeMatches &&
        localityMatches &&
        propertyTypeMatches &&
        room.isReady
      )
    })
  }, [rooms, selectedCity, selectedPincode, selectedLocality, selectedPropertyType])

  function selectCity(city: string) {
    setSelectedCity(city)
    setSelectedPincode("All")
    setSelectedLocality("All")
    setSelectedPropertyType("All")
  }

  function getRoomActionHref(room: Room, intent: "book-room" | "room-enquiry") {
    const query = new URLSearchParams({
      roomId: String(room.id),
      location: room.location,
    })

    if (intent === "book-room") {
      return `/book?${query.toString()}`
    }

    query.set("intent", intent)
    return `/auth/login?${query.toString()}`
  }

  const selectedSummaryParts = [
    selectedCity,
    selectedPincode !== "All" ? selectedPincode : null,
    selectedLocality !== "All" ? selectedLocality : null,
    selectedPropertyType !== "All" ? selectedPropertyType : null,
  ].filter(Boolean)

  return (
    <section
      id="rooms"
      className="scroll-mt-24 bg-card pb-20 pt-10 lg:scroll-mt-28 lg:pb-28 lg:pt-12"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Available rooms
            </h2>
            <p className="text-lg text-muted-foreground">
              Select city, locality, pincode, and property type to find your room.
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

        <div className="mb-8 rounded-xl border bg-background p-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                Locality
              </span>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={selectedLocality}
                  onChange={(event) => setSelectedLocality(event.target.value)}
                  className="h-11 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-foreground"
                >
                  <option value="All">All localities</option>
                  {localities.map((locality) => (
                    <option key={locality} value={locality}>
                      {locality}
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

            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Property
              </span>
              <div className="relative">
                <Home className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={selectedPropertyType}
                  onChange={(event) => setSelectedPropertyType(event.target.value)}
                  className="h-11 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none transition focus:border-foreground"
                >
                  <option value="All">All types</option>
                  {PROPERTY_TYPE_OPTIONS.map((propertyType) => (
                    <option key={propertyType} value={propertyType}>
                      {propertyType}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <div className="mt-4 flex h-11 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            {selectedSummaryParts.join(" - ")}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span
            className="h-3 w-3 rounded-full bg-pink-500 shadow-sm"
            aria-hidden="true"
          />
          <span>Girls only</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredRooms.map((room) => {
            const propertyType = inferPropertyType(room)

            return (
              <Card
                key={room.id}
                className="group overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={room.image}
                    alt={`Room in ${room.location}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {room.forGirlsOnly && (
                    <div className="absolute right-3 top-3">
                      <div
                        className="h-3 w-3 animate-pulse rounded-full bg-pink-500 shadow-lg"
                        title="Girls only room"
                        aria-label="Girls only room"
                      />
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex gap-2">
                    <Badge
                      variant="secondary"
                      className="border-0 bg-card/90 text-foreground backdrop-blur-sm"
                    >
                      {room.type}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="border-0 bg-card/90 text-foreground backdrop-blur-sm"
                    >
                      {propertyType}
                    </Badge>
                    {room.isReady && (
                      <Badge className="border-0 bg-accent text-accent-foreground">
                        Ready to move
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-lg font-semibold text-foreground">
                      {`Rs. ${room.price}`}
                      <span className="text-sm font-normal text-muted-foreground">
                        /mo
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span className="text-sm">{room.location}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Pincode {room.pincode}</span>
                    <span>
                      {room.bedsAvailable} room{room.bedsAvailable > 1 ? "s" : ""} left
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button asChild size="lg" className="h-11 rounded-full">
                      <Link
                        href={getRoomActionHref(room, "book-room")}
                        aria-label={`Book the room in ${room.location}`}
                      >
                        Book
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="h-11 rounded-full"
                    >
                      <Link
                        href={getRoomActionHref(room, "room-enquiry")}
                        aria-label={`Send an enquiry for the room in ${room.location}`}
                      >
                        Enquiry
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {!isLoadingRooms && filteredRooms.length === 0 && (
          <div className="rounded-xl border bg-background p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              No rooms available here
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different locality, property type, or nearby pincode.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}