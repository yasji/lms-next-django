import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BookOpen, Users, ChevronRight, Library, Sparkles, ArrowRight, Star, BookMarked } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Library className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-black/70 dark:from-white dark:to-white/70">Libra</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm font-medium hover:text-primary">Features</Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary">About</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-black to-black/90 dark:from-white dark:to-white/90 text-white dark:text-black">
                  Get Started
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center relative z-10">
              <Badge variant="outline" className="mb-4">
                ✨ Launching Soon
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-black/70 dark:from-white dark:to-white/70 mb-6">
                The Future of Library
                <br />
                Management is Here
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Transform your library into a digital powerhouse. Seamless management,
                real-time analytics, and an exceptional reader experience.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/register">
                  <Button size="lg" className="gap-2 h-12 px-6 bg-gradient-to-r from-black to-black/90 dark:from-white dark:to-white/90 text-white dark:text-black">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-6">
                  Book a Demo
                </Button>
              </div>
            </div>
          </div>

          {/* Gradient Background */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[60rem] w-[90rem] rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-[100px]"></div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to run a modern library</h2>
              <p className="text-muted-foreground text-lg">Powerful features that make library management effortless</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <BookOpen className="h-8 w-8" />,
                  title: "Digital Catalog",
                  description: "Comprehensive book management with real-time availability tracking"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "User Management",
                  description: "Role-based access control with detailed user analytics"
                },
                {
                  icon: <BookMarked className="h-8 w-8" />,
                  title: "Smart Borrowing",
                  description: "Automated lending system with due date reminders"
                },
                {
                  icon: <Star className="h-8 w-8" />,
                  title: "Reader Reviews",
                  description: "Build community with ratings and book recommendations"
                },
                {
                  icon: <Sparkles className="h-8 w-8" />,
                  title: "Analytics",
                  description: "Deep insights into library usage and trends"
                },
                {
                  icon: <Library className="h-8 w-8" />,
                  title: "Event Management",
                  description: "Organize and promote library events effortlessly"
                }
              ].map((feature, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-lg transition-all">
                  <div className="flex flex-col gap-4">
                    <div className="p-3 rounded-lg bg-primary/5 w-fit">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-primary/10 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "10K+", label: "Active Readers" },
                { number: "50K+", label: "Books in Library" },
                { number: "95%", label: "Satisfaction Rate" },
                { number: "24/7", label: "Support Available" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-black to-black/70 dark:from-white dark:to-white/70">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 relative border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-muted-foreground text-lg">Join thousands of satisfied library members</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Libra has transformed how I manage my library. The analytics and user management are game-changers.",
                  author: "Sarah Johnson",
                  role: "Library Director",
                  image: "/testimonials/sarah.jpg"
                },
                {
                  quote: "As a reader, I love the personalized recommendations and easy book borrowing process.",
                  author: "Michael Chen",
                  role: "Avid Reader",
                  image: "/testimonials/michael.jpg"
                },
                {
                  quote: "The event management system makes organizing book clubs and author meetups so much easier.",
                  author: "Emma Rodriguez",
                  role: "Community Librarian",
                  image: "/testimonials/emma.jpg"
                }
              ].map((testimonial, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg transform -rotate-1 group-hover:rotate-0 transition-transform"></div>
                  <div className="relative bg-background p-6 rounded-lg border">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold">{testimonial.author[0]}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                    <div className="mt-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to modernize your library?</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Join thousands of libraries already using Libra to transform their operations
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-black to-black/90 dark:from-white dark:to-white/90 text-white dark:text-black">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Library className="h-6 w-6" />
                <span className="ml-2 font-semibold">Libra</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Next-generation library management system
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center">
              © 2024 Libra. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}