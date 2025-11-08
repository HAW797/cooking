"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type Recipe = {
  id: string
  title: string
  description: string
  image: string
  cookTime: string
  servings: number
  author: string
  likes: number
  instructions: string[]
}

export function CommunityRecipeDetail({ recipe }: { recipe: Recipe | undefined }) {
  if (!recipe) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <Button asChild>
            <Link href="/community">Back to Community</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/community">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Link>
        </Button>

        {/* Recipe Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">{recipe.title}</h1>
              <p className="text-muted-foreground">
                Shared by <span className="font-medium text-foreground">{recipe.author}</span>
              </p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">{recipe.description}</p>
        </div>

        {/* Recipe Image */}
        <div className="relative h-96 w-full rounded-lg overflow-hidden mb-8">
          <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
        </div>

        {/* Recipe Meta - Removed difficulty and cuisine cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Cook Time</span>
              </div>
              <p className="text-lg font-semibold">{recipe.cookTime}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Servings</span>
              </div>
              <p className="text-lg font-semibold">{recipe.servings}</p>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>Step-by-step guide to prepare this dish</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                    {index + 1}
                  </span>
                  <p className="leading-relaxed pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
