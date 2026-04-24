import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default async function SignUpSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ roomId?: string; location?: string; intent?: string }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const intent = resolvedSearchParams?.intent
  const roomLocation = resolvedSearchParams?.location
  const roomId = resolvedSearchParams?.roomId
  const followUpMessage =
    intent === 'book-room'
      ? 'Once your email is confirmed, sign in to continue booking'
      : intent === 'room-enquiry'
        ? 'Once your email is confirmed, sign in to continue your enquiry for'
        : intent === 'schedule-visit'
          ? 'Once your email is confirmed, sign in to continue scheduling your visit for'
          : null

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link href="/" className="text-xl font-semibold tracking-tight text-foreground text-center">
            StayCraft
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>We sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
              {followUpMessage && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {followUpMessage}{' '}
                  {roomLocation ? `the room in ${roomLocation}` : `room #${roomId}`}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
