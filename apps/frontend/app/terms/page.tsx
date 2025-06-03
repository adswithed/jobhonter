import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/lib/constants"

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: May 15, 2023</p>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Please read these Terms of Service ("Terms") carefully before using the {siteConfig.name} website and service operated by {siteConfig.name}, Inc.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
            <p>
              {siteConfig.name} provides an AI-powered job application automation service that helps users find job opportunities and send applications on their behalf. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Scanning various platforms for job opportunities</li>
              <li>Matching job opportunities with user profiles</li>
              <li>Generating personalized job applications</li>
              <li>Sending applications to potential employers</li>
              <li>Tracking application status</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Subscription and Payments</h2>
            <p>
              Some aspects of the Service may be provided for a fee. You will be required to select a payment plan and provide accurate payment information. By submitting such information, you grant us the right to provide the information to third-party payment processors to facilitate payment.
            </p>
            <p>
              Subscription fees are billed in advance on a monthly basis. You may cancel your subscription at any time, but no refunds will be provided for any unused portion of the current billing period.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
