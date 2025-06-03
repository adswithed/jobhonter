import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/lib/constants"

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-muted-foreground">Insights, tips, and news about job hunting and AI</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "How AI is Transforming the Job Search Process",
                description:
                  "Discover how artificial intelligence is revolutionizing how people find and apply for jobs.",
                date: "May 15, 2023",
                category: "AI",
                slug: "ai-transforming-job-search",
              },
              {
                title: "5 Ways to Optimize Your Resume for AI Screening",
                description:
                  "Learn how to format your resume to pass through AI screening systems and land more interviews.",
                date: "April 28, 2023",
                category: "Resume Tips",
                slug: "optimize-resume-ai-screening",
              },
              {
                title: "The Future of Work: Predictions for 2024 and Beyond",
                description:
                  "Our experts share their predictions on how the job market and workplace will evolve in the coming years.",
                date: "April 10, 2023",
                category: "Future of Work",
                slug: "future-of-work-predictions",
              },
              {
                title: "Success Story: How John Landed His Dream Job Using JobHonter",
                description:
                  "Read about how our AI-powered platform helped John secure a position at a top tech company.",
                date: "March 22, 2023",
                category: "Success Stories",
                slug: "success-story-john",
              },
              {
                title: "The Hidden Job Market: Finding Opportunities Before They're Posted",
                description: "Tips for accessing the 70% of jobs that are never advertised on public job boards.",
                date: "March 5, 2023",
                category: "Job Search",
                slug: "hidden-job-market",
              },
              {
                title: "How to Craft the Perfect Follow-Up Email After an Interview",
                description:
                  "Templates and tips for sending effective follow-up emails that improve your chances of getting hired.",
                date: "February 18, 2023",
                category: "Interview Tips",
                slug: "perfect-follow-up-email",
              },
            ].map((post, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="text-sm text-muted-foreground mb-2">
                    {post.date} · {post.category}
                  </div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription>{post.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/blog/${post.slug}`}>Read Article</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline">Load More Articles</Button>
          </div>

          <div className="mt-16 bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Subscribe to Our Newsletter</h2>
            <p className="text-center mb-6">
              Get the latest job search tips, AI insights, and {siteConfig.name} updates delivered to your inbox.
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2 rounded-l-md border border-input bg-background"
              />
              <Button className="rounded-l-none">Subscribe</Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
