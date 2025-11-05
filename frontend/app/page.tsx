"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CookieConsent } from "@/components/cookie-consent"
import { JoinUsModal } from "@/components/join-us-modal"
import { NewsFeed } from "@/components/news-feed"
import { RecipeCarousel } from "@/components/recipe-carousel"
import { Button } from "@/components/ui/button"
import { ChefHat, Users, BookOpen, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth-modal"

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleJoinCommunity = () => {
    if (isAuthenticated) {
      router.push("/community")
    } else {
      setAuthModalOpen(true)
    }
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src="/cooking-kitchen-food-prep.png"
              alt="Hero background"
              fill
              className="object-cover opacity-10"
            />
          </div>
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                Welcome to <span className="text-primary">FoodFusion</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Your central hub for discovering delicious recipes, sharing cooking experiences, and connecting with
                food enthusiasts from around the world
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/recipes">Explore Recipes</Link>
                </Button>
                <Button size="lg" variant="outline" onClick={handleJoinCommunity}>
                  {mounted && isAuthenticated ? "Explore Community" : "Join Community"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <ChefHat className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Expert Recipes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Curated collection of recipes from professional chefs and home cooks
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Active Community</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Connect with fellow food lovers and share your culinary creations
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Learning Resources</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Access cooking techniques, tips, and culinary knowledge
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Quality Content</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every recipe is tested and reviewed by our community
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recipe Carousel */}
        <RecipeCarousel />

        {/* News Feed */}
        <NewsFeed />

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-balance">Ready to Start Your Culinary Journey?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
              Join thousands of food enthusiasts sharing recipes, tips, and cooking experiences
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/recipes">Get Started Today</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <CookieConsent />
      <JoinUsModal />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} mode="register" />
    </div>
  )
}
