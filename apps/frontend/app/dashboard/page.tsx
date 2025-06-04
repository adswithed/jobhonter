"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Bot, CheckCircle, FileText, Search, Target, Clock, TrendingUp, Eye, Mail, Building, Calendar, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

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
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<JobStats | null>(null)
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentJobs()
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

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'Hunter'}! Ready to discover your next opportunity?</p>
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
              Configure Agent
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.jobs.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats?.jobs.recentlyDiscovered || 0} this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.jobs.applied || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.insights.applicationRate || '0%'} application rate
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs Discovered</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.jobs.discovered || 0}</div>
                <p className="text-xs text-muted-foreground">Ready for review</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activity Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${activity.color}`}>{activity.level}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Job Discoveries</CardTitle>
                <CardDescription>Your most recently discovered opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recentJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No jobs discovered yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your job hunt by discovering opportunities
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/jobs">
                        <Search className="mr-2 h-4 w-4" />
                        Discover Jobs
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{job.title}</p>
                            {job.relevanceScore > 0.7 && (
                              <Badge variant="outline" className="text-blue-600">
                                <Target className="h-3 w-3 mr-1" />
                                High Match
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                          <Badge variant="outline" className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4">
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/dashboard/jobs">
                          View All Jobs
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Hunt Performance</CardTitle>
                <CardDescription>Your job hunting metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Discovery Rate</div>
                    <div className="text-sm text-muted-foreground">
                      {stats?.jobs.recentlyDiscovered || 0}/week
                    </div>
                  </div>
                  <Progress value={Math.min((stats?.jobs.recentlyDiscovered || 0) * 10, 100)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Application Rate</div>
                    <div className="text-sm text-muted-foreground">
                      {parseFloat(stats?.insights.applicationRate || '0%')}%
                    </div>
                  </div>
                  <Progress value={parseFloat(stats?.insights.applicationRate || '0%')} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Pipeline Health</div>
                    <div className="text-sm text-muted-foreground">
                      {stats?.jobs.discovered || 0} ready
                    </div>
                  </div>
                  <Progress value={Math.min((stats?.jobs.discovered || 0) * 5, 100)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Hunt Momentum</div>
                    <div className="text-sm text-muted-foreground">{activity.level}</div>
                  </div>
                  <Progress 
                    value={
                      activity.level === 'High' ? 90 : 
                      activity.level === 'Medium' ? 60 : 30
                    } 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Status Distribution</CardTitle>
                <CardDescription>Overview of your job pipeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Discovered</span>
                      </div>
                      <span className="font-medium">{stats.jobs.discovered}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Applied</span>
                      </div>
                      <span className="font-medium">{stats.jobs.applied}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Pending Response</span>
                      </div>
                      <span className="font-medium">{stats.applications.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Archived</span>
                      </div>
                      <span className="font-medium">{stats.jobs.archived}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Accelerate your job hunt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/dashboard/jobs">
                    <Search className="mr-2 h-4 w-4" />
                    Discover New Jobs
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/dashboard/applications">
                    <FileText className="mr-2 h-4 w-4" />
                    Review Applications
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/dashboard/agent">
                    <Bot className="mr-2 h-4 w-4" />
                    Configure AI Agent
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/dashboard/profile">
                    <Target className="mr-2 h-4 w-4" />
                    Update Preferences
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent job hunting activity and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your job hunt to see activity here
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/jobs">
                        <Plus className="mr-2 h-4 w-4" />
                        Start Job Hunt
                      </Link>
                    </Button>
                  </div>
                ) : (
                  recentJobs.slice(0, 4).map((job, i) => (
                    <div key={job.id} className="flex">
                      <div className="mr-4 flex items-start">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Search className="h-4 w-4" />
                        </div>
                        {i < 3 && <div className="h-full w-px bg-border mx-auto mt-3" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          New job discovered: {job.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Found at {job.company}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Mail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
