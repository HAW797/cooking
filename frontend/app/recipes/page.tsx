"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Clock, Users, Search, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { recipesService } from "@/lib/api/recipes.service"
import { lookupsService } from "@/lib/api/lookups.service"
import type { Recipe } from "@/lib/api/recipes.service"
import type { Cuisine, Dietary, Difficulty } from "@/lib/api/lookups.service"

// Helper to transform API recipe to display format
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
  rating: number
  reviews: number
}

function transformRecipe(recipe: Recipe): DisplayRecipe {
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
    rating: recipe.rating?.average_rating || 0,
    reviews: recipe.rating?.rating_count || 0,
  }
}

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [cuisineFilter, setCuisineFilter] = useState<string>("all")
  const [dietaryFilter, setDietaryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  
  const [recipes, setRecipes] = useState<DisplayRecipe[]>([])
  const [cuisines, setCuisines] = useState<Cuisine[]>([])
  const [dietaryOptions, setDietaryOptions] = useState<Dietary[]>([])
  const [difficulties, setDifficulties] = useState<Difficulty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch recipes and lookups
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch recipes and lookups in parallel
        const [recipesResponse, lookupsResponse] = await Promise.all([
          recipesService.getRecipes(),
          lookupsService.getLookups(),
        ])

        if (recipesResponse.success && recipesResponse.data) {
          const transformedRecipes = recipesResponse.data.items.map(transformRecipe)
          setRecipes(transformedRecipes)
        } else {
          setError(recipesResponse.message || "Failed to fetch recipes")
        }

        if (lookupsResponse.success && lookupsResponse.data) {
          setCuisines(lookupsResponse.data.cuisines)
          setDietaryOptions(lookupsResponse.data.dietaries)
          setDifficulties(lookupsResponse.data.difficulties)
        }
      } catch (err) {
        console.error("Error fetching recipes:", err)
        setError("Failed to load recipes. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        searchQuery === "" ||
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCuisine = cuisineFilter === "all" || recipe.cuisine === cuisineFilter

      const matchesDietary = 
        dietaryFilter === "all" || 
        recipe.dietary.some(diet => diet === dietaryFilter)

      const matchesDifficulty = difficultyFilter === "all" || recipe.difficulty === difficultyFilter

      return matchesSearch && matchesCuisine && matchesDietary && matchesDifficulty
    })
  }, [recipes, searchQuery, cuisineFilter, dietaryFilter, difficultyFilter])

  const resetFilters = () => {
    setSearchQuery("")
    setCuisineFilter("all")
    setDietaryFilter("all")
    setDifficultyFilter("all")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Recipes</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explore our extensive collection of recipes from around the world. Filter by cuisine, dietary preferences,
              and difficulty level to find your perfect dish.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="pb-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Cuisine Filter */}
              <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {cuisineFilter === "all" ? "All Cuisines" : cuisineFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine.cuisine_type_id} value={cuisine.cuisine_name}>
                      {cuisine.cuisine_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dietary Filter */}
              <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {dietaryFilter === "all" ? "All Dietary" : dietaryFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dietary</SelectItem>
                  {dietaryOptions.map((option) => (
                    <SelectItem key={option.dietary_id} value={option.dietary_name}>
                      {option.dietary_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {difficultyFilter === "all" ? "All Levels" : difficultyFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters & Reset */}
            {(searchQuery || cuisineFilter !== "all" || dietaryFilter !== "all" || difficultyFilter !== "all") && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && <Badge variant="secondary">Search: {searchQuery}</Badge>}
                {cuisineFilter !== "all" && <Badge variant="secondary">Cuisine: {cuisineFilter}</Badge>}
                {dietaryFilter !== "all" && <Badge variant="secondary">Dietary: {dietaryFilter}</Badge>}
                {difficultyFilter !== "all" && <Badge variant="secondary">Difficulty: {difficultyFilter}</Badge>}
                <Button onClick={resetFilters} variant="ghost" size="sm">
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading recipes...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-lg text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    Showing {filteredRecipes.length} of {recipes.length} recipes
                  </p>
                </div>

                {filteredRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground mb-4">No recipes found matching your filters.</p>
                    <Button onClick={resetFilters} variant="outline">
                      Clear filters
                    </Button>
                  </div>
                ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="relative h-56 w-full">
                        <Image
                          src={recipe.image || "/placeholder.svg"}
                          alt={recipe.title}
                          fill
                          className="object-cover -pt-6"
                        />
                        <div className="absolute top-3 right-3">
                          <Badge
                            variant={recipe.difficulty === "Easy" ? "secondary" : "default"}
                            className="bg-primary/90 backdrop-blur"
                          >
                            {recipe.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl text-balance">{recipe.title}</CardTitle>
                        <CardDescription className="leading-relaxed">{recipe.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{recipe.cookTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings} servings</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{recipe.cuisine}</Badge>
                            {recipe.dietary.map((diet) => (
                              <Badge key={diet} variant="outline">
                                {diet}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
