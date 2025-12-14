import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Candy, ShoppingBag, Shield, Sparkles } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-accent/20" />
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-candy-pink/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-candy-mint/20 blur-3xl" />
          
          <div className="container relative">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Sweet treats await
              </div>
              
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Your Favorite
                <span className="block hero-gradient bg-clip-text text-transparent">
                  Sweet Shop
                </span>
              </h1>
              
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                Discover a world of delicious candies, chocolates, and treats.
                From classic favorites to unique confections.
              </p>
              
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/dashboard">
                  <Button size="xl" className="gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Browse Sweets
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="xl">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-card py-20">
          <div className="container">
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { icon: Candy, title: "Premium Quality", desc: "Handpicked sweets from the finest confectioners" },
                { icon: ShoppingBag, title: "Easy Shopping", desc: "Simple checkout and fast delivery to your door" },
                { icon: Shield, title: "Secure & Safe", desc: "Your transactions are protected and encrypted" },
              ].map((feature, i) => (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
