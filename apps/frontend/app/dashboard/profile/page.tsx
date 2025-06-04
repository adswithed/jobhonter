"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, CheckCircle, User, Lock, Bell, Trash2, Save } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { authApi } from "@/lib/api"

export default function ProfilePage() {
  const { user, checkAuth, successMessage, clearSuccessMessage, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [localSuccess, setLocalSuccess] = useState("")
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    weeklyDigest: false,
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      })
    }
  }, [user])

  const clearMessages = () => {
    setError("")
    setLocalSuccess("")
    if (successMessage) clearSuccessMessage()
  }

  const showSuccess = (message: string) => {
    setLocalSuccess(message)
    setTimeout(() => setLocalSuccess(""), 5000)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    clearMessages()

    try {
      await authApi.updateProfile(profileData.name, profileData.email)
      
      showSuccess("🎯 Profile updated! You're looking more hireable already!")
      await checkAuth() // Refresh user data
    } catch (err: any) {
      setError(err.message || "Profile update failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    clearMessages()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("🔐 New passwords don't match! Even our AI agents need consistency!")
      setIsLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("🔑 Password must be at least 6 characters long for proper hunting security!")
      setIsLoading(false)
      return
    }

    try {
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      )
      
      showSuccess("🛡️ Password updated! Your hunting credentials are now more secure!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err: any) {
      setError(err.message || "Password update failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ Are you sure you want to delete your account? This action cannot be undone and you'll be permanently removed from the hunting crew!")) {
      return
    }

    setIsLoading(true)
    clearMessages()

    try {
      await authApi.deleteAccount()
      
      showSuccess("👋 Account deleted. You've been removed from the hunting crew!")
      await logout()
    } catch (err: any) {
      setError(err.message || "Account deletion failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your hunting profile and account preferences
        </p>
      </div>

      {(localSuccess || successMessage) && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          {localSuccess || successMessage}
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="danger">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your hunting profile information and avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={`/images/avatars/${user.name?.toLowerCase().replace(' ', '')}.png`} />
                  <AvatarFallback className="text-lg">
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'HU'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a new hunting profile picture
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your hunting alias"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="hunter@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center space-x-2">
                    <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">
                      {user.role === 'ADMIN' ? '🛡️ Admin Hunter' : '🎯 Job Hunter'}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Member since {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Updating profile..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your hunting credentials for better security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input
                    id="current"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Your current password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input
                    id="new"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Your new secure password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your new password"
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading}>
                  <Lock className="mr-2 h-4 w-4" />
                  {isLoading ? "Updating password..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive hunting updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive important account updates</p>
                </div>
                <Button variant="outline" size="sm">
                  {settings.emailNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Job Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new opportunities are found</p>
                </div>
                <Button variant="outline" size="sm">
                  {settings.jobAlerts ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Summary of your hunting activity</p>
                </div>
                <Button variant="outline" size="sm">
                  {settings.weeklyDigest ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your hunting account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <h3 className="font-medium mb-2">Delete Account</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete your account and remove you from the hunting crew. 
                  All your data will be lost and cannot be recovered.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isLoading ? "Deleting account..." : "Delete Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 