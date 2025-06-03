import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/lib/constants"

export default function CareersPage() {
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
            <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
            <p className="text-xl text-muted-foreground">Help us revolutionize the job search process with AI</p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Why Work at {siteConfig.name}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cutting-Edge Tech</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Work with the latest AI technologies and help shape the future of job searching.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Remote-First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>We're a distributed team with flexible working hours and a focus on results, not hours worked.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Meaningful Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Help people find their dream jobs and make a real difference in their lives and careers.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
            <div className="space-y-6">
              {[
                {
                  title: "Senior AI Engineer",
                  department: "Engineering",
                  location: "Remote",
                  type: "Full-time",
                },
                {
                  title: "Product Designer",
                  department: "Design",
                  location: "Remote",
                  type: "Full-time",
                },
                {
                  title: "Growth Marketing Manager",
                  department: "Marketing",
                  location: "Remote",
                  type: "Full-time",
                },
                {
                  title: "Customer Success Specialist",
                  department: "Operations",
                  location: "Remote",
                  type: "Full-time",
                },
              ].map((job, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                    <CardDescription>
                      {job.department} · {job.location} · {job.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <p className="text-muted-foreground">
                      Join our team and help build the future of job searching with AI.
                    </p>
                    <Button>Apply Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-muted p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Don't See a Fit?</h2>
            <p className="mb-6">
              We're always looking for talented individuals to join our team. Send us your resume and let us know how
              you can contribute.
            </p>
            <Button asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
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
