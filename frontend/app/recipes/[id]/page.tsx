import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { recipes } from "@/lib/mock-data"
import { Clock, ChefHat, Users, Star, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return recipes.map((recipe) => ({
    id: recipe.id,
  }))
}

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const recipe = recipes.find((r) => r.id === params.id)

  if (!recipe) {
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

              <div>
                <p className="text-sm text-muted-foreground">
                  Recipe by <span className="font-medium text-foreground">{recipe.author}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Ingredients & Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="leading-relaxed">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
