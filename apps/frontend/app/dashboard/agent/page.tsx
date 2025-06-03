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
import { X, Plus, Upload } from "lucide-react"
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

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Agent</h1>
          <p className="text-muted-foreground">Configure your job hunting AI agent</p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Preferences</CardTitle>
              <CardDescription>Tell your agent what kind of jobs you're looking for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Current Role</Label>
                <Input id="role" placeholder="e.g. Frontend Developer" defaultValue="Senior Frontend Developer" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input id="experience" type="number" defaultValue="5" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location Preference</Label>
                <Input id="location" placeholder="e.g. Remote, New York, London" defaultValue="Remote" />
              </div>

              <div className="space-y-2">
                <Label>Keywords & Skills</Label>
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
                <Label htmlFor="resume">Resume Upload</Label>
                <div className="border rounded-md p-4 flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop your resume here or click to browse</p>
                  <Input id="resume" type="file" className="hidden" />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("resume")?.click()}>
                    Upload Resume
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Behavior</CardTitle>
              <CardDescription>Control how your agent operates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="cover-letter">Generate Cover Letters</Label>
                  <p className="text-sm text-muted-foreground">
                    Let the agent create personalized cover letters for each application
                  </p>
                </div>
                <Switch id="cover-letter" defaultChecked />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="max-applications">Maximum Applications per Day</Label>
                  <span className="text-sm">{maxApplications[0]}</span>
                </div>
                <Slider
                  id="max-applications"
                  min={1}
                  max={20}
                  step={1}
                  value={maxApplications}
                  onValueChange={setMaxApplications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="frequency">Agent Frequency</Label>
                  <p className="text-sm text-muted-foreground">How often should the agent search for jobs</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant={platforms.twitter ? "default" : "outline"} size="sm">
                    Daily
                  </Button>
                  <Button variant={!platforms.twitter ? "default" : "outline"} size="sm">
                    Hourly
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Target Platforms</CardTitle>
              <CardDescription>Select where your agent should look for job opportunities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="twitter">Twitter</Label>
                  <p className="text-sm text-muted-foreground">Find opportunities from Twitter posts</p>
                </div>
                <Switch
                  id="twitter"
                  checked={platforms.twitter}
                  onCheckedChange={(checked) => setPlatforms({ ...platforms, twitter: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reddit">Reddit</Label>
                  <p className="text-sm text-muted-foreground">Find opportunities from Reddit communities</p>
                </div>
                <Switch
                  id="reddit"
                  checked={platforms.reddit}
                  onCheckedChange={(checked) => setPlatforms({ ...platforms, reddit: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <p className="text-sm text-muted-foreground">Find opportunities from LinkedIn posts</p>
                </div>
                <Switch
                  id="linkedin"
                  checked={platforms.linkedin}
                  onCheckedChange={(checked) => setPlatforms({ ...platforms, linkedin: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="google">Google</Label>
                  <p className="text-sm text-muted-foreground">Find opportunities from Google search results</p>
                </div>
                <Switch
                  id="google"
                  checked={platforms.google}
                  onCheckedChange={(checked) => setPlatforms({ ...platforms, google: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize the emails your agent will send</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-template">Base Email Template</Label>
                <Textarea
                  id="email-template"
                  rows={8}
                  placeholder="Enter your base email template..."
                  defaultValue={`Dear {hiring_manager},

I'm excited to apply for the {job_title} position at {company}. With {years_experience} years of experience in {skill_area}, I believe I would be a great fit for this role.

{custom_paragraph}

I'd love the opportunity to discuss how my background and skills align with your needs. Please feel free to reach out to me at {email} or {phone} to arrange a conversation.

Thank you for considering my application.

Best regards,
{full_name}`}
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{placeholders}"} for dynamic content that will be filled by the AI
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="follow-up-template">Follow-up Email Template</Label>
                <Textarea
                  id="follow-up-template"
                  rows={6}
                  placeholder="Enter your follow-up email template..."
                  defaultValue={`Dear {hiring_manager},

I wanted to follow up on my application for the {job_title} position that I submitted on {application_date}. I'm still very interested in the opportunity to join {company} and would appreciate any update you might have on the status of my application.

Thank you for your time and consideration.

Best regards,
{full_name}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
