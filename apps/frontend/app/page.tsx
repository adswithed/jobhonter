"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import {
  ArrowRight,
  CheckCircle,
  Search,
  Send,
  Zap,
  Globe,
  Mail,
  Filter,
  MessageSquare,
  CheckSquare,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { siteConfig } from "@/lib/constants"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#why" className="text-sm font-medium hover:text-primary transition-colors">
                Why {siteConfig.name}
              </Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </Link>
            </div>
            <ModeToggle />
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight md:leading-tight mb-6">
                Let AI <span className="text-primary">Hunt Jobs</span> & Apply For You
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                {siteConfig.name} automates your job search by finding opportunities across Twitter, Reddit, LinkedIn,
                and Google, then sends tailored applications directly to employers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/signup">
                    Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-16 relative w-full max-w-4xl"
            >
              <div className="relative rounded-2xl overflow-hidden border shadow-2xl">
                <div className="w-full h-[600px] bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center">
                  <div className="text-4xl font-bold text-primary/40">JobHonter Dashboard</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="container mx-auto px-4 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to revolutionize your job search process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: <Search className="h-10 w-10 text-primary" />,
                title: "AI Scans the Web",
                description:
                  "Our AI agent searches Twitter, Reddit, LinkedIn, and Google for relevant job opportunities that match your profile.",
              },
              {
                icon: <CheckCircle className="h-10 w-10 text-primary" />,
                title: "Identifies Opportunities",
                description: `${siteConfig.name} extracts contact information and job details, filtering for the best matches to your skills and preferences.`,
              },
              {
                icon: <Send className="h-10 w-10 text-primary" />,
                title: "Sends Applications",
                description:
                  "The AI crafts personalized applications and sends them directly to hiring managers via email, maximizing your chances.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-6 rounded-xl border bg-card"
              >
                <div className="p-4 rounded-full bg-primary/10 mb-6">{step.icon}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <div className="mt-auto">
                  {index === 0 && (
                    <div className="h-32 w-full rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="160"
                        height="120"
                        viewBox="0 0 160 120"
                        fill="none"
                        className="text-primary"
                      >
                        <circle cx="80" cy="50" r="30" fill="currentColor" fillOpacity="0.1" />
                        <circle cx="80" cy="50" r="20" stroke="currentColor" strokeWidth="2" strokeOpacity="0.6" />
                        <path
                          d="M70 50C70 44.477 74.477 40 80 40C85.523 40 90 44.477 90 50C90 55.523 85.523 60 80 60"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path d="M80 60V70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M95 65L105 75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <rect x="100" y="70" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M40 30C40 30 50 20 65 25M120 30C120 30 110 20 95 25"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M30 60C30 60 40 70 50 65M130 60C130 60 120 70 110 65"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                  {index === 1 && (
                    <div className="h-32 w-full rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="160"
                        height="120"
                        viewBox="0 0 160 120"
                        fill="none"
                        className="text-primary"
                      >
                        <rect x="40" y="30" width="80" height="60" rx="4" fill="currentColor" fillOpacity="0.1" />
                        <rect x="50" y="40" width="60" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                        <rect x="50" y="55" width="60" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                        <rect x="50" y="70" width="60" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M120 50L130 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M120 65L130 65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M120 80L130 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="135" cy="50" r="5" fill="currentColor" fillOpacity="0.6" />
                        <circle cx="135" cy="65" r="5" fill="currentColor" />
                        <circle cx="135" cy="80" r="5" fill="currentColor" fillOpacity="0.6" />
                      </svg>
                    </div>
                  )}
                  {index === 2 && (
                    <div className="h-32 w-full rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="160"
                        height="120"
                        viewBox="0 0 160 120"
                        fill="none"
                        className="text-primary"
                      >
                        <rect x="40" y="40" width="50" height="40" rx="4" fill="currentColor" fillOpacity="0.1" />
                        <path
                          d="M45 50H85M45 60H75M45 70H65"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M95 60L120 60"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray="2 2"
                        />
                        <path
                          d="M90 60L100 50M90 60L100 70"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <rect x="120" y="40" width="10" height="40" rx="2" fill="currentColor" fillOpacity="0.2" />
                        <path
                          d="M120 45C120 45 125 43 130 45"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M120 55C120 55 125 53 130 55"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M120 65C120 65 125 63 130 65"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M120 75C120 75 125 73 130 75"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-muted/50 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Designed to make your job search effortless and effective
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "No Job Boards Needed",
                  description:
                    "Skip traditional job boards and go straight to the source with our AI-powered web scraping technology.",
                },
                {
                  title: "AI Tailored Emails",
                  description:
                    "Our AI crafts personalized application emails that highlight your relevant skills for each opportunity.",
                },
                {
                  title: "Scrapes the Web for You",
                  description:
                    "Continuously monitors multiple platforms to find hidden job opportunities before they reach job boards.",
                },
                {
                  title: "Direct Contact",
                  description:
                    "Bypass application tracking systems by sending your application directly to hiring managers.",
                },
                {
                  title: "Smart Filtering",
                  description:
                    "AI intelligently filters opportunities based on your skills, experience, and preferences.",
                },
                {
                  title: "Application Tracking",
                  description: "Keep track of all your applications and follow-ups in one centralized dashboard.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-xl border bg-card hover:shadow-md transition-all"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 mr-3 bg-primary/10 rounded-full flex items-center justify-center">
                      {index === 0 && <Globe className="h-5 w-5 text-primary" />}
                      {index === 1 && <Mail className="h-5 w-5 text-primary" />}
                      {index === 2 && <Search className="h-5 w-5 text-primary" />}
                      {index === 3 && <MessageSquare className="h-5 w-5 text-primary" />}
                      {index === 4 && <Filter className="h-5 w-5 text-primary" />}
                      {index === 5 && <CheckSquare className="h-5 w-5 text-primary" />}
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why JobHonter */}
        <section id="why" className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why {siteConfig.name}?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Save Countless Hours</h3>
                    <p className="text-muted-foreground">
                      Automate the most time-consuming parts of job hunting, giving you back hours every week.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Personalized Job Search</h3>
                    <p className="text-muted-foreground">
                      Our AI learns your preferences and skills to find opportunities that truly match your profile.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 p-2 rounded-full bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Cut Out Middlemen</h3>
                    <p className="text-muted-foreground">
                      Connect directly with hiring managers instead of getting lost in application tracking systems.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden border shadow-xl"
            >
              <div className="w-full h-[500px] bg-gradient-to-r from-primary/5 to-primary/20 flex items-center justify-center">
                <div className="text-3xl font-bold text-primary/40">Why Choose JobHonter</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted/50 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Users Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our users are already seeing incredible results
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: `${siteConfig.name} found me a senior developer position that wasn't even posted on job boards. I got an interview within 48 hours of the AI sending my application.`,
                  name: "Alex Chen",
                  title: "Software Engineer",
                },
                {
                  quote:
                    "I was spending 20+ hours a week on job applications. JobHonter cut that down to just 1 hour of reviewing opportunities the AI found for me.",
                  name: "Sarah Johnson",
                  title: "Marketing Specialist",
                },
                {
                  quote:
                    "The personalized emails that JobHonter sends are incredible. I've received so many responses from hiring managers commenting on how tailored my application was.",
                  name: "Michael Rodriguez",
                  title: "Product Designer",
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-xl border bg-card"
                >
                  <div className="mb-4 text-primary">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className="text-lg">
                          ★
                        </span>
                      ))}
                  </div>
                  <p className="mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="mr-3">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{testimonial.name.charAt(0)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section id="pricing" className="container mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-lg text-muted-foreground mb-10">Choose the plan that works for you</p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl border bg-card shadow-lg">
                <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                  Basic
                </div>
                <h3 className="text-2xl font-bold mb-2">$19/month</h3>
                <p className="text-muted-foreground mb-6">Perfect for individuals starting their job search</p>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Up to 20 job applications per month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Basic AI customization</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/signup?plan=basic">Get Started</Link>
                </Button>
              </div>

              <div className="p-8 rounded-2xl border-2 border-primary bg-card shadow-xl">
                <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                  Pro
                </div>
                <h3 className="text-2xl font-bold mb-2">$39/month</h3>
                <p className="text-muted-foreground mb-6">For serious job seekers who want the best results</p>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Unlimited job applications</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Advanced AI customization</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Priority email support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-2" />
                    <span>Resume optimization</span>
                  </li>
                </ul>
                <Button size="lg" className="w-full" asChild>
                  <Link href="/signup?plan=pro">Sign Up Now</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Newsletter Signup */}
        <section className="bg-primary text-primary-foreground py-20 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
              <p className="text-lg opacity-90 mb-10">
                Subscribe to our newsletter for the latest features and updates
              </p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-primary-foreground text-foreground placeholder:text-muted-foreground flex-grow"
                />
                <Button variant="secondary" size="lg">
                  Subscribe
                </Button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-bold">{siteConfig.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-powered job application automation</p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href={siteConfig.social.twitter}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link
                    href={siteConfig.social.linkedin}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    LinkedIn
                  </Link>
                </li>
                <li>
                  <Link
                    href={siteConfig.social.instagram}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Instagram
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-6 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
