import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import Image from "next/image"

interface NewsItem {
  id: string
  title: string
  excerpt: string
  date: string
  category: string
  image: string
}

const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "Summer Grilling Masterclass Coming Soon",
    excerpt:
      "Join our expert chefs for an exclusive outdoor cooking workshop featuring BBQ techniques and seasonal recipes.",
    date: "2024-06-15",
    category: "Events",
    image: "/outdoor-grilling-bbq.jpg",
  },
  {
    id: "2",
    title: "New Mediterranean Recipe Collection",
    excerpt: "Explore our latest collection of authentic Mediterranean dishes, from Greek salads to Italian pasta.",
    date: "2024-06-12",
    category: "Recipes",
    image: "/mediterranean-platter.png",
  },
  {
    id: "3",
    title: "Community Cookbook Reaches 1000 Recipes",
    excerpt: "Our amazing community has contributed over 1000 unique recipes. Thank you for making FoodFusion special!",
    date: "2024-06-10",
    category: "Community",
    image: "/cookbook-recipes-collection.jpg",
  },
  {
    id: "4",
    title: "Healthy Meal Prep Tips for Busy Weeks",
    excerpt:
      "Learn how to prepare nutritious meals in advance with our comprehensive meal prep guide and time-saving strategies.",
    date: "2024-06-08",
    category: "Tips",
    image: "/meal-prep-guide.jpg",
  },
]

export function NewsFeed() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Latest News & Updates</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stay informed about upcoming events, new recipes, and community highlights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow pt-0">
              <div className="relative h-48 w-full">
                <Image 
                  src={item.image || "/placeholder.svg"} 
                  alt={item.title} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{item.category}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <CardTitle className="text-lg text-balance">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">
                  {item.excerpt}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
