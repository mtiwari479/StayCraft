'use client'

import { Suspense, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isAppRole, type AppRole } from '@/lib/auth/roles'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SignUpPageFallback() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading sign-up...
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function roleLabel(role: AppRole) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const roomId = searchParams.get('roomId')
  const roomLocation = searchParams.get('location')
  const intent = searchParams.get('intent')
  const returnTo = searchParams.get('returnTo')
  const roleParam = searchParams.get('role')
  const selectedRole = isAppRole(roleParam) ? roleParam : null

  const buildRoleHref = (role: AppRole) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('role', role)
    return `/auth/sign-up?${params.toString()}`
  }

  const loginHref = useMemo(() => {
    const query = searchParams.toString()
    return query ? `/auth/login?${query}` : '/auth/login'
  }, [searchParams])

  const signUpSuccessHref = useMemo(() => {
    const query = searchParams.toString()
    return query ? `/auth/sign-up-sucess?${query}` : '/auth/sign-up-sucess'
  }, [searchParams])

  const intentTitle =
    intent === 'book-room' || intent === 'room-enquiry' || intent === 'schedule-visit'
      ? 'Create your account'
      : selectedRole
        ? `Create ${roleLabel(selectedRole)} account`
        : 'Create an account'

  const intentDescription =
    intent === 'book-room'
      ? `Sign up to continue booking ${
          roomLocation
            ? `the room in ${roomLocation}`
            : roomId
              ? `room #${roomId}`
              : 'your selected room'
        }.`
      : intent === 'room-enquiry'
        ? `Sign up to continue your enquiry for ${
            roomLocation
              ? `the room in ${roomLocation}`
              : roomId
                ? `room #${roomId}`
                : 'your selected room'
          }.`
        : intent === 'schedule-visit'
          ? `Sign up to schedule a visit for ${
              roomLocation
                ? `the room in ${roomLocation}`
                : roomId
                  ? `room #${roomId}`
                  : 'your selected room'
            }.`
          : selectedRole
            ? `Sign up as ${roleLabel(selectedRole)}.`
            : 'Enter your details to get started'

  const showRolePicker = !selectedRole && !intent

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: selectedRole ? { preferred_role: selectedRole } : undefined,
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback${
                  returnTo ? `?next=${encodeURIComponent(returnTo)}` : ''
                }`
              : undefined,
        },
      })

      if (error) {
        throw error
      }

      router.push(signUpSuccessHref)
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (showRolePicker) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="text-center text-xl font-semibold tracking-tight text-foreground"
            >
              StayCraft
            </Link>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Choose your sign-up role</CardTitle>
                <CardDescription>
                  Pick your account type, then continue creating your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href={buildRoleHref('admin')}>Admin</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={buildRoleHref('owner')}>Owner</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={buildRoleHref('tenant')}>Tenant</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link
            href="/"
            className="text-center text-xl font-semibold tracking-tight text-foreground"
          >
            StayCraft
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{intentTitle}</CardTitle>
              <CardDescription>{intentDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Confirm Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <div className="rounded bg-red-100 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Sign up'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href={loginHref}
                    className="text-foreground underline underline-offset-4"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpPageFallback />}>
      <SignUpForm />
    </Suspense>
  )
}