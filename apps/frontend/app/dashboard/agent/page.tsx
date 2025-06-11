"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  X, Plus, Upload, Bot, Crown, Lock, Zap, Save, Settings, 
  Target, Globe, Twitter, MessageSquare, Linkedin, Mail, 
  Calendar, Clock, RefreshCw, CheckCircle, AlertCircle,
  FileText, User, Briefcase, MapPin, DollarSign, Rocket
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AgentPage() {
  const [keywords, setKeywords] = useState<string[]>(["JavaScript", "React", "Frontend"])
  const [newKeyword, setNewKeyword] = useState("")
  const [maxApplications, setMaxApplications] = useState([10])
  const [platforms, setPlatforms] = useState({
    twitter: true,
    reddit: true,
    linkedin: true,
    google: true,
  })
  const [isPremium] = useState(false) // This will be dynamic based on user subscription
  const [agentActive, setAgentActive] = useState(false)

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword])
      setNewKeyword("")
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addKeyword()
    }
  }

  const PremiumFeatureCard = ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => (
    <Card className="relative overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 opacity-60">
      <div className="absolute top-2 right-2">
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <Crown className="mr-1 h-3 w-3" />
          Premium
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Job Hunter Agent
          </h1>
          <p className="text-muted-foreground mt-1">
            {isPremium ? 'Configure your AI-powered automation system' : 'Set up your job search preferences (manual mode)'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Advanced Settings
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Plan Status */}
      <Alert className={`border-l-4 ${isPremium ? 'border-amber-500 bg-amber-50 dark:bg-amber-950' : 'border-blue-500 bg-blue-50 dark:bg-blue-950'}`}>
        <div className="flex items-center gap-2">
          {isPremium ? <Crown className="h-4 w-4 text-amber-600" /> : <Globe className="h-4 w-4 text-blue-600" />}
          <AlertDescription className="flex items-center justify-between w-full">
            <span>
              {isPremium 
                ? '🤖 AI Agent Active - Autonomous job hunting enabled!' 
                : '🔧 Manual Mode - Configure preferences for manual job discovery'}
            </span>
            {!isPremium && (
              <Button size="sm" className="ml-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                <Rocket className="mr-2 h-4 w-4" />
                Unlock AI Agent
              </Button>
            )}
          </AlertDescription>
        </div>
      </Alert>

      {/* AI Agent Status (Premium) */}
      {isPremium ? (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-green-600" />
              Agent Status
              <Badge className={`${agentActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {agentActive ? 'Active' : 'Idle'}
              </Badge>
            </CardTitle>
            <CardDescription>Your AI agent is ready to automate your job search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">12</p>
                <p className="text-xs text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">45</p>
                <p className="text-xs text-muted-foreground">Jobs Found</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">8</p>
                <p className="text-xs text-muted-foreground">Applications Sent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">2</p>
                <p className="text-xs text-muted-foreground">Responses</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button className={`flex-1 ${agentActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                {agentActive ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Stop Agent
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Start Agent
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Run
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <PremiumFeatureCard 
          title="AI Automation Hub" 
          description="Autonomous job application system with smart AI agents"
        >
          <div className="space-y-4 opacity-60">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">•••</p>
                <p className="text-xs text-muted-foreground">Auto Applications</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">•••</p>
                <p className="text-xs text-muted-foreground">Smart Responses</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-200">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" size="sm">
                <Rocket className="mr-2 h-4 w-4" />
                Upgrade to Enable AI Agent
              </Button>
            </div>
          </div>
        </PremiumFeatureCard>
      )}

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Job Preferences */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Job Preferences
                </CardTitle>
                <CardDescription>Define what kind of opportunities you're seeking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="role">Target Role</Label>
                  <Input id="role" placeholder="e.g. Senior Frontend Developer" defaultValue="Senior Frontend Developer" />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Input id="experience" type="number" placeholder="Years of experience" defaultValue="5" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Preference</Label>
                  <Input id="location" placeholder="Remote, New York, London..." defaultValue="Remote" />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input id="salary" placeholder="e.g. $80k - $120k" />
                </div>
              </CardContent>
            </Card>

            {/* Skills & Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  Skills & Keywords
                </CardTitle>
                <CardDescription>Keywords that should appear in job descriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeKeyword(keyword)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill or keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button type="button" size="sm" onClick={addKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                  <Label>Must-Have Keywords</Label>
                  <Textarea placeholder="Enter required keywords (one per line)" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Exclude Keywords</Label>
                  <Textarea placeholder="Keywords to avoid (one per line)" rows={2} />
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Resume Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Resume & Profile
              </CardTitle>
              <CardDescription>Upload your resume and create your professional profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume Upload</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Drop your resume here or click to browse
                    </p>
                    <Input id="resume" type="file" className="hidden" accept=".pdf,.doc,.docx" />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById("resume")?.click()}>
                      Upload Resume
                    </Button>
                  </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio/LinkedIn URL</Label>
                  <Input id="portfolio" placeholder="https://linkedin.com/in/yourprofile" />
                  
                  <Label htmlFor="github">GitHub URL</Label>
                  <Input id="github" placeholder="https://github.com/yourusername" />
                  
                  <Label htmlFor="website">Personal Website</Label>
                  <Input id="website" placeholder="https://yourwebsite.com" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Search Platforms
              </CardTitle>
              <CardDescription>Select where to discover job opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
              <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Twitter className="h-5 w-5 text-blue-500" />
                      <div>
                        <Label htmlFor="twitter">Twitter/X</Label>
                        <p className="text-sm text-muted-foreground">Search job posts and announcements</p>
                      </div>
                </div>
                <Switch
                  id="twitter"
                  checked={platforms.twitter}
                  onCheckedChange={(checked) => setPlatforms({ ...platforms, twitter: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-orange-500" />
                      <div>
                  <Label htmlFor="reddit">Reddit</Label>
                        <p className="text-sm text-muted-foreground">r/Jobs, r/forhire, and industry subreddits</p>
                      </div>
                </div>
                <Switch
                  id="reddit"
                  checked={platforms.reddit}
                  onCheckedChange={(checked) => setPlatforms({ ...platforms, reddit: checked })}
                />
              </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Linkedin className="h-5 w-5 text-blue-700" />
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <p className="text-sm text-muted-foreground">Professional network job postings</p>
                      </div>
                </div>
                <Switch
                  id="linkedin"
                  checked={platforms.linkedin}
                  onCheckedChange={(checked) => setPlatforms({ ...platforms, linkedin: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-green-500" />
                      <div>
                        <Label htmlFor="google">Google Search</Label>
                        <p className="text-sm text-muted-foreground">Web search for company career pages</p>
                      </div>
                </div>
                <Switch
                  id="google"
                  checked={platforms.google}
                  onCheckedChange={(checked) => setPlatforms({ ...platforms, google: checked })}
                />
                  </div>
                </div>
              </div>

              {/* Platform-specific settings */}
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Platform-Specific Settings</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Twitter Keywords</Label>
                    <Input placeholder="hiring, job opening, we're hiring" />
                  </div>
                  <div className="space-y-2">
                    <Label>Reddit Communities</Label>
                    <Input placeholder="r/jobs, r/forhire, r/programming" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          {isPremium ? (
            <>
              {/* AI Automation Settings */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    AI Automation Settings
                  </CardTitle>
                  <CardDescription>Configure how your AI agent operates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-apply">Auto-Apply to Jobs</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically send applications to matching jobs
                        </p>
                      </div>
                      <Switch id="auto-apply" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="generate-cover">Generate Cover Letters</Label>
                        <p className="text-sm text-muted-foreground">
                          AI creates personalized cover letters for each application
                        </p>
                      </div>
                      <Switch id="generate-cover" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="tailor-resume">Tailor Resume</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically adjust resume for each job posting
                        </p>
                      </div>
                      <Switch id="tailor-resume" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="follow-up">Smart Follow-ups</Label>
                        <p className="text-sm text-muted-foreground">
                          Send intelligent follow-up emails after applications
                        </p>
                      </div>
                      <Switch id="follow-up" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="max-daily">Maximum Applications per Day</Label>
                        <span className="text-sm font-medium">{maxApplications[0]}</span>
                      </div>
                      <Slider
                        id="max-daily"
                        min={1}
                        max={50}
                        step={1}
                        value={maxApplications}
                        onValueChange={setMaxApplications}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended: 10-15 applications per day for best results
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Agent Schedule</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">Every 2 Hours</Button>
                        <Button variant="default" size="sm">Every 6 Hours</Button>
                        <Button variant="outline" size="sm">Daily</Button>
                        <Button variant="outline" size="sm">Custom</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Personalization */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    AI Personalization
                  </CardTitle>
                  <CardDescription>Teach your AI agent about your style and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Communication Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm">Professional</Button>
                      <Button variant="default" size="sm">Friendly</Button>
                      <Button variant="outline" size="sm">Casual</Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Application Tone</Label>
                    <Textarea 
                      placeholder="Describe how you want your applications to sound. For example: 'I prefer a confident but humble tone, emphasizing my collaborative skills and passion for learning.'"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Key Achievements</Label>
                    <Textarea 
                      placeholder="List your top 3-5 professional achievements that should be highlighted in applications..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Manual Mode Settings */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Manual Mode Settings
                  </CardTitle>
                  <CardDescription>Configure your manual job search preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-manual">Search Results per Session</Label>
                      <span className="text-sm">{maxApplications[0]}</span>
                    </div>
                    <Slider
                      id="max-manual"
                      min={5}
                      max={50}
                      step={5}
                      value={maxApplications}
                      onValueChange={setMaxApplications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-templates">Use Email Templates</Label>
                      <p className="text-sm text-muted-foreground">
                        Pre-fill application emails with templates
                      </p>
                    </div>
                    <Switch id="email-templates" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="save-contacts">Save Contact Information</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save discovered emails
                      </p>
                    </div>
                    <Switch id="save-contacts" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Premium Upgrade */}
              <PremiumFeatureCard 
                title="AI Automation" 
                description="Unlock full automation capabilities"
              >
                <div className="space-y-3 opacity-60">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Auto-apply to matching jobs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">AI-generated cover letters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Smart follow-up sequences</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Resume tailoring</span>
                  </div>
                </div>
              </PremiumFeatureCard>
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Email Templates */}
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Email Templates
                </CardTitle>
                <CardDescription>Create templates for different types of applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label>Cover Letter Template</Label>
                <Textarea
                    placeholder="Dear Hiring Manager,&#10;&#10;I am excited to apply for the [JOB_TITLE] position at [COMPANY_NAME]..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Follow-up Template</Label>
                  <Textarea 
                    placeholder="Hi [HIRING_MANAGER],&#10;&#10;I wanted to follow up on my application for the [JOB_TITLE] position..."
                    rows={3}
                  />
              </div>

              <div className="space-y-2">
                  <Label>Cold Outreach Template</Label>
                <Textarea
                    placeholder="Hello [NAME],&#10;&#10;I came across your company and I'm very interested in potential opportunities..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Template Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Template Variables
                </CardTitle>
                <CardDescription>Available placeholders for your templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded">[COMPANY_NAME]</code>
                    <span className="ml-2 text-muted-foreground">Company name</span>
                  </div>
                  <div className="text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded">[JOB_TITLE]</code>
                    <span className="ml-2 text-muted-foreground">Job position title</span>
                  </div>
                  <div className="text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded">[HIRING_MANAGER]</code>
                    <span className="ml-2 text-muted-foreground">Hiring manager name</span>
                  </div>
                  <div className="text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded">[MY_NAME]</code>
                    <span className="ml-2 text-muted-foreground">Your name</span>
                  </div>
                  <div className="text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded">[MY_SKILLS]</code>
                    <span className="ml-2 text-muted-foreground">Your relevant skills</span>
                  </div>
                  <div className="text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded">[DATE]</code>
                    <span className="ml-2 text-muted-foreground">Current date</span>
                  </div>
                </div>

                {isPremium && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium text-amber-600">Premium Variables</h4>
                      <div className="text-sm">
                        <code className="bg-amber-100 px-2 py-1 rounded">[AI_RESEARCH]</code>
                        <span className="ml-2 text-muted-foreground">AI-generated company research</span>
                      </div>
                      <div className="text-sm">
                        <code className="bg-amber-100 px-2 py-1 rounded">[PERSONALIZED_INTRO]</code>
                        <span className="ml-2 text-muted-foreground">AI personalized introduction</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Template Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Template Preview
              </CardTitle>
              <CardDescription>See how your template will look with sample data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`Dear Hiring Manager,

I am excited to apply for the Senior Frontend Developer position at TechCorp. With my extensive experience in JavaScript, React, and Frontend development, I believe I would be a valuable addition to your team.

I have been following TechCorp's innovative work in the tech industry and am particularly impressed by your recent product launches. My background in building scalable web applications aligns perfectly with your current needs.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to TechCorp's continued success.

Best regards,
[Your Name]`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
