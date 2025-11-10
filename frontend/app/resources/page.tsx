import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Utensils, Scale, Timer, Thermometer, Users } from "lucide-react"
import Link from "next/link"

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">Culinary Resources</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Enhance your cooking skills with our comprehensive collection of guides, tutorials, and reference
                materials. From basic techniques to advanced methods, we've got you covered.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Cooking Guides</h2>
              <p className="text-muted-foreground leading-relaxed">
                Master essential cooking techniques with our step-by-step guides
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Knife Skills 101</CardTitle>
                  <CardDescription>Learn proper cutting techniques and knife handling</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">Tutorial</Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Master basic cuts like julienne, dice, and chiffonade. Improve your speed and safety in the
                      kitchen.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Read Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Thermometer className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Temperature Guide</CardTitle>
                  <CardDescription>Perfect doneness for every type of protein</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">Tip</Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Internal temperature charts for beef, pork, poultry, and fish. Never overcook or undercook again.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Read Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Baking Fundamentals</CardTitle>
                  <CardDescription>Understanding ratios and techniques for perfect bakes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">Tutorial</Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Learn the science behind baking, from proper measuring to understanding gluten development.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Read Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Timer className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Meal Prep Mastery</CardTitle>
                  <CardDescription>Efficient strategies for weekly meal planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">Tip</Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Save time and money with smart meal prep techniques. Includes storage tips and batch cooking
                      methods.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Read Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Spice & Herb Guide</CardTitle>
                  <CardDescription>Flavor profiles and pairing recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">Tip</Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Comprehensive guide to herbs and spices, including storage tips and flavor combinations.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Read Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Hosting & Entertaining</CardTitle>
                  <CardDescription>Tips for successful dinner parties and gatherings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary">Tutorial</Badge>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Plan and execute memorable gatherings with our hosting guides, from menu planning to table
                      settings.
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Read Guide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-balance">Ready to Put Your Skills to the Test?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
              Browse our recipe collection and start cooking with your newfound knowledge
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/recipes">Explore Recipes</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
