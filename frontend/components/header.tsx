"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, ChefHat, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth-modal"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const { isAuthenticated, user, logout, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="/recipes" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Recipes
            </Link>
            {mounted && isAuthenticated && (
              <Link
                href="/community"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Community Cookbook
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors outline-none">
                Resources
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem asChild>
                  <Link href="/resources" className="cursor-pointer">
              Culinary Resources
            </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/educational-resources" className="cursor-pointer">
              Educational Resources
            </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {!mounted || loading ? (
              <div className="w-[140px] h-9" />
            ) : isAuthenticated ? (
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
                Recipes
              </Link>
              {mounted && isAuthenticated && (
                <Link
                  href="/community"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Community Cookbook
                </Link>
              )}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Resources</div>
              <Link
                href="/resources"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors pl-4 block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Culinary Resources
              </Link>
              <Link
                href="/educational-resources"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors pl-4 block"
                onClick={() => setMobileMenuOpen(false)}
              >
                Educational Resources
              </Link>
              </div>
              <Link
                href="/contact"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {!mounted || loading ? (
                  <div className="w-full h-9" />
                ) : isAuthenticated ? (
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
