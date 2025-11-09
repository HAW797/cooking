"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { CommunityRecipeDetail } from "@/components/community-recipe-detail"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

// Mock data kept as fallback
const communityRecipes = [
  {
    id: "c1",
    title: "Grandma's Apple Pie",
    description: "A family recipe passed down through generations with a flaky crust and cinnamon-spiced apples",
    image: "/apple-pie-homemade.jpg",
    cookTime: "60 mins",
    servings: 8,
    difficulty: "Medium",
    cuisine: "American",
    author: "Sarah Johnson",
    likes: 156,
    ingredients: [
      "6 cups sliced apples (Granny Smith or Honeycrisp)",
      "3/4 cup granulated sugar",
      "2 tablespoons all-purpose flour",
      "1 teaspoon ground cinnamon",
      "1/4 teaspoon ground nutmeg",
      "2 tablespoons butter",
      "1 package refrigerated pie crusts (2 crusts)",
      "1 egg (for egg wash)",
    ],
    instructions: [
      "Preheat your oven to 375°F (190°C).",
      "In a large bowl, combine sliced apples, sugar, flour, cinnamon, and nutmeg. Mix well.",
      "Roll out one pie crust and place it in a 9-inch pie dish.",
      "Pour the apple mixture into the crust and dot with butter.",
      "Cover with the second crust, seal edges, and cut slits in the top for ventilation.",
      "Brush the top with beaten egg for a golden finish.",
      "Bake for 50-60 minutes until the crust is golden and filling is bubbly.",
      "Let cool for at least 2 hours before serving.",
    ],
  },
  {
    id: "c2",
    title: "Spicy Korean Fried Chicken",
    description: "Crispy double-fried chicken coated in a sweet and spicy gochujang glaze",
    image: "/korean-fried-chicken.jpg",
    cookTime: "45 mins",
    servings: 4,
    difficulty: "Hard",
    cuisine: "Korean",
    author: "David Kim",
    likes: 203,
    ingredients: [
      "2 lbs chicken wings",
      "1 cup all-purpose flour",
      "1/2 cup cornstarch",
      "1 teaspoon salt",
      "1/2 teaspoon black pepper",
      "3 tablespoons gochujang (Korean chili paste)",
      "2 tablespoons honey",
      "1 tablespoon soy sauce",
      "2 cloves garlic, minced",
      "Vegetable oil for frying",
    ],
    instructions: [
      "Pat chicken wings dry with paper towels.",
      "Mix flour, cornstarch, salt, and pepper in a large bowl.",
      "Coat chicken wings thoroughly in the flour mixture.",
      "Heat oil to 350°F and fry wings for 10 minutes. Remove and let rest for 5 minutes.",
      "Increase oil temperature to 375°F and fry wings again for 5-7 minutes until extra crispy.",
      "While wings are resting, make the sauce by mixing gochujang, honey, soy sauce, and garlic.",
      "Toss the hot wings in the sauce until evenly coated.",
      "Serve immediately with sesame seeds and green onions.",
    ],
  },
  {
    id: "c3",
    title: "Mediterranean Quinoa Salad",
    description: "Fresh and healthy salad with quinoa, cucumbers, tomatoes, feta, and lemon dressing",
    image: "/quinoa-salad-mediterranean.jpg",
    cookTime: "20 mins",
    servings: 6,
    difficulty: "Easy",
    cuisine: "Mediterranean",
    author: "Elena Martinez",
    likes: 128,
    ingredients: [
      "2 cups cooked quinoa",
      "1 cucumber, diced",
      "2 tomatoes, diced",
      "1 cup crumbled feta cheese",
      "1/4 cup fresh parsley, chopped",
      "1/4 cup olive oil",
      "Juice of 2 lemons",
      "Salt and pepper to taste",
    ],
    instructions: [
      "Cook quinoa according to package directions and let cool.",
      "Dice cucumber and tomatoes into bite-sized pieces.",
      "In a large bowl, combine quinoa, cucumber, tomatoes, feta, and parsley.",
      "In a small bowl, whisk together olive oil, lemon juice, salt, and pepper.",
      "Pour dressing over salad and toss gently to combine.",
      "Refrigerate for at least 30 minutes before serving to let flavors meld.",
    ],
  },
  {
    id: "c4",
    title: "Homemade Ramen Bowl",
    description: "Rich pork broth with noodles, soft-boiled eggs, and traditional toppings",
    image: "/ramen-bowl-homemade.jpg",
    cookTime: "120 mins",
    servings: 4,
    difficulty: "Hard",
    cuisine: "Japanese",
    author: "Chef Takeshi",
    likes: 287,
    ingredients: [
      "2 lbs pork bones",
      "1 onion, halved",
      "4 cloves garlic",
      "2-inch piece ginger",
      "4 portions fresh ramen noodles",
      "4 soft-boiled eggs",
      "Green onions, sliced",
      "Nori sheets",
      "Bamboo shoots",
      "Soy sauce and miso paste for seasoning",
    ],
    instructions: [
      "Blanch pork bones in boiling water for 5 minutes, then rinse.",
      "In a large pot, add bones, onion, garlic, and ginger. Cover with water.",
      "Bring to a boil, then reduce to simmer for 8-10 hours, adding water as needed.",
      "Strain the broth and season with soy sauce and miso paste to taste.",
      "Cook ramen noodles according to package directions.",
      "Prepare soft-boiled eggs (6-7 minutes in boiling water).",
      "Assemble bowls with noodles, hot broth, halved eggs, and toppings.",
      "Serve immediately while hot.",
    ],
  },
  {
    id: "c5",
    title: "Vegan Chocolate Brownies",
    description: "Fudgy and decadent brownies made without eggs or dairy",
    image: "/vegan-chocolate-brownies.jpg",
    cookTime: "30 mins",
    servings: 12,
    difficulty: "Easy",
    cuisine: "American",
    author: "Lisa Green",
    likes: 94,
    ingredients: [
      "1 cup all-purpose flour",
      "1 cup granulated sugar",
      "1/2 cup cocoa powder",
      "1/2 teaspoon baking powder",
      "1/4 teaspoon salt",
      "1/2 cup vegetable oil",
      "1/2 cup water",
      "1 teaspoon vanilla extract",
      "1/2 cup vegan chocolate chips",
    ],
    instructions: [
      "Preheat oven to 350°F (175°C) and grease an 8x8 inch baking pan.",
      "In a large bowl, whisk together flour, sugar, cocoa powder, baking powder, and salt.",
      "Add oil, water, and vanilla extract. Mix until just combined.",
      "Fold in chocolate chips.",
      "Pour batter into prepared pan and spread evenly.",
      "Bake for 25-30 minutes until a toothpick comes out with a few moist crumbs.",
      "Let cool completely before cutting into squares.",
    ],
  },
  {
    id: "c6",
    title: "Authentic Paella Valenciana",
    description: "Traditional Spanish rice dish with chicken, rabbit, and vegetables",
    image: "/paella-valenciana-spanish.jpg",
    cookTime: "90 mins",
    servings: 6,
    difficulty: "Hard",
    cuisine: "Spanish",
    author: "Carlos Rodriguez",
    likes: 176,
    ingredients: [
      "2 cups short-grain rice",
      "1 lb chicken pieces",
      "1 lb rabbit pieces",
      "1 cup green beans",
      "1 cup butter beans",
      "2 tomatoes, grated",
      "4 cups chicken broth",
      "Pinch of saffron threads",
      "Olive oil",
      "Salt and paprika",
    ],
    instructions: [
      "Heat olive oil in a large paella pan over medium-high heat.",
      "Brown chicken and rabbit pieces, then set aside.",
      "Add green beans and butter beans, sauté for 5 minutes.",
      "Add grated tomatoes and cook until reduced.",
      "Return meat to pan and add rice, stirring to coat.",
      "Add hot broth infused with saffron and season with salt and paprika.",
      "Cook without stirring for 20-25 minutes until rice is tender.",
      "Let rest for 5 minutes before serving.",
    ],
  },
]

export default function CommunityRecipeDetailPage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/api/cookbook.php')
        
        if (response.success && response.data?.items) {
          const foundRecipe = response.data.items.find((r: any) => r.id.toString() === params.id)
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
  }, [params.id, toast])

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
