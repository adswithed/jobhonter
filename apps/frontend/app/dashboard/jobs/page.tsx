"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  DollarSign, 
  Calendar,
  ExternalLink,
  Building,
  Mail,
  Clock,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  Archive,
  Loader2,
  AtSign,
  User,
  Shield,
  AlertCircle,
  Copy,
  RefreshCw
} from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  description?: string
  location?: string
  salary?: string
  url?: string
  source: string
  contactEmail?: string
  discoveredAt: string
  relevanceScore: number
  status: 'DISCOVERED' | 'FILTERED' | 'APPLIED' | 'REJECTED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
  applications: Array<{
    id: string
    status: string
    appliedAt: string
    emailSent: boolean
  }>
  contacts: Array<{
    id: string
    email: string
    name?: string
    verified: boolean
    priority?: 'HIGH' | 'MEDIUM' | 'LOW'
    type?: 'HR' | 'EXECUTIVE' | 'PERSONAL' | 'GENERIC'
    source?: string
    discoveredAt?: string
  }>
}

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

// Email Discovery interfaces
interface EmailDiscoveryProgress {
  stage: string
  message: string
  progress: number
  completedSteps: number
  totalSteps: number
}

interface EmailContact {
  email: string
  name?: string
  title?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  type: 'HR' | 'EXECUTIVE' | 'PERSONAL' | 'GENERIC'
  source: string
  verified: boolean
  context?: string
}

