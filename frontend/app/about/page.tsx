import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Users, Heart, Award, Target, Eye } from "lucide-react"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">About FoodFusion</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're passionate about bringing food lovers together to share, discover, and celebrate the joy of
                cooking. FoodFusion is more than just a recipe platform—it's a vibrant community where culinary
                traditions meet modern innovation.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To create an inclusive culinary community where everyone—from beginners to expert chefs—can share
                    their passion for food, learn new techniques, and discover recipes from around the world. We believe
                    that cooking brings people together and creates lasting memories.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Our Vision</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    To become the world's most trusted and beloved culinary platform, where food enthusiasts can find
                    inspiration, share their creations, and connect with like-minded individuals who share their love
                    for cooking and great food.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                These core principles guide everything we do at FoodFusion
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Community First</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We prioritize building meaningful connections between food lovers worldwide
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Quality Content</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every recipe is carefully curated and tested to ensure the best results
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Passion for Food</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We celebrate the joy of cooking and the cultural stories behind every dish
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <ChefHat className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Continuous Learning</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We provide resources and support to help everyone improve their culinary skills
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <Image src="/team-cooking-together.jpg" alt="Team cooking together" fill className="object-cover" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">Our Story</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      FoodFusion was born from a simple idea: that food has the power to bring people together across
                      cultures, backgrounds, and borders. Founded in 2020 by a group of passionate food enthusiasts, we
                      set out to create a platform where anyone could share their culinary journey.
                    </p>
                    <p>
                      What started as a small collection of family recipes has grown into a thriving community of
                      thousands of home cooks, professional chefs, and food lovers from around the world. Today, we're
                      proud to host over 10,000 recipes and counting, each one telling a unique story.
                    </p>
                    <p>
                      Our platform continues to evolve, but our core mission remains the same: to celebrate the
                      universal language of food and make cooking accessible, enjoyable, and rewarding for everyone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-sm opacity-90">Recipes Shared</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50,000+</div>
                <div className="text-sm opacity-90">Community Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">150+</div>
                <div className="text-sm opacity-90">Countries Represented</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4.8/5</div>
                <div className="text-sm opacity-90">Average Rating</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
