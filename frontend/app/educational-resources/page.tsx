"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Video, ImageIcon, Leaf, Sun, Wind, Zap } from "lucide-react"
import Image from "next/image"

const resources = [
  {
    id: 1,
    title: "Introduction to Renewable Energy",
    description: "A comprehensive guide covering solar, wind, hydro, and geothermal energy sources",
    type: "PDF",
    category: "General",
    icon: FileText,
    downloadUrl: "#",
  },
  {
    id: 2,
    title: "Solar Energy Basics",
    description: "Understanding photovoltaic systems and solar thermal technology",
    type: "Video",
    category: "Solar",
    icon: Video,
    downloadUrl: "#",
  },
  {
    id: 3,
    title: "Wind Power Infographic",
    description: "Visual guide to how wind turbines generate electricity",
    type: "Infographic",
    category: "Wind",
    icon: ImageIcon,
    downloadUrl: "#",
  },
  {
    id: 4,
    title: "Sustainable Energy Solutions",
    description: "Practical applications of renewable energy in daily life",
    type: "PDF",
    category: "General",
    icon: FileText,
    downloadUrl: "#",
  },
  {
    id: 5,
    title: "Hydroelectric Power Explained",
    description: "How water flow is converted into clean electricity",
    type: "Video",
    category: "Hydro",
    icon: Video,
    downloadUrl: "#",
  },
  {
    id: 6,
    title: "Geothermal Energy Guide",
    description: "Harnessing Earth's internal heat for power generation",
    type: "PDF",
    category: "Geothermal",
    icon: FileText,
    downloadUrl: "#",
  },
]

const videos = [
  {
    id: 1,
    title: "The Future of Solar Energy",
    thumbnail: "/solar-panels-future.jpg",
    duration: "12:45",
    category: "Solar",
  },
  {
    id: 2,
    title: "Wind Farms: How They Work",
    thumbnail: "/wind-turbine-farm.png",
    duration: "8:30",
    category: "Wind",
  },
  {
    id: 3,
    title: "Renewable Energy Revolution",
    thumbnail: "/renewable-energy-landscape.png",
    duration: "15:20",
    category: "General",
  },
]

export default function EducationalResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Educational Resources</h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explore our collection of downloadable resources, infographics, and videos on renewable energy topics.
              Learn about sustainable energy solutions and their impact on our future.
            </p>
          </div>
        </section>

        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Energy Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                    <Sun className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Solar Energy</h3>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                    <Wind className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Wind Power</h3>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Hydroelectric</h3>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Geothermal</h3>
                </CardContent>
              </Card>
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
                      <Button className="w-full bg-transparent" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
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
            <h2 className="text-3xl font-bold mb-4 text-balance">Want to Learn More?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
              Subscribe to our newsletter to receive the latest educational resources and updates on renewable energy
              innovations
            </p>
            <Button size="lg" variant="secondary">
              Subscribe Now
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
