"use client"

import { useState, useEffect, use } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, Users, Star, ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { recipesService } from "@/lib/api/recipes.service"
import type { Recipe } from "@/lib/api/recipes.service"

interface DisplayRecipe {
  id: string
  title: string
  description: string
  image: string
  cookTime: string
  prepTime: string
  servings: number
  difficulty: string
  cuisine: string
  dietary: string[]
  ingredients: string[]
  instructions: string[]
  rating: number
  reviews: number
}

function transformRecipe(recipe: Recipe): DisplayRecipe {
  // Parse instructions from text to array
  const instructions = recipe.instructions
    ? recipe.instructions.split("\n").filter((line) => line.trim() !== "")
    : []

  return {
    id: recipe.recipe_id.toString(),
    title: recipe.recipe_title,
    description: recipe.description || "",
    image: recipe.image_url || "/placeholder.svg",
    cookTime: recipe.cook_time ? `${recipe.cook_time} mins` : "N/A",
    prepTime: recipe.prep_time ? `${recipe.prep_time} mins` : "N/A",
    servings: recipe.servings || 0,
    difficulty: recipe.difficulty?.difficulty_level || "Medium",
    cuisine: recipe.cuisine?.cuisine_name || "Unknown",
    dietary: recipe.dietary?.dietary_name ? [recipe.dietary.dietary_name] : [],
    ingredients: [], // Not available in current schema
    instructions,
    rating: recipe.rating?.average_rating || 0,
    reviews: recipe.rating?.rating_count || 0,
  }
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [recipe, setRecipe] = useState<DisplayRecipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true)
        setError(null)

        const response = await recipesService.getRecipeById(parseInt(resolvedParams.id))

        if (response.success && response.data) {
          setRecipe(transformRecipe(response.data))
        } else {
          setError(response.message || "Failed to fetch recipe")
        }
      } catch (err) {
        console.error("Error fetching recipe:", err)
        setError("Failed to load recipe. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading recipe...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !recipe) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/recipes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative h-96 lg:h-full rounded-lg overflow-hidden">
              <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
            </div>

            {/* Recipe Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">{recipe.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">{recipe.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold text-lg">{recipe.rating}</span>
                </div>
                <span className="text-muted-foreground">({recipe.reviews} reviews)</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{recipe.cuisine}</Badge>
                <Badge variant="secondary">{recipe.difficulty}</Badge>
                {recipe.dietary.map((diet) => (
                  <Badge key={diet} variant="outline">
                    {diet}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Prep Time</p>
                    <p className="font-semibold">{recipe.prepTime}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <ChefHat className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Cook Time</p>
                    <p className="font-semibold">{recipe.cookTime}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Servings</p>
                    <p className="font-semibold">{recipe.servings}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Ingredients & Instructions */}
          <div className="grid grid-cols-1 gap-8 mt-12">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                {recipe.instructions.length > 0 ? (
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed pt-0.5">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground">No instructions available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
