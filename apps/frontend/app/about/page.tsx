import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/lib/constants"

export default function AboutPage() {
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About {siteConfig.name}</h1>

          <div className="prose prose-lg dark:prose-invert">
            <p className="lead text-xl text-muted-foreground mb-8">
              We're on a mission to revolutionize the job search process through AI automation.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
            <p>
              {siteConfig.name} was founded in 2023 by a team of AI engineers and job search experts who were frustrated
              with the traditional job application process. After spending countless hours applying to jobs with little
              success, they realized there had to be a better way.
            </p>
            <p>
              By combining cutting-edge AI technology with deep knowledge of the hiring process, they created a platform
              that automates the most time-consuming aspects of job hunting while maintaining the personal touch that
              gets results.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
            <p>
              Our mission is to level the playing field in the job market by giving job seekers access to AI tools that
              can find opportunities they would otherwise miss and present their qualifications in the most compelling
              way possible.
            </p>
            <p>
              We believe that talent is distributed equally, but opportunity is not. {siteConfig.name} aims to bridge
              that gap by connecting qualified candidates directly with hiring managers, bypassing traditional
              gatekeepers and application tracking systems.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
            <p>
              Our team consists of AI researchers, software engineers, and career coaches who are passionate about using
              technology to improve people's lives. We're based in San Francisco but work with job seekers and employers
              worldwide.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
            <ul className="space-y-2 mt-4">
              <li>
                <strong>Innovation:</strong> We're constantly pushing the boundaries of what AI can do for job seekers.
              </li>
              <li>
                <strong>Transparency:</strong> We're open about how our technology works and what results you can
                expect.
              </li>
              <li>
                <strong>Empowerment:</strong> We believe in giving people the tools they need to take control of their
                careers.
              </li>
              <li>
                <strong>Privacy:</strong> We respect your data and will never share your information without your
                explicit consent.
              </li>
            </ul>

            <div className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Join Us</h2>
              <p>Ready to revolutionize your job search? Sign up today and let our AI do the heavy lifting for you.</p>
              <div className="mt-6">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
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
