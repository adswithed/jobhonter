"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Bot, CheckCircle, FileText, Search, Target, Clock, TrendingUp, Eye, Mail, Building, Calendar, Plus, 
  Crown, Lock, Zap, Users, Globe, Twitter, MessageSquare, Linkedin, 
  ArrowRight, PlayCircle, Settings, BarChart3, Briefcase, Send, 
  CheckCircle2, AlertCircle, RefreshCw, Star, Trophy, Rocket, AtSign
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"
import { GoogleSearchComponent } from "@/components/google-search"

interface JobStats {
  jobs: {
    total: number
    discovered: number
    applied: number
    rejected: number
    archived: number
    recentlyDiscovered: number
  }
  applications: {
    total: number
    pending: number
    rate: number
  }
  insights: {
    applicationRate: string
    weeklyDiscovery: number
    activityLevel: string
  }
}

interface RecentJob {
  id: string
  title: string
  company: string
  status: string
  createdAt: string
  relevanceScore: number
  source: string
  contactEmail?: string
}

interface AIAgentStatus {
  isActive: boolean
  lastRun: string
  nextRun: string
  tasksCompleted: number
  currentTask?: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<JobStats | null>(null)
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [loading, setLoading] = useState(true)
  const [agentStatus, setAgentStatus] = useState<AIAgentStatus | null>(null)
  const [isPremium] = useState(false) // This will be dynamic based on user subscription

