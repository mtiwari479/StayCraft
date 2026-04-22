import { MongoClient } from "mongodb"

const rooms = [
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

if (!process.env.MONGODB_URI) {
  throw new Error("Set MONGODB_URI before running the seed script")
}

const client = new MongoClient(process.env.MONGODB_URI)
const dbName = process.env.MONGODB_DB || "staycraft"

try {
  await client.connect()
  const db = client.db(dbName)
  const collection = db.collection("rooms")

  await collection.deleteMany({})
  await collection.insertMany(rooms)
  await collection.createIndex({ city: 1, pincode: 1, isReady: 1 })

  console.log(`Seeded ${rooms.length} rooms into ${dbName}.rooms`)
} finally {
  await client.close()
}
