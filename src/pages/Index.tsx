
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, ChefHat, Sparkles, Utensils, Eye, Palette } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import dishesBg from "@/assets/dishes-bg.jpg";
import ingredientsBg from "@/assets/ingredients-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroBg} 
            alt="Restaurant kitchen background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95"></div>
        </div>
        <div className="relative container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              AI-Powered Food Visualization
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
              Visualize your dishes
              <span className="block text-primary">before they hit the table</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Bring your menus to life with AI. Create stunning, realistic photos of your dishes 
              to perfect presentation, plan layouts, and wow your customers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-6">
                <Camera className="w-5 h-5 mr-2" />
                Start Creating
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Eye className="w-5 h-5 mr-2" />
                View Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-24">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={dishesBg} 
            alt="Plated dishes background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Perfect every dish before service
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From concept to plate, visualize your culinary creations with photorealistic AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Menu Planning</CardTitle>
                <CardDescription>
                  Visualize new dishes before prep work begins. Test plating ideas and perfect presentations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Visual Marketing</CardTitle>
                <CardDescription>
                  Create stunning menu photos for social media, websites, and promotional materials.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Staff Training</CardTitle>
                <CardDescription>
                  Show your team exactly how dishes should look with consistent, professional photos.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-24">
        <div className="absolute inset-0">
          <img 
            src={ingredientsBg} 
            alt="Fresh ingredients background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-muted/95"></div>
        </div>
        <div className="relative container mx-auto px-4">
          <Card className="max-w-4xl mx-auto text-center border-border/50">
            <CardHeader className="space-y-6 py-12">
              <CardTitle className="text-3xl sm:text-4xl font-bold">
                Ready to revolutionize your kitchen?
              </CardTitle>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Join forward-thinking chefs and restaurants who are using AI to perfect their dishes 
                and create stunning visual content.
              </CardDescription>
              <div className="pt-4">
                <Button size="lg" className="text-lg px-12 py-6">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Today
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
