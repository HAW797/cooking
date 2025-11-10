"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Video, BookOpen, Utensils, ChefHat, Timer } from "lucide-react";
import { resourcesService, type Resource } from "@/lib/api/resources.service";
import Link from "next/link";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await resourcesService.getResources("Culinary");
        
        if (response.success && response.data?.items) {
          setResources(response.data.items);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const getIcon = (topic: string) => {
    const topicLower = topic?.toLowerCase() || "";
    if (topicLower.includes("knife")) return ChefHat;
    if (topicLower.includes("temperature") || topicLower.includes("cooking")) return Timer;
    if (topicLower.includes("baking")) return Utensils;
    if (topicLower.includes("video")) return Video;
    if (topicLower.includes("guide")) return BookOpen;
    return FileText;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-10 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">Culinary Resources</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Master essential cooking techniques with our comprehensive collection of guides, tutorials, and reference
                materials. From knife skills to temperature guides, we've got you covered.
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              <p className="mt-4 text-muted-foreground">Loading resources...</p>
            </div>
          </section>
        ) : (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Cooking Techniques & Skills</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Master essential cooking techniques with our step-by-step guides
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => {
                  const Icon = getIcon(resource.topic || "");
                  return (
                    <Card key={resource.resource_id} className="py-6 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>{resource.title}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {resource.topic && <Badge variant="secondary">{resource.topic}</Badge>}
                          <Button 
                            variant="outline" 
                            className="w-full bg-transparent"
                            asChild
                          >
                            <a href={resource.file_url} download target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {resources.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No culinary resources available yet.</p>
              )}
            </div>
          </section>
        )}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-balance">Want to Learn More?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
              Explore our educational resources for comprehensive guides and reference materials
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/educational-resources">View Educational Resources</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
