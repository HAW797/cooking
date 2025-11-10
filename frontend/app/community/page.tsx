"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Plus, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { AuthGuard } from "@/components/auth-guard"

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

export default function CommunityPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [userReactions, setUserReactions] = useState<Record<string, boolean>>({})
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/api/cookbook.php')
        
        if (response.success && response.data?.items) {
          setRecipes(response.data.items)
          
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
      if (file.size > 500 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 500KB",
          variant: "destructive",
        })
        return
      }

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

  const handleReaction = async (recipeId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like posts",
        variant: "destructive",
      })
      return
    }

    const hasReacted = userReactions[recipeId]

    try {
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

      const response = await apiClient.post(`/api/cookbook_like.php?id=${recipeId}`)
      
      if (!response.success) {
        setRecipes(
          recipes.map((r) => {
            if (r.id === recipeId) {
              return {
                ...r,
                reactions: {
                  heart: hasReacted ? r.reactions.heart + 1 : r.reactions.heart - 1,
                },
              }
            }
            return r
          }),
        )

        setUserReactions({
          ...userReactions,
          [recipeId]: hasReacted,
        })

        toast({
          title: "Error",
          description: "Failed to update reaction. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setRecipes(
        recipes.map((r) => {
          if (r.id === recipeId) {
            return {
              ...r,
              reactions: {
                heart: hasReacted ? r.reactions.heart + 1 : r.reactions.heart - 1,
              },
            }
          }
          return r
        }),
      )

      setUserReactions({
        ...userReactions,
        [recipeId]: hasReacted,
      })

      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (recipe: CommunityRecipe) => {
    if (isSharing) return
    
    const shareUrl = `${window.location.origin}/community/${recipe.id}`

    try {
      setIsSharing(true)
      
      const shareData = {
        title: recipe.title,
        url: shareUrl,
      }
      
      if (navigator.share && navigator.canShare(shareData)) {
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
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast({
          title: "Link Copied",
          description: "Post link copied to clipboard!",
        })
        try {
          await navigator.clipboard.writeText(shareUrl)
        } catch (clipboardError) {
          window.prompt("Copy this link:", shareUrl)
        }
      }
    } finally {
      setIsSharing(false)
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
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create posts",
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
      
      const response = await apiClient.post('/api/cookbook.php', postData)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Your post has been shared with the community!",
        })
        const refreshResponse = await apiClient.get('/api/cookbook.php')
        if (refreshResponse.success && refreshResponse.data?.items) {
          setRecipes(refreshResponse.data.items)
        }
        
        setModalOpen(false)
        setTitle("")
        setDescription("")
        setImageUrl("")
        setImagePreview("")
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create post",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      let errorMessage = "Failed to save post. Please try again."
      
      if (error?.status === 401) {
        errorMessage = "You must be logged in to create posts. Please log in and try again."
      } else if (error?.status === 413) {
        errorMessage = "Image is too large. Please use a smaller image."
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleModalClose = (open: boolean) => {
    setModalOpen(open)
    if (!open) {
      setTitle("")
      setDescription("")
      setImageUrl("")
      setImagePreview("")
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
                  <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow relative pt-0">
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleShare(recipe)} 
                          disabled={isSharing}
                          className="ml-auto"
                        >
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
              <DialogTitle>Create Post</DialogTitle>
              <DialogDescription>
                Share your culinary experience with the FoodFusion community. Fill in the details below.
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
                  Create Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
