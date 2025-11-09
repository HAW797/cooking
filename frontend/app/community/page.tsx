"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Plus, Pencil, Trash2, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

interface CommunityRecipe {
  id: string
  title: string
  description: string
  image: string
  author: string
  authorId: string
  likes: number
  createdAt: string
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
    author: "Sarah Johnson",
    authorId: "1",
    likes: 156,
    createdAt: "2024-06-10",
    reactions: { heart: 156 },
  },
  {
    id: "c2",
    title: "Spicy Korean Fried Chicken",
    description: "Crispy double-fried chicken coated in a sweet and spicy gochujang glaze",
    image: "/korean-fried-chicken.jpg",
    author: "David Kim",
    authorId: "2",
    likes: 203,
    createdAt: "2024-06-12",
    reactions: { heart: 203 },
  },
  {
    id: "c3",
    title: "Mediterranean Quinoa Salad",
    description: "Fresh and healthy salad with quinoa, cucumbers, tomatoes, feta, and lemon dressing",
    image: "/quinoa-salad-mediterranean.jpg",
    author: "",
    authorId: "3",
    likes: 128,
    createdAt: "2024-06-14",
    reactions: { heart: 128 },
  },
  {
    id: "c4",
    title: "Homemade Ramen Bowl",
    description: "Rich pork broth with noodles, soft-boiled eggs, and traditional toppings",
    image: "/ramen-bowl-homemade.jpg",
    author: "Chef Takeshi",
    authorId: "4",
    likes: 287,
    createdAt: "2024-06-08",
    reactions: { heart: 287 },
  },
  {
    id: "c5",
    title: "Vegan Chocolate Brownies",
    description: "Fudgy and decadent brownies made without eggs or dairy",
    image: "/vegan-chocolate-brownies.jpg",
    author: "Lisa Green",
    authorId: "5",
    likes: 94,
    createdAt: "2024-06-15",
    reactions: { heart: 94 },
  },
  {
    id: "c6",
    title: "Authentic Paella Valenciana",
    description: "Traditional Spanish rice dish with chicken, rabbit, and vegetables",
    image: "/paella-valenciana-spanish.jpg",
    author: "Carlos Rodriguez",
    authorId: "5",
    likes: 176,
    createdAt: "2024-06-11",
    reactions: { heart: 176 },
  },
]

export default function CommunityPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<CommunityRecipe | null>(null)
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string>("")

  // Fetch community posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/api/cookbook.php')
        
        console.log('API Response:', response)
        
        if (response.success && response.data?.items) {
          setRecipes(response.data.items)
          
          // Set user reactions based on API data
          const reactions: Record<string, boolean> = {}
          response.data.items.forEach((item: any) => {
            if (item.userLiked || item.user_liked) {
              reactions[item.id] = true
            }
          })
          setUserReactions(reactions)
        }
      } catch (error) {
        console.error('Error fetching community posts:', error)
        toast({
          title: "Error",
          description: "Failed to load community posts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [toast])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 500KB for base64)
      if (file.size > 500 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 500KB",
          variant: "destructive",
        })
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImageUrl(result)
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (recipe: CommunityRecipe) => {
    setEditingRecipe(recipe)
    setTitle(recipe.title)
    setDescription(recipe.description)
    setImageUrl(recipe.image)
    setModalOpen(true)
  }

  const handleDelete = async (recipeId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await apiClient.delete(`/api/cookbook.php?id=${recipeId}`)
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Post deleted successfully",
          })
          
          // Refresh the posts list
          const refreshResponse = await apiClient.get('/api/cookbook.php')
          if (refreshResponse.success && refreshResponse.data?.items) {
            setRecipes(refreshResponse.data.items)
          }
        }
      } catch (error) {
        console.error('Error deleting post:', error)
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive",
        })
      }
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
          description: "Post shared successfully!",
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link Copied",
          description: "Post link copied to clipboard!",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const postData = {
        title,
        description,
        image_url: imageUrl || "/placeholder-recipe.jpg",
      }

      if (editingRecipe) {
        // Update existing post
        const response = await apiClient.put(`/api/cookbook.php?id=${editingRecipe.id}`, postData)
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Your post has been updated!",
          })
          
          // Refresh the posts list
          const refreshResponse = await apiClient.get('/api/cookbook.php')
          if (refreshResponse.success && refreshResponse.data?.items) {
            setRecipes(refreshResponse.data.items)
          }
        }
      } else {
        // Create new post
        const response = await apiClient.post('/api/cookbook.php', postData)
        
        if (response.success) {
          toast({
            title: "Success",
            description: "Your post has been shared with the community!",
          })
          
          // Refresh the posts list
          const refreshResponse = await apiClient.get('/api/cookbook.php')
          if (refreshResponse.success && refreshResponse.data?.items) {
            setRecipes(refreshResponse.data.items)
          }
        }
      }

      setModalOpen(false)
      setEditingRecipe(null)
      setTitle("")
      setDescription("")
      setImageUrl("")
      setImagePreview("")
    } catch (error) {
      console.error('Error saving post:', error)
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleModalClose = (open: boolean) => {
    setModalOpen(open)
    if (!open) {
      setEditingRecipe(null)
      setTitle("")
      setDescription("")
      setImageUrl("")
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
                    Share your culinary experiences with fellow food enthusiasts and discover amazing content from our
                    community members.
                  </p>
                </div>
                <Button onClick={() => setModalOpen(true)} size="lg" className="shrink-0">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Post
                </Button>
              </div>
            </div>
          </section>

          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-6">
                <p className="text-muted-foreground">{recipes.length} community posts</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                    <p className="mt-4 text-muted-foreground">Loading posts...</p>
                  </div>
                </div>
              ) : recipes.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
                </div>
              ) : (
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
              )}
            </div>
          </section>
        </main>

        <Footer />

        <Dialog open={modalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecipe ? "Edit Post" : "Create Post"}</DialogTitle>
              <DialogDescription>
                {editingRecipe
                  ? "Update your post details below."
                  : "Share your culinary experience with the FoodFusion community. Fill in the details below."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Post Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., My Cooking Adventure"
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
                    placeholder="Share your thoughts, experiences, or story..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUpload">Image (optional)</Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">Maximum file size: 500KB. Use compressed images for best results.</p>
                  {imagePreview && (
                    <div className="mt-4 relative w-full h-48 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => handleModalClose(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingRecipe ? "Update Post" : "Create Post"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
