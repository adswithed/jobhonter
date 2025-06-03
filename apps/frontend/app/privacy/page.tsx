import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/lib/constants"

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: May 15, 2023</p>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              At {siteConfig.name}, we take your privacy seriously. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
            <p>We collect information that you provide directly to us when you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create an account</li>
              <li>Upload your resume or CV</li>
              <li>Configure your job search preferences</li>
              <li>Communicate with our support team</li>
            </ul>
            <p>
              This information may include your name, email address, phone number, professional experience, education
              history, skills, and job preferences.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Find relevant job opportunities that match your profile</li>
              <li>Create and send job applications on your behalf</li>
              <li>Communicate with you about your account and our services</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Protect against, identify, and prevent fraud and other illegal activities</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Information Sharing</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With potential employers when you approve an application to be sent</li>
              <li>With service providers who perform services on our behalf</li>
              <li>In response to a legal request if required by law</li>
              <li>To protect the rights and safety of {siteConfig.name}, our users, and the public</li>
              <li>In connection with a merger, sale, or acquisition of all or a portion of our company</li>
            </ul>
            <p>We will never sell your personal information to third parties for marketing purposes.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
              over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access and receive a copy of your personal information</li>
              <li>The right to correct inaccurate information</li>
              <li>The right to delete your personal information</li>
              <li>The right to restrict or object to processing</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p>To exercise these rights, please contact us at {siteConfig.contactEmail}.</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy
              periodically for any changes.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <p>
              Email: {siteConfig.contactEmail}
              <br />
              Address: 123 AI Boulevard, San Francisco, CA 94107, United States
            </p>
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
