"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-semibold tracking-tight text-foreground">
            StayCraft
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#rooms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Rooms
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="#for-owners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              For Owners
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleLogout}
                    >
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
                      <Button size="sm">
                        Apply Now
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <nav className="flex flex-col px-6 py-4 gap-4">
            <Link href="#rooms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Rooms
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="#for-owners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              For Owners
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <p className="text-xs text-muted-foreground px-2">
                        {user.email}
                      </p>
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