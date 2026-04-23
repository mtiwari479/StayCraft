import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { RoomCategories } from "@/components/room-categories"
import { HowItWorks } from "@/components/how-it-works"
import { Features } from "@/components/features"
import { RoomListings } from "@/components/room-listings"
import { ForOwners } from "@/components/for-owners"
import { FinalCTA } from "@/components/final-cta"
import { Footer } from "@/components/footer"
import { AnnouncementBar } from "@/components/announcement-bar"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-16">  {/* pushes below fixed header */}
  <AnnouncementBar />
  <Hero />
        <RoomCategories />
        <HowItWorks />
        <RoomListings />
        <Features />
        <ForOwners />
        <FinalCTA />
        <Footer />
      </div>
    </main>
  )
}