  useEffect(() => {
    fetchStats()
    fetchRecentJobs()
    fetchAgentStatus()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/jobs/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      } else {
        console.error('Failed to fetch stats')
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchRecentJobs = async () => {
    try {
      const response = await fetch('/api/jobs?limit=5&sortBy=createdAt&sortOrder=desc', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecentJobs(data.data.jobs)
      } else {
        console.error('Failed to fetch recent jobs')
      }
    } catch (error) {
      console.error('Failed to fetch recent jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAgentStatus = async () => {
    // Mock AI agent status for demo
    setAgentStatus({
      isActive: false,
      lastRun: '2024-01-15T10:30:00Z',
      nextRun: '2024-01-16T10:30:00Z',
      tasksCompleted: 12,
      currentTask: 'Discovering jobs on LinkedIn...'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISCOVERED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'FILTERED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'APPLIED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getActivityLevel = () => {
    if (!stats) return { level: 'Low', color: 'text-red-500' }
    
    if (stats.insights.activityLevel === 'High') {
      return { level: 'High', color: 'text-green-500' }
    } else if (stats.insights.activityLevel === 'Medium') {
      return { level: 'Medium', color: 'text-yellow-500' }
    } else {
      return { level: 'Low', color: 'text-red-500' }
    }
  }

  const activity = getActivityLevel()

  const PremiumFeatureCard = ({ children, title, description }: { children: React.ReactNode, title: string, description: string }) => (
    <Card className="relative overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
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
        <div className="mt-4 pt-4 border-t border-amber-200">
          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" size="sm">
            <Rocket className="mr-2 h-4 w-4" />
            Upgrade to Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Job Hunter Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || 'Hunter'}! Your AI-powered job application automation system is ready. 🚀
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/jobs">
              <Search className="mr-2 h-4 w-4" />
              Discover Jobs
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/agent">
          <Bot className="mr-2 h-4 w-4" />
              AI Agent
            </Link>
        </Button>
        </div>
      </div>

      {/* Plan Status */}
      <Alert className={`border-l-4 ${isPremium ? 'border-amber-500 bg-amber-50 dark:bg-amber-950' : 'border-blue-500 bg-blue-50 dark:bg-blue-950'}`}>
        <div className="flex items-center gap-2">
          {isPremium ? <Crown className="h-4 w-4 text-amber-600" /> : <Globe className="h-4 w-4 text-blue-600" />}
          <AlertDescription className="flex items-center justify-between w-full">
            <span>
              {isPremium ? '🎉 Premium Plan Active - Full AI automation enabled!' : '🌟 Open Source Plan - Core features available, upgrade for AI automation!'}
            </span>
            {!isPremium && (
              <Button size="sm" className="ml-4">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Now
              </Button>
            )}
          </AlertDescription>
        </div>
      </Alert>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="google-search">Google Search</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs Discovered</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{stats?.jobs.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.jobs.recentlyDiscovered || 0} this week
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                <Send className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">{stats?.jobs.applied || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.insights.applicationRate || '0%'} success rate
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emails Found</CardTitle>
                <Mail className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">{stats?.jobs.discovered || 0}</div>
                <p className="text-xs text-muted-foreground">Ready for outreach</p>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${activity.color}`}>{activity.level}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Job Discovery */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Job Discovery Engine
                </CardTitle>
                <CardDescription>
                  Search across Twitter, Reddit, LinkedIn, and Google for fresh opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Twitter className="h-4 w-4" />
                  <MessageSquare className="h-4 w-4" />
                  <Linkedin className="h-4 w-4" />
                  <Globe className="h-4 w-4" />
                  <span>Multi-platform search</span>
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard/jobs">
                    <Search className="mr-2 h-4 w-4" />
                    Start Job Discovery
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Email Discovery */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-600" />
                  Email Discovery
                </CardTitle>
                <CardDescription>
                  Find hiring manager emails and company contacts automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>AI-powered email extraction</span>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard/jobs?tab=email-discovery">
                    <AtSign className="mr-2 h-4 w-4" />
                    Discover Emails
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Application Tracking */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Application Tracker
                </CardTitle>
                <CardDescription>
                  Monitor your applications and track responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{stats?.applications.pending || 0} pending responses</span>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard/applications">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Applications
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Jobs Discovered
                </CardTitle>
                <CardDescription>Latest opportunities found by your search agents</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : recentJobs.length > 0 ? (
                  <div className="space-y-3">
                    {recentJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/dashboard/jobs">
                        View All Jobs <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    </div>
                ) : (
                  <div className="text-center py-6">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No jobs discovered yet</p>
                    <Button asChild className="mt-2">
                      <Link href="/dashboard/jobs">
                        Start Job Discovery
                      </Link>
                    </Button>
                </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
                <CardDescription>Your job hunting performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Application Success Rate</span>
                    <span className="text-sm font-medium">{stats?.insights.applicationRate || '0%'}</span>
                  </div>
                  <Progress value={parseFloat(stats?.insights.applicationRate || '0')} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Jobs Discovered This Week</span>
                    <span className="text-sm font-medium">{stats?.insights.weeklyDiscovery || 0}</span>
                  </div>
                  <Progress value={(stats?.insights.weeklyDiscovery || 0) * 2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Response Rate</span>
                    <span className="text-sm font-medium">12%</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="google-search" className="space-y-6">
          <GoogleSearchComponent />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Open Source Features */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Open Source Features
                </CardTitle>
                <CardDescription>Core job hunting tools available to everyone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Manual job discovery across platforms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic email pattern matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Simple email templates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Application tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic analytics</span>
                  </div>
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard/jobs">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Manual Search
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium AI Features */}
            <PremiumFeatureCard 
              title="AI-Powered Automation" 
              description="Full autonomous job application system with AI agents"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Autonomous job discovery AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Smart email discovery & verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">AI-generated personalized applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Automated resume tailoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Smart follow-up sequences</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Advanced analytics & insights</span>
                </div>
              </div>
            </PremiumFeatureCard>
          </div>

          {/* AI Agent Status */}
          <Card className={`${isPremium ? 'border-green-200' : 'border-gray-200 opacity-60'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className={`h-5 w-5 ${isPremium ? 'text-green-600' : 'text-gray-400'}`} />
                AI Agent Status
                {!isPremium && <Lock className="h-4 w-4 text-gray-400" />}
              </CardTitle>
              <CardDescription>
                {isPremium ? 'Your AI assistant is ready to automate your job search' : 'Upgrade to Premium to activate AI automation'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${agentStatus?.isActive ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-sm">
                      {agentStatus?.isActive ? 'Agent is active and running' : 'Agent is idle'}
                    </span>
                  </div>
                  {agentStatus?.currentTask && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium">Current Task:</p>
                      <p className="text-sm text-muted-foreground">{agentStatus.currentTask}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Tasks Completed Today</p>
                      <p className="text-2xl font-bold text-green-600">{agentStatus?.tasksCompleted || 0}</p>
                    </div>
                    <div>
                      <p className="font-medium">Next Scheduled Run</p>
                      <p className="text-sm text-muted-foreground">
                        {agentStatus?.nextRun ? new Date(agentStatus.nextRun).toLocaleString() : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/agent">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure AI Agent
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">AI Agent is locked in Open Source plan</p>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Crown className="mr-2 h-4 w-4" />
                    Unlock AI Automation
                  </Button>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Sources</CardTitle>
                <CardDescription>Jobs discovered by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Twitter</span>
                    </div>
                    <Badge variant="secondary">45</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-700" />
                      <span className="text-sm">LinkedIn</span>
                    </div>
                    <Badge variant="secondary">32</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Reddit</span>
                    </div>
                    <Badge variant="secondary">28</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Google</span>
                    </div>
                    <Badge variant="secondary">15</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Pipeline</CardTitle>
                <CardDescription>Current status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Discovered</span>
                    <Badge className="bg-blue-100 text-blue-800">{stats?.jobs.discovered || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Applied</span>
                    <Badge className="bg-green-100 text-green-800">{stats?.jobs.applied || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{stats?.applications.pending || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rejected</span>
                    <Badge className="bg-red-100 text-red-800">{stats?.jobs.rejected || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isPremium ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Success Metrics
                  </CardTitle>
                  <CardDescription>Premium analytics insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Interview Rate</span>
                      <Badge className="bg-green-100 text-green-800">8.5%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Rate</span>
                      <Badge className="bg-blue-100 text-blue-800">12.3%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Best Performing Day</span>
                      <Badge variant="secondary">Tuesday</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg. Response Time</span>
                      <Badge variant="secondary">3.2 days</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PremiumFeatureCard 
                title="Advanced Analytics" 
                description="Detailed insights and performance metrics"
              >
                <div className="space-y-3 opacity-60">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Interview Rate</span>
                    <Badge className="bg-gray-100 text-gray-600">•••</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Rate</span>
                    <Badge className="bg-gray-100 text-gray-600">•••</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Best Times</span>
                    <Badge className="bg-gray-100 text-gray-600">•••</Badge>
                  </div>
                </div>
              </PremiumFeatureCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity Feed
              </CardTitle>
              <CardDescription>Latest actions and updates from your job hunting activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock activity data */}
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Application sent to TechCorp</p>
                    <p className="text-xs text-muted-foreground">Senior Frontend Developer • 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">15 new jobs discovered</p>
                    <p className="text-xs text-muted-foreground">From Twitter and LinkedIn • 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="h-2 w-2 bg-purple-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Email contacts found for 8 jobs</p>
                    <p className="text-xs text-muted-foreground">Email discovery completed • 6 hours ago</p>
                  </div>
                      </div>
                <div className="flex items-start gap-3 pb-3 border-b">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Response received from StartupXYZ</p>
                    <p className="text-xs text-muted-foreground">Product Manager position • 1 day ago</p>
                    </div>
                    </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-gray-400 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Job search agent configured</p>
                    <p className="text-xs text-muted-foreground">Search parameters updated • 2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