interface EmailDiscoveryResult {
  success: boolean
  contacts: EmailContact[]
  totalFound: number
  duplicatesRemoved: number
  websiteAnalyzed: boolean
  socialProfilesFound: number
  message?: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState<JobStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDiscoverDialogOpen, setIsDiscoverDialogOpen] = useState(false)

  // Form states
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    salary: '',
    url: '',
    contactEmail: ''
  })

  const [discoverParams, setDiscoverParams] = useState({
    keywords: [''],
    location: '',
    remote: false,
    jobTypes: [] as string[],
    sources: ['twitter'],
    limit: 50
  })

  // Email Discovery states
  const [emailDiscoveryJob, setEmailDiscoveryJob] = useState<Job | null>(null)
  const [isEmailDiscoveryOpen, setIsEmailDiscoveryOpen] = useState(false)
  const [emailDiscoveryProgress, setEmailDiscoveryProgress] = useState<EmailDiscoveryProgress | null>(null)
  const [isDiscoveringEmails, setIsDiscoveringEmails] = useState<Set<string>>(new Set())
  const [contactViewJob, setContactViewJob] = useState<Job | null>(null)
  const [isContactViewOpen, setIsContactViewOpen] = useState(false)

  useEffect(() => {
    fetchJobs()
    fetchStats()
  }, [searchTerm, statusFilter, sourceFilter, sortBy, sortOrder, currentPage])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(sourceFilter !== 'all' && { source: sourceFilter }),
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/jobs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setJobs(data.data.jobs)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch jobs",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

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
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const createJob = async () => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newJob)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: data.message
        })
        setIsCreateDialogOpen(false)
        setNewJob({
          title: '',
          company: '',
          description: '',
          location: '',
          salary: '',
          url: '',
          contactEmail: ''
        })
        fetchJobs()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to create job",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      })
    }
  }

  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: data.message
        })
        fetchJobs()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to update job status",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      })
    }
  }

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: data.message
        })
        fetchJobs()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete job",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      })
    }
  }

  const discoverJobs = async () => {
    try {
      const response = await fetch('/api/scraper/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...discoverParams,
          keywords: discoverParams.keywords.filter(k => k.trim())
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Discovery Complete",
          description: data.message
        })
        setIsDiscoverDialogOpen(false)
        fetchJobs()
        fetchStats()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.message || "Failed to discover jobs",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DISCOVERED': return <Eye className="h-4 w-4" />
      case 'FILTERED': return <Target className="h-4 w-4" />
      case 'APPLIED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      case 'ARCHIVED': return <Archive className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
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

  // Email Discovery Functions
  const discoverEmailsForJob = async (job: Job) => {
    setEmailDiscoveryJob(job)
    setIsEmailDiscoveryOpen(true)
    setIsDiscoveringEmails(prev => new Set(prev).add(job.id))
    
    try {
      // Start discovery process
      setEmailDiscoveryProgress({
        stage: 'Initializing',
        message: 'Starting email discovery process...',
        progress: 0,
        completedSteps: 0,
        totalSteps: 5
      })

      const response = await fetch('/api/email-discovery/discover-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          jobId: job.id,
          company: job.company,
          jobTitle: job.title,
          jobUrl: job.url,
          includeWebsiteAnalysis: true,
          includeSocialProfiles: true
        })
      })

      if (response.ok) {
        const result: EmailDiscoveryResult = await response.json()
        
        setEmailDiscoveryProgress({
          stage: 'Complete',
          message: `Found ${result.totalFound} email contacts`,
          progress: 100,
          completedSteps: 5,
          totalSteps: 5
        })

        // Update the job with new contacts
        setJobs(prevJobs => 
          prevJobs.map(j => 
            j.id === job.id 
              ? { 
                  ...j, 
                  contacts: result.contacts.map(contact => ({
                    id: `${job.id}-${contact.email}`,
                    email: contact.email,
                    name: contact.name,
                    verified: contact.verified,
                    priority: contact.priority,
                    type: contact.type,
                    source: contact.source,
                    discoveredAt: new Date().toISOString()
                  }))
                }
              : j
          )
        )

        toast({
          title: "Email Discovery Complete",
          description: `Found ${result.totalFound} contacts for ${job.company}`,
        })

        setTimeout(() => {
          setIsEmailDiscoveryOpen(false)
          setEmailDiscoveryProgress(null)
        }, 2000)

      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to discover emails')
      }
    } catch (error) {
      setEmailDiscoveryProgress({
        stage: 'Error',
        message: error instanceof Error ? error.message : 'Discovery failed',
        progress: 0,
        completedSteps: 0,
        totalSteps: 5
      })
      
      toast({
        title: "Discovery Failed",
        description: error instanceof Error ? error.message : "Failed to discover emails",
        variant: "destructive"
      })
    } finally {
      setIsDiscoveringEmails(prev => {
        const newSet = new Set(prev)
        newSet.delete(job.id)
        return newSet
      })
    }
  }

  const viewContacts = (job: Job) => {
    setContactViewJob(job)
    setIsContactViewOpen(true)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Email copied to clipboard"
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'LOW': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HR': return <User className="h-3 w-3" />
      case 'EXECUTIVE': return <Shield className="h-3 w-3" />
      case 'PERSONAL': return <AtSign className="h-3 w-3" />
      case 'GENERIC': return <Mail className="h-3 w-3" />
      default: return <Mail className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Discovery</h1>
          <p className="text-muted-foreground">
            Discover, manage, and apply to your dream jobs with AI assistance
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDiscoverDialogOpen} onOpenChange={setIsDiscoverDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Search className="mr-2 h-4 w-4" />
                Discover Jobs
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Discover New Jobs</DialogTitle>
                <DialogDescription>
                  Use AI to find job opportunities across multiple platforms
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., React Developer, Product Manager"
                    value={discoverParams.keywords.join(', ')}
                    onChange={(e) => setDiscoverParams({
                      ...discoverParams,
                      keywords: e.target.value.split(',').map(k => k.trim())
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, Remote"
                    value={discoverParams.location}
                    onChange={(e) => setDiscoverParams({
                      ...discoverParams,
                      location: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="limit">Maximum Jobs</Label>
                  <Select 
                    value={discoverParams.limit.toString()} 
                    onValueChange={(value) => setDiscoverParams({
                      ...discoverParams,
                      limit: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 jobs</SelectItem>
                      <SelectItem value="50">50 jobs</SelectItem>
                      <SelectItem value="100">100 jobs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={discoverJobs}>
                  <Search className="mr-2 h-4 w-4" />
                  Start Discovery
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Job Manually</DialogTitle>
                <DialogDescription>
                  Add a job opportunity you found manually
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="Senior Developer"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      placeholder="Acme Inc"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salary</Label>
                    <Input
                      id="salary"
                      placeholder="$120k-$150k"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="url">Job URL</Label>
                  <Input
                    id="url"
                    placeholder="https://..."
                    value={newJob.url}
                    onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    placeholder="hr@company.com"
                    value={newJob.contactEmail}
                    onChange={(e) => setNewJob({ ...newJob, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Job description..."
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={createJob}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Job
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobs.total}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.jobs.recentlyDiscovered} this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobs.applied}</div>
              <p className="text-xs text-muted-foreground">
                {stats.insights.applicationRate} application rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discovered</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobs.discovered}</div>
              <p className="text-xs text-muted-foreground">Ready for review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.insights.activityLevel}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="DISCOVERED">Discovered</SelectItem>
                <SelectItem value="FILTERED">Filtered</SelectItem>
                <SelectItem value="APPLIED">Applied</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="TWITTER">Twitter</SelectItem>
                <SelectItem value="REDDIT">Reddit</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                <SelectItem value="GOOGLE">Google</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Added</SelectItem>
                <SelectItem value="relevanceScore">Relevance</SelectItem>
                <SelectItem value="title">Job Title</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Job Opportunities</CardTitle>
          <CardDescription>
            {jobs.length} jobs found. Manage your job hunt pipeline effectively.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Start by discovering jobs or add them manually
              </p>
              <Button onClick={() => setIsDiscoverDialogOpen(true)}>
                <Search className="mr-2 h-4 w-4" />
                Discover Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <Badge variant="outline" className={getStatusColor(job.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(job.status)}
                            {job.status}
                          </span>
                        </Badge>
                        <Badge variant="secondary">{job.source}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.company}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                        )}
                        {job.salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {job.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        {job.contacts.length > 0 && (
                          <Badge variant="outline" className="text-green-600">
                            <Mail className="h-3 w-3 mr-1" />
                            Contact Available
                          </Badge>
                        )}
                        {job.relevanceScore > 0.7 && (
                          <Badge variant="outline" className="text-blue-600">
                            <Target className="h-3 w-3 mr-1" />
                            High Match
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* Email Discovery Button */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => discoverEmailsForJob(job)}
                        disabled={isDiscoveringEmails.has(job.id)}
                      >
                        {isDiscoveringEmails.has(job.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <AtSign className="h-4 w-4 mr-1" />
                        )}
                        {isDiscoveringEmails.has(job.id) ? 'Finding...' : 'Find Emails'}
                      </Button>

                      {/* View Contacts Button */}
                      {job.contacts.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewContacts(job)}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Contacts ({job.contacts.length})
                        </Button>
                      )}

                      {job.url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={job.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      
                      <Select 
                        value={job.status} 
                        onValueChange={(value) => updateJobStatus(job.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DISCOVERED">Discovered</SelectItem>
                          <SelectItem value="FILTERED">Filtered</SelectItem>
                          <SelectItem value="APPLIED">Applied</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Discovery Progress Dialog */}
      <Dialog open={isEmailDiscoveryOpen} onOpenChange={setIsEmailDiscoveryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Email Discovery in Progress</DialogTitle>
            <DialogDescription>
              Finding email contacts for {emailDiscoveryJob?.company}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {emailDiscoveryProgress && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{emailDiscoveryProgress.stage}</span>
                    <span>{emailDiscoveryProgress.completedSteps}/{emailDiscoveryProgress.totalSteps}</span>
                  </div>
                  <Progress value={emailDiscoveryProgress.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {emailDiscoveryProgress.message}
                  </p>
                </div>
                {emailDiscoveryProgress.stage === 'Complete' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Discovery completed successfully!</span>
                  </div>
                )}
                {emailDiscoveryProgress.stage === 'Error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Discovery failed</span>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Viewing Dialog */}
      <Dialog open={isContactViewOpen} onOpenChange={setIsContactViewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Contacts</DialogTitle>
            <DialogDescription>
              Found contacts for {contactViewJob?.company} - {contactViewJob?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {contactViewJob?.contacts.map((contact, index) => (
              <div key={contact.id || index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{contact.email}</span>
                      {contact.verified && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {contact.priority && (
                        <Badge variant="outline" className={getPriorityColor(contact.priority)}>
                          {contact.priority} Priority
                        </Badge>
                      )}
                      {contact.type && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTypeIcon(contact.type)}
                          {contact.type}
                        </Badge>
                      )}
                    </div>

                    {contact.name && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <User className="h-3 w-3 inline mr-1" />
                        {contact.name}
                      </p>
                    )}
                    
                    {contact.source && (
                      <p className="text-sm text-muted-foreground mb-1">
                        <Search className="h-3 w-3 inline mr-1" />
                        Found via: {contact.source}
                      </p>
                    )}

                    {contact.discoveredAt && (
                      <p className="text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Discovered: {new Date(contact.discoveredAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(contact.email)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            ))}
            
            {(!contactViewJob?.contacts || contactViewJob.contacts.length === 0) && (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No contacts found for this job</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => contactViewJob && discoverEmailsForJob(contactViewJob)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Discovery
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 