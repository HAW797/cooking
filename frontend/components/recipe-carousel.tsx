"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, ChefHat, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { recipesService } from "@/lib/api/recipes.service"
import type { Recipe } from "@/lib/api/recipes.service"

interface FeaturedRecipe {
  id: string
  title: string
  description: string
  image: string
  cookTime: string
  difficulty: string
}

function transformRecipe(recipe: Recipe): FeaturedRecipe {
  return {
    id: recipe.recipe_id.toString(),
    title: recipe.recipe_title,
    description: recipe.description || "",
    image: recipe.image_url || "/placeholder.svg",
    cookTime: recipe.cook_time ? `${recipe.cook_time} mins` : "N/A",
    difficulty: recipe.difficulty?.difficulty_level || "Medium",
  }
}

export function RecipeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [recipes, setRecipes] = useState<FeaturedRecipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true)
        const response = await recipesService.getFeaturedRecipes()
        
        if (response.success && response.data) {
          const featuredRecipes = response.data.items.map(transformRecipe)
          setRecipes(featuredRecipes)
        }
      } catch (err) {
        console.error("Error fetching featured recipes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % recipes.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + recipes.length) % recipes.length)
  }

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading recipes...</span>
          </div>
        </div>
      </section>
    )
  }

  if (recipes.length === 0) {
    return null
  }

  const visibleRecipes = [
    recipes[currentIndex],
    recipes[(currentIndex + 1) % recipes.length],
    recipes[(currentIndex + 2) % recipes.length],
  ].filter(Boolean)

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
              <Link key={`${recipe.id}-${idx}`} href={`/recipes/${recipe.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="relative h-64 w-full">
                    <Image 
                      src={recipe.image || "/placeholder.svg"} 
                      alt={recipe.title} 
                      fill 
                      className="object-cover"
                      priority={idx === 0}
                    />
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
              </Link>
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
            {recipes.map((_, idx) => (
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
