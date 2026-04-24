import { createClient } from "@supabase/supabase-js"

const rooms = [
  {
    id: 1,
    image: "/images/room-1.jpg",
    price: "12,000",
    location: "Vijay Nagar, Indore",
    city: "Indore",
    pincode: "452010",
    type: "Student",
    is_ready: true,
    for_girls_only: true,
    beds_available: 2,
  },
  {
    id: 2,
    image: "/images/room-2.jpg",
    price: "18,500",
    location: "Bhanwar Kuwa, Indore",
    city: "Indore",
    pincode: "452001",
    type: "Professional",
    is_ready: true,
    for_girls_only: false,
    beds_available: 1,
  },
  {
    id: 3,
    image: "/images/room-3.jpg",
    price: "10,500",
    location: "Silicon City, Indore",
    city: "Indore",
    pincode: "452012",
    type: "Student",
    is_ready: true,
    for_girls_only: false,
    beds_available: 3,
  },
  {
    id: 4,
    image: "/images/room-4.jpg",
    price: "22,000",
    location: "Dwarkapuri, Indore",
    city: "Indore",
    pincode: "452009",
    type: "Professional",
    is_ready: true,
    for_girls_only: true,
    beds_available: 1,
  },
  {
    id: 5,
    image: "/images/room-1.jpg",
    price: "15,000",
    location: "Vaishali Nagar, Indore",
    city: "Indore",
    pincode: "452021",
    type: "Student",
    is_ready: true,
    for_girls_only: false,
    beds_available: 2,
  },
  {
    id: 6,
    image: "/images/room-2.jpg",
    price: "20,000",
    location: "Palasia, Indore",
    city: "Indore",
    pincode: "452001",
    type: "Professional",
    is_ready: true,
    for_girls_only: false,
    beds_available: 1,
  },
]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the seed script")
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const { error } = await supabase.from("rooms").upsert(rooms, {
  onConflict: "id",
})

if (error) {
  throw error
}

console.log(`Seeded ${rooms.length} rooms into Supabase public.rooms`)
