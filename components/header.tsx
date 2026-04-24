"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      setIsMenuOpen(false)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
            StayCraft
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#rooms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Rooms
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How it Works
            </Link>
            <Link href="#for-owners" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              For Owners
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/auth/sign-up">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <button
            className="p-2 text-foreground md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-4 px-6 py-4">
            <Link href="#rooms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Rooms
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How it Works
            </Link>
            <Link href="#for-owners" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              For Owners
            </Link>
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <p className="px-2 text-xs text-muted-foreground">{user.email}</p>
                      <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start"
                        onClick={handleLogout}
                      >
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          Log in
                        </Button>
                      </Link>
                      <Link href="/auth/sign-up">
                        <Button size="sm" className="w-full">
                          Apply Now
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}