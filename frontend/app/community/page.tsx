"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Clock, Users, Plus, X, Pencil, Trash2, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CommunityRecipe {
  id: string
  title: string
  description: string
  image: string
  prepTime?: string
  cookTime: string
  servings: number
  author: string
  authorId: string
  likes: number
  createdAt: string
  instructions?: string[]
  reactions: {
    heart: number
  }
}

const initialRecipes: CommunityRecipe[] = [
  {
    id: "c1",
    title: "Grandma's Apple Pie",
    description: "A family recipe passed down through generations with a flaky crust and cinnamon-spiced apples",
    image: "/apple-pie-homemade.jpg",
    cookTime: "60 mins",
    servings: 8,
    author: "Sarah Johnson",
    authorId: "user1",
    likes: 156,
    createdAt: "2024-06-10",
    instructions: [
      "Preheat oven to 375°F",
      "Mix apples with sugar, flour, and cinnamon",
      "Place in pie crust",
      "Bake for 50-60 minutes",
    ],
    reactions: { heart: 156 },
  },
  {
    id: "c2",
    title: "Spicy Korean Fried Chicken",
    description: "Crispy double-fried chicken coated in a sweet and spicy gochujang glaze",
    image: "/korean-fried-chicken.jpg",
    cookTime: "45 mins",
    servings: 4,
    author: "David Kim",
    authorId: "user2",
    likes: 203,
    createdAt: "2024-06-12",
    instructions: [
      "Coat chicken in flour mixture",
      "Fry at 350°F for 10 minutes",
      "Rest, then fry again at 375°F",
      "Toss in gochujang glaze",
    ],
    reactions: { heart: 203 },
  },
  {
    id: "c3",
    title: "Mediterranean Quinoa Salad",
    description: "Fresh and healthy salad with quinoa, cucumbers, tomatoes, feta, and lemon dressing",
    image: "/quinoa-salad-mediterranean.jpg",
    cookTime: "20 mins",
    servings: 6,
    author: "Elena Martinez",
    authorId: "user3",
    likes: 128,
    createdAt: "2024-06-14",
    instructions: [
      "Cook quinoa according to package",
      "Dice vegetables",
      "Mix all ingredients",
      "Dress with lemon juice and olive oil",
    ],
    reactions: { heart: 128 },
  },
  {
    id: "c4",
    title: "Homemade Ramen Bowl",
    description: "Rich pork broth with noodles, soft-boiled eggs, and traditional toppings",
    image: "/ramen-bowl-homemade.jpg",
    cookTime: "120 mins",
    servings: 4,
    author: "Chef Takeshi",
    authorId: "user4",
    likes: 287,
    createdAt: "2024-06-08",
    instructions: [
      "Simmer pork bones for 8 hours",
      "Cook noodles separately",
      "Prepare toppings",
      "Assemble bowl with broth and toppings",
    ],
    reactions: { heart: 287 },
  },
  {
    id: "c5",
    title: "Vegan Chocolate Brownies",
    description: "Fudgy and decadent brownies made without eggs or dairy",
    image: "/vegan-chocolate-brownies.jpg",
    cookTime: "30 mins",
    servings: 12,
    author: "Lisa Green",
    authorId: "user5",
    likes: 94,
    createdAt: "2024-06-15",
    instructions: ["Preheat oven to 350°F", "Mix dry ingredients", "Add wet ingredients", "Bake for 25-30 minutes"],
    reactions: { heart: 94 },
  },
  {
    id: "c6",
    title: "Authentic Paella Valenciana",
    description: "Traditional Spanish rice dish with chicken, rabbit, and vegetables",
    image: "/paella-valenciana-spanish.jpg",
    cookTime: "90 mins",
    servings: 6,
    author: "Carlos Rodriguez",
    authorId: "user6",
    likes: 176,
    createdAt: "2024-06-11",
    instructions: [
      "Brown meats in paella pan",
      "Add vegetables and rice",
      "Add broth with saffron",
      "Cook until rice is tender",
    ],
    reactions: { heart: 176 },
  },
]

