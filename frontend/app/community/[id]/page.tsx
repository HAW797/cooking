"use client"

import { use, useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CommunityRecipeDetail } from "@/components/community-recipe-detail"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"

export default function CommunityRecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/api/cookbook.php')
        
        if (response.success && response.data?.items) {
          const foundRecipe = response.data.items.find((r: any) => r.id.toString() === resolvedParams.id)
          setRecipe(foundRecipe || null)
        }
      } catch (error) {
        console.error('Error fetching recipe:', error)
        toast({
          title: "Error",
          description: "Failed to load recipe",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [resolvedParams.id, toast])

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </main>
          <Footer />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col">
        <Header />
        <CommunityRecipeDetail recipe={recipe} />
        <Footer />
      </div>
    </AuthGuard>
  )
}
