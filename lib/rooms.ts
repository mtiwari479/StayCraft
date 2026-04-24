export type Room = {
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

export const demoRooms: Room[] = [
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
    location: "Vaishali Nagar, Indore",
    city: "Indore",
    pincode: "452021",
    type: "Student",
    isReady: true,
    forGirlsOnly: false,
    bedsAvailable: 2,
  },
  {
    id: 6,
    image: "/images/room-2.jpg",
    price: "20,000",
    location: "Palasia, Indore",
    city: "Indore",
    pincode: "452001",
    type: "Professional",
    isReady: true,
    forGirlsOnly: false,
    bedsAvailable: 1,
  },
]

export function parseInrToPaise(value: string) {
  const normalizedValue = value.replace(/,/g, "").trim()
  if (!normalizedValue) {
    return 0
  }

  const amount = Number.parseFloat(normalizedValue)
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0
  }

  return Math.round(amount * 100)
}

export function formatInrFromPaise(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value / 100)
}