export default function CommunityPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [recipes, setRecipes] = useState<CommunityRecipe[]>(initialRecipes)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<CommunityRecipe | null>(null)
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})
  const [instructions, setInstructions] = useState<string[]>([""])
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [prepTime, setPrepTime] = useState<string>("")
  const [cookTime, setCookTime] = useState<string>("")
  const [servings, setServings] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")

  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions]
    newInstructions[index] = value
    setInstructions(newInstructions)
  }

  const handleEdit = (recipe: CommunityRecipe) => {
    setEditingRecipe(recipe)
    setTitle(recipe.title)
    setDescription(recipe.description)
    setPrepTime(recipe.prepTime || "")
    setCookTime(recipe.cookTime)
    setServings(recipe.servings.toString())
    setImageUrl(recipe.image)
    setInstructions(recipe.instructions || [""])
    setModalOpen(true)
  }

  const handleDelete = (recipeId: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      setRecipes(recipes.filter((r) => r.id !== recipeId))
      toast({
        title: "Success",
        description: "Recipe deleted successfully",
      })
    }
  }

  const handleReaction = (recipeId: string) => {
    const hasReacted = userReactions[recipeId]

    setRecipes(
      recipes.map((r) => {
        if (r.id === recipeId) {
          return {
            ...r,
            reactions: {
              heart: hasReacted ? r.reactions.heart - 1 : r.reactions.heart + 1,
            },
          }
        }
        return r
      }),
    )

    setUserReactions({
      ...userReactions,
      [recipeId]: !hasReacted,
    })
  }

  const handleShare = async (recipe: CommunityRecipe) => {
    const shareUrl = `${window.location.origin}/community/${recipe.id}`
    const shareData = {
      title: recipe.title,
      text: recipe.description,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast({
          title: "Success",
          description: "Recipe shared successfully!",
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link Copied",
          description: "Recipe link copied to clipboard!",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description || !cookTime || !servings) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const filteredInstructions = instructions.filter((inst) => inst.trim() !== "")

    if (filteredInstructions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one instruction",
        variant: "destructive",
      })
      return
    }

    if (editingRecipe) {
      const updatedRecipe: CommunityRecipe = {
        ...editingRecipe,
        title,
        description,
        image: imageUrl || "/placeholder-recipe.jpg",
        prepTime: prepTime || undefined,
        cookTime,
        servings: Number.parseInt(servings),
        instructions: filteredInstructions,
      }

      setRecipes(recipes.map((r) => (r.id === editingRecipe.id ? updatedRecipe : r)))
      toast({
        title: "Success",
        description: "Your recipe has been updated!",
      })
    } else {
      const newRecipe: CommunityRecipe = {
        id: `c${Date.now()}`,
        title,
        description,
        image: imageUrl || "/placeholder-recipe.jpg",
        prepTime: prepTime || undefined,
        cookTime,
        servings: Number.parseInt(servings),
        author: user?.name || "Anonymous",
        authorId: user?.id.toString() || "unknown",
        likes: 0,
        createdAt: new Date().toISOString().split("T")[0],
        instructions: filteredInstructions,
        reactions: { heart: 0 },
      }

      setRecipes([newRecipe, ...recipes])
      toast({
        title: "Success",
        description: "Your recipe has been shared with the community!",
      })
    }

    setModalOpen(false)
    setEditingRecipe(null)

    setTitle("")
    setDescription("")
    setPrepTime("")
    setCookTime("")
    setServings("")
    setImageUrl("")
    setInstructions([""])
  }

  const handleModalClose = (open: boolean) => {
    setModalOpen(open)
    if (!open) {
      setEditingRecipe(null)
      setTitle("")
      setDescription("")
      setPrepTime("")
      setCookTime("")
      setServings("")
      setImageUrl("")
      setInstructions([""])
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <section className="py-10 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Community Cookbook</h1>
                  <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    Share your favorite recipes with fellow food enthusiasts and discover unique dishes from our
                    community members.
                  </p>
                </div>
                <Button onClick={() => setModalOpen(true)} size="lg" className="shrink-0">
                  <Plus className="mr-2 h-5 w-5" />
                  Share Recipe
                </Button>
              </div>
            </div>
          </section>

          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-6">
                <p className="text-muted-foreground">{recipes.length} community recipes</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                    {user?.id.toString() === recipe.authorId && (
                      <div className="absolute top-3 right-3 z-10 flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleEdit(recipe)}
                          className="h-8 w-8 shadow-md"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleDelete(recipe.id)}
                          className="h-8 w-8 shadow-md text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <Link href={`/community/${recipe.id}`}>
                      <div className="relative h-56 w-full">
                        <Image
                          src={recipe.image || "/placeholder.svg"}
                          alt={recipe.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl text-balance">
                        <Link href={`/community/${recipe.id}`} className="hover:text-primary transition-colors">
                          {recipe.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="leading-relaxed line-clamp-2">{recipe.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
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

                      <div className="text-sm text-muted-foreground">
                        by <span className="font-medium text-foreground">{recipe.author}</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(recipe.id)}
                          className={`flex items-center gap-1.5 ${userReactions[recipe.id] ? "text-red-500" : ""}`}
                        >
                          <span className="text-lg">{userReactions[recipe.id] ? "❤️" : "🤍"}</span>
                          <span className="text-sm font-medium">{recipe.reactions.heart}</span>
                        </Button>
                        <div className="flex-1" />
                        <Button variant="ghost" size="sm" onClick={() => handleShare(recipe)} className="ml-auto">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />

        <Dialog open={modalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecipe ? "Edit Recipe" : "Share Your Recipe"}</DialogTitle>
              <DialogDescription>
                {editingRecipe
                  ? "Update your recipe details below."
                  : "Share your favorite recipe with the FoodFusion community. Fill in the details below."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Recipe Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Grandma's Chocolate Chip Cookies"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your recipe..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Cooking Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (optional)</Label>
                    <Input
                      id="prepTime"
                      placeholder="e.g., 15 mins"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cookTime">
                      Cook Time <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cookTime"
                      placeholder="e.g., 30 mins"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servings">
                    Servings <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    placeholder="e.g., 4"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    Instructions <span className="text-destructive">*</span>
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  {instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="shrink-0 w-8 h-10 flex items-center justify-center bg-muted rounded text-sm font-medium">
                        {index + 1}
                      </div>
                      <Textarea
                        placeholder={`Step ${index + 1}`}
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      {instructions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInstruction(index)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => handleModalClose(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingRecipe ? "Update Recipe" : "Share Recipe"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
