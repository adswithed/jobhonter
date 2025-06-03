import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Zap } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/lib/constants"

export default function FAQPage() {
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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">Find answers to common questions about {siteConfig.name}</p>
          </div>

          <Accordion type="single" collapsible className="mb-12">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does JobHonter work?</AccordionTrigger>
              <AccordionContent>
                JobHonter uses AI to scan multiple platforms (Twitter, Reddit, LinkedIn, and Google) for job
                opportunities that match your profile. It then extracts contact information, crafts personalized
                applications, and sends them directly to hiring managers on your behalf. You can control how many
                applications are sent per day and review all communications before they're sent.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Is JobHonter free to use?</AccordionTrigger>
              <AccordionContent>
                JobHonter offers a free trial that allows you to send up to 5 applications. After that, we offer two
                paid plans: Basic ($19/month) which includes up to 20 applications per month, and Pro ($39/month) which
                includes unlimited applications and additional features like resume optimization and priority support.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How does JobHonter find job opportunities?</AccordionTrigger>
              <AccordionContent>
                Our AI agent continuously monitors multiple platforms for job postings, hiring announcements, and
                recruitment messages. It uses natural language processing to understand job requirements and match them
                with your skills and preferences. This allows us to find opportunities that might not be posted on
                traditional job boards.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Can I review applications before they're sent?</AccordionTrigger>
              <AccordionContent>
                Yes! By default, JobHonter will show you each application before it's sent, allowing you to approve,
                edit, or reject it. You can also enable an auto-send feature for opportunities that meet certain
                criteria if you prefer a more hands-off approach.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>How personalized are the applications?</AccordionTrigger>
              <AccordionContent>
                Very personalized. Our AI analyzes the job description and your resume to highlight the most relevant
                skills and experiences. It also researches the company to include specific details about why you're
                interested in working there. You can review and customize the email templates used for different types
                of applications.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                Yes, we take data security very seriously. Your personal information and resume are encrypted and stored
                securely. We never share your data with third parties without your explicit consent. You can delete your
                account and all associated data at any time.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>Can I cancel my subscription at any time?</AccordionTrigger>
              <AccordionContent>
                Absolutely. You can cancel your subscription at any time from your account settings. There are no
                long-term contracts or cancellation fees. If you cancel, you'll continue to have access to your account
                until the end of your current billing period.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>How do I track the status of my applications?</AccordionTrigger>
              <AccordionContent>
                JobHonter provides a comprehensive dashboard where you can see all your applications, their current
                status (sent, opened, replied), and any follow-up communications. You'll also receive email
                notifications when there's activity on your applications.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="bg-muted p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="mb-6">
              If you couldn't find the answer you were looking for, please reach out to our support team.
            </p>
            <Button asChild>
              <Link href="/contact">Contact Support</Link>
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
