"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const { isAuthenticated, user, logout } = useAuth()

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <ChefHat className="h-8 w-8" />
            <span>FoodFusion</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/recipes" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Recipe Collection
            </Link>
            {isAuthenticated && (
              <Link
                href="/community"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Community Cookbook
              </Link>
            )}
            <Link
              href="/resources"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Culinary Resources
            </Link>
            <Link
              href="/educational-resources"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Educational Resources
            </Link>
            <Link href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {user?.firstName}</span>
                <Button onClick={logout} variant="outline" size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => openAuthModal("login")} variant="outline" size="sm">
                  Login
                </Button>
                <Button onClick={() => openAuthModal("register")} size="sm">
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
              <Link
                href="/"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/recipes"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recipe Collection
              </Link>
              {isAuthenticated && (
                <Link
                  href="/community"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Community Cookbook
                </Link>
              )}
              <Link
                href="/resources"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Culinary Resources
              </Link>
              <Link
                href="/educational-resources"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Educational Resources
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <span className="text-sm text-muted-foreground">Welcome, {user?.firstName}</span>
                    <Button onClick={logout} variant="outline" size="sm" className="w-full bg-transparent">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => openAuthModal("login")} variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                    <Button onClick={() => openAuthModal("register")} size="sm" className="w-full">
                      Register
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} mode={authMode} setMode={setAuthMode} />
    </>
  )
}
