import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"

type BookingSuccessPageProps = {
  searchParams?: Promise<{
    bookingId?: string
    roomId?: string
    location?: string
  }>
}

export default async function BookingSuccessPage({
  searchParams,
}: BookingSuccessPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const bookingId = resolvedSearchParams?.bookingId
  const location = resolvedSearchParams?.location

  return (
    <main className="min-h-screen bg-card">
      <Header />
      <div className="px-6 pb-16 pt-24 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border bg-background p-8 text-center shadow-xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Payment received
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
            Booking confirmed
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your booking advance has been recorded for {location || "your selected room"}.
          </p>
          {bookingId && (
            <div className="mt-6 rounded-2xl border bg-card px-4 py-5">
              <p className="text-sm text-muted-foreground">Booking reference</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{bookingId}</p>
            </div>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-6">
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href="/#rooms">Browse more rooms</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
