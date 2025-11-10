import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Video, ImageIcon, ChefHat, Utensils, BookOpen } from "lucide-react"
import Image from "next/image"

const resources = [
  {
    id: 1,
    title: "Knife Skills Fundamentals",
    description: "Complete guide to proper knife techniques and cutting methods for home cooks",
    type: "PDF",
    category: "Technique",
    icon: FileText,
    downloadUrl: "/downloads/knife-skills.pdf",
  },
  {
    id: 2,
    title: "Food Safety Essentials",
    description: "Important guidelines for safe food handling, storage, and preparation",
    type: "PDF",
    category: "Safety",
    icon: FileText,
    downloadUrl: "/downloads/food-safety.pdf",
  },
  {
    id: 3,
    title: "Cooking Methods Overview",
    description: "Comprehensive guide to different cooking techniques and when to use them",
    type: "PDF",
    category: "Technique",
    icon: FileText,
    downloadUrl: "#",
  },
  {
    id: 4,
    title: "Kitchen Equipment Guide",
    description: "Essential tools every home cook should have and how to use them effectively",
    type: "PDF",
    category: "Equipment",
    icon: FileText,
    downloadUrl: "#",
  },
  {
    id: 5,
    title: "Ingredient Substitutions",
    description: "Quick reference for common ingredient swaps and alternatives",
    type: "PDF",
    category: "Reference",
    icon: FileText,
    downloadUrl: "#",
  },
  {
    id: 6,
    title: "Meal Planning Templates",
    description: "Printable templates to organize your weekly meal planning",
    type: "PDF",
    category: "Planning",
    icon: FileText,
    downloadUrl: "#",
  },
]

const videos = [
  {
    id: 1,
    title: "How to Make Perfect Pasta",
    thumbnail: "/margherita-pizza-fresh-basil.jpg",
    duration: "15:00",
    category: "Tutorial",
  },
  {
    id: 2,
    title: "Mastering Knife Skills",
    thumbnail: "/cooking-kitchen-food-prep.png",
    duration: "20:00",
    category: "Technique",
  },
  {
    id: 3,
    title: "Bread Baking Basics",
    thumbnail: "/meal-prep-guide.jpg",
    duration: "25:00",
    category: "Tutorial",
  },
]

export default function EducationalResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">Educational Resources</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Explore our collection of downloadable guides, reference materials, and video tutorials to enhance your
                culinary knowledge and skills.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Downloadable Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => {
                const Icon = resource.icon
                return (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <Badge variant="outline">{resource.type}</Badge>
                        </div>
                        <Badge variant="secondary">{resource.category}</Badge>
                      </div>
                      <CardTitle className="text-xl text-balance">{resource.title}</CardTitle>
                      <CardDescription className="leading-relaxed">{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full bg-transparent" variant="outline" asChild>
                        <a href={resource.downloadUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Educational Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer pt-0">
                  <div className="relative h-48 w-full bg-muted">
                    <Image
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm">
                      {video.duration}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                        <Video className="h-8 w-8 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{video.category}</Badge>
                    </div>
                    <CardTitle className="text-lg text-balance">{video.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-balance">Ready to Put Your Knowledge to Practice?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
              Check out our culinary resources for hands-on cooking techniques and kitchen tips
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a href="/resources">View Culinary Resources</a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
