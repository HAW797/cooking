"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { featuredRecipes } from "@/lib/mock-data"
import { ChevronLeft, ChevronRight, Clock, ChefHat } from "lucide-react"
import Image from "next/image"

export function RecipeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredRecipes.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredRecipes.length) % featuredRecipes.length)
  }

  const visibleRecipes = [
    featuredRecipes[currentIndex],
    featuredRecipes[(currentIndex + 1) % featuredRecipes.length],
    featuredRecipes[(currentIndex + 2) % featuredRecipes.length],
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Featured Recipes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover our handpicked selection of delicious recipes from around the world
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleRecipes.map((recipe, idx) => (
              <Card key={`${recipe.id}-${idx}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64 w-full">
                  <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-balance">{recipe.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{recipe.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.cookTime}</span>
                    </div>
                    <Badge variant={recipe.difficulty === "Easy" ? "secondary" : "default"}>
                      <ChefHat className="h-3 w-3 mr-1" />
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button onClick={prevSlide} variant="outline" size="icon" aria-label="Previous recipe">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={nextSlide} variant="outline" size="icon" aria-label="Next recipe">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {featuredRecipes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
