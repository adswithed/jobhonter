"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AdminLoginPage() {
  const router = useRouter()
  const { adminLogin, successMessage, clearSuccessMessage } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError("")
    if (successMessage) clearSuccessMessage()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Use auth context admin login method
      await adminLogin(formData.email, formData.password)

      // Redirect to admin dashboard
      router.push("/admin")
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold">{siteConfig.name}</span>
          </Link>
          <h1 className="text-3xl font-bold">Management Access</h1>
          <p className="text-muted-foreground mt-2">
            Enter your credentials to access the management dashboard
          </p>
        </div>

        <div className="bg-card border rounded-lg p-8 shadow-lg">
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="border-2"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <Shield className="mr-2 h-4 w-4" />
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to main login
          </Link>
        </div>
      </div>
    </div>
  )
} 