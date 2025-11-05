"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { recipes } from "@/lib/mock-data"
import { Clock, Users, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [cuisineFilter, setCuisineFilter] = useState<string>("all")
  const [dietaryFilter, setDietaryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")

  // Extract unique values for filters
  const cuisines = useMemo(() => {
    const uniqueCuisines = Array.from(new Set(recipes.map((r) => r.cuisine)))
    return uniqueCuisines.sort()
  }, [])

  const dietaryOptions = useMemo(() => {
    const allDietary = recipes.flatMap((r) => r.dietary)
    return Array.from(new Set(allDietary)).sort()
  }, [])

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch =
        searchQuery === "" ||
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCuisine = cuisineFilter === "all" || recipe.cuisine === cuisineFilter

      const matchesDietary = dietaryFilter === "all" || recipe.dietary.includes(dietaryFilter)

      const matchesDifficulty = difficultyFilter === "all" || recipe.difficulty === difficultyFilter

      return matchesSearch && matchesCuisine && matchesDietary && matchesDifficulty
    })
  }, [searchQuery, cuisineFilter, dietaryFilter, difficultyFilter])

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
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Recipe Collection</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explore our extensive collection of recipes from around the world. Filter by cuisine, dietary preferences,
              and difficulty level to find your perfect dish.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 border-b border-border">
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
                <SelectTrigger>
                  <SelectValue placeholder="Cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cuisines</SelectItem>
                  {cuisines.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dietary Filter */}
              <Select value={dietaryFilter} onValueChange={setDietaryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Dietary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dietary</SelectItem>
                  {dietaryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
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
                  <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-56 w-full">
                      <Image
                        src={recipe.image || "/placeholder.svg"}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={recipe.difficulty === "Easy" ? "secondary" : "default"}
                          className="bg-background/90 backdrop-blur"
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
                        <Button asChild className="w-full">
                          <Link href={`/recipes/${recipe.id}`}>View Recipe</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
