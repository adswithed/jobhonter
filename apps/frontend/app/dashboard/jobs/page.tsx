"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar,
  ExternalLink,
  Building,
  Mail,
  Loader2,
  Copy,
  Target,
  CheckCircle2,
  MessageSquare,
  Globe,
  Users,
  Zap,
  Plus,
  Eye,
  Clock,
  TrendingUp,
  Wifi,
  Database,
  Filter,
  CheckCircle
} from "lucide-react"

interface DiscoveredJob {
  id: string
  title: string
  company: string
  description?: string
  location?: string
  salary?: string
  url?: string
  source: string
  remote?: boolean
  contact?: {
    email: string
  }
  contactEmail?: string
  postedAt?: string
  redditMetadata?: {
    subreddit: string
    author: string
    ups: number
    comments: number
  }
}

interface ScrapingProgress {
  stage: string
  message: string
  progress: number
  currentStep: number
  totalSteps: number
  details?: string
}

export default function JobDiscoveryPage() {
  // Search state
  const [jobTitle, setJobTitle] = useState('')
  const [location, setLocation] = useState('')
  const [source, setSource] = useState('reddit')
  const [searchMode, setSearchMode] = useState<'strict' | 'moderate' | 'loose'>('moderate')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [maxDaysOld, setMaxDaysOld] = useState(7)
  const [onlyHiring, setOnlyHiring] = useState(true)
  
  // Results state
  const [loading, setLoading] = useState(false)
  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJob[]>([])
  const [searchResults, setSearchResults] = useState<any>(null)
  
  // Real-time progress state
  const [scrapingProgress, setScrapingProgress] = useState<ScrapingProgress | null>(null)
  const [showProgress, setShowProgress] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const sessionIdRef = useRef<string>('')

  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Connect to real-time progress feed
  const connectToProgressFeed = (sessionId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    console.log('🔌 Connecting to progress feed:', sessionId)
    
    const eventSource = new EventSource(`http://localhost:3001/api/scraper/progress/${sessionId}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📡 Progress update received:', data)

        if (data.type === 'connected') {
          console.log('✅ Connected to real-time feed')
        } else if (data.type === 'progress') {
          setScrapingProgress({
            stage: data.stage,
            message: data.message,
            progress: data.progress,
            currentStep: Math.floor(data.progress / 14.28), // Rough estimate
            totalSteps: 7,
            details: data.details
          })
        } else if (data.type === 'complete') {
          setScrapingProgress({
            stage: 'complete',
            message: '🎉 Search completed successfully!',
            progress: 100,
            currentStep: 7,
            totalSteps: 7,
            details: 'Ready to display results'
          })
        }
      } catch (error) {
        console.error('Failed to parse SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      eventSource.close()
    }

    return eventSource
  }

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const discoverJobs = async () => {
    if (!jobTitle.trim()) {
      toast({
        title: "Job Title Required",
        description: "Please enter a job title to search for opportunities",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setShowProgress(true)
    setDiscoveredJobs([]) // Clear previous results
    setSearchResults(null)
    
    // Generate session ID for this search
    const sessionId = generateSessionId()
    sessionIdRef.current = sessionId
    
    // Connect to real-time progress feed
    connectToProgressFeed(sessionId)

    try {
      const endpoint = source === 'reddit' ? 'http://localhost:3001/api/scraper/test-reddit' : 'http://localhost:3001/api/scraper/test-discover'
      
      console.log('🔍 Starting job search with:', {
        endpoint,
        keywords: [jobTitle.trim()],
        location: location.trim() || undefined,
        remote: remoteOnly,
        limit: 20,
        sessionId // Include session ID for backend progress tracking
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keywords: [jobTitle.trim()],
          location: location.trim() || undefined,
          remote: remoteOnly,
          limit: 20,
          sessionId, // Send session ID to backend
          maxDaysOld, // Date filter
          onlyHiring, // Smart hiring filter
          searchMode
        })
      })

      console.log('📡 API Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('📊 API Response data:', data)
        
        const jobs = data.data?.jobs || data.jobs || []
        console.log('💼 Jobs extracted:', jobs.length, jobs)
        
        setDiscoveredJobs(jobs)
        setSearchResults(data.data || data)
        
        // Debug logging to see the actual structure
        console.log('🔧 Full API response:', data)
        console.log('🔧 Stored searchResults:', data.data || data)
        console.log('🔧 resultSets:', (data.data || data)?.resultSets)
        
        const contactJobs = jobs.filter((job: DiscoveredJob) => job.contact?.email || job.contactEmail)
        
        toast({
          title: "🎉 Jobs Found!",
          description: `Found ${jobs.length} jobs, ${contactJobs.length} with direct contact info`,
          duration: 5000,
        })
        
        console.log('✅ Search completed successfully')
      } else {
        const errorText = await response.text()
        console.error('❌ API Error:', response.status, errorText)
        
        toast({
          title: "Search Failed",
          description: `API returned ${response.status}: ${errorText}`,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('🚨 Network error:', error)
      toast({
        title: "Network Error",
        description: `Connection failed: ${error}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      
      // Close SSE connection after a delay
      setTimeout(() => {
        if (eventSourceRef.current) {
          console.log('🔌 Closing SSE connection')
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }
        setShowProgress(false)
        setScrapingProgress(null)
      }, 3000) // Show completion for 3 seconds
    }
  }

  // Helper functions
  const copyToClipboard = async (text: string, label: string = 'text') => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: `✅ ${label} copied!`,
        description: `${text} has been copied to your clipboard`,
      })
    } catch (err) {
      console.error('Failed to copy text: ', err)
      toast({
        title: "Copy failed",
        description: "Please copy the email manually",
        variant: "destructive"
      })
    }
  }

  const getContactEmail = (job: DiscoveredJob) => {
    return job.contact?.email || job.contactEmail
  }

  const formatSalary = (salary?: string) => {
    return salary?.replace(/^\$/, '') || null
  }

  const formatPostingDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Job Card Component
  const JobCard = ({ job, showRelevanceScore = false }: { job: DiscoveredJob, showRelevanceScore?: boolean }) => {
    const contactEmail = getContactEmail(job)
    const cleanSalary = formatSalary(job.salary)
    
    return (
      <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all">
        <div className="space-y-4">
          {/* Job Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                {contactEmail && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    📧 Contact Available
                  </Badge>
                )}
                {job.remote && (
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    🏠 Remote
                  </Badge>
                )}
                {showRelevanceScore && (job as any).relevanceScore && (
                  <Badge className="bg-purple-100 text-purple-800">
                    {(((job as any).relevanceScore * 100).toFixed(0))}% relevant
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1 font-medium">
                  <Building className="h-4 w-4" />
                  {job.company}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}
                {cleanSalary && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {cleanSalary}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right space-y-1">
              <Badge variant="secondary" className="text-xs">
                {job.source?.toUpperCase() || 'REDDIT'}
              </Badge>
              {job.postedAt && (
                <div className="text-xs text-gray-500">
                  📅 {formatPostingDate(job.postedAt)}
                </div>
              )}
            </div>
          </div>

          {/* Contact Email Section */}
          {contactEmail && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">✉️ Direct Contact Found</p>
                  <p className="text-green-700 font-mono text-lg">{contactEmail}</p>
                  <p className="text-green-600 text-sm">Copy this email for direct outreach to the hiring manager</p>
                </div>
                <Button
                  onClick={() => copyToClipboard(contactEmail, 'Email address')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Email
                </Button>
              </div>
            </div>
          )}

          {/* Job Metadata */}
          <div className="flex items-center gap-6 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            {job.redditMetadata && (
              <>
                <span className="font-medium">r/{job.redditMetadata.subreddit}</span>
                <span>👆 {job.redditMetadata.ups} upvotes</span>
                <span>💬 {job.redditMetadata.comments} comments</span>
                <span>👤 u/{job.redditMetadata.author}</span>
              </>
            )}
            {job.postedAt && (
              <span className="ml-auto font-medium text-blue-600">
                📅 {(() => {
                  const date = new Date(job.postedAt)
                  const now = new Date()
                  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
                  const diffInDays = Math.floor(diffInHours / 24)
                  
                  if (diffInHours < 1) return '🔥 Just posted'
                  if (diffInHours < 24) return `🔥 ${diffInHours}h ago`
                  if (diffInDays === 1) return 'Yesterday'
                  if (diffInDays < 7) return `${diffInDays} days ago`
                  return date.toLocaleDateString()
                })()}
              </span>
            )}
          </div>

          {/* Job Description Preview */}
          {job.description && (
            <div className="border-t pt-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                {job.description.length > 300 
                  ? `${job.description.substring(0, 300)}...` 
                  : job.description
                }
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {job.url && (
              <Button variant="outline" asChild>
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original Post
                </a>
              </Button>
            )}
            
            {!contactEmail && (
              <div className="text-sm text-gray-500 italic">
                No direct contact found - consider reaching out via the original post
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">🚀 Job Discovery Engine</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find job opportunities with direct hiring manager contacts. No job boards, no applications forms - just direct outreach.
        </p>
      </div>

      {/* Search Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Search for Opportunities
          </CardTitle>
          <CardDescription>
            Enter your target job title and we'll find fresh opportunities with contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title *</label>
              <Input
                placeholder="e.g. Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="e.g. San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">🎯 Search Mode</label>
              <select 
                value={searchMode} 
                onChange={(e) => setSearchMode(e.target.value as 'strict' | 'moderate' | 'loose')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background"
                disabled={loading}
              >
                <option value="strict">🎯 Strict (Exact matches)</option>
                <option value="moderate">⚖️ Moderate (Balanced)</option>
                <option value="loose">🔍 Loose (Broad discovery)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select 
                value={source} 
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background"
                disabled={loading}
              >
                <option value="reddit">🔴 Reddit (Best Results)</option>
                <option value="twitter">🐦 Twitter</option>
                <option value="linkedin">💼 LinkedIn</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="invisible">Search</label>
              <Button 
                onClick={discoverJobs} 
                disabled={loading || !jobTitle.trim()}
                className="w-full h-10"
                size="default"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Jobs
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700">🎯 Smart Filters</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">📅 Maximum Age</label>
                <select 
                  value={maxDaysOld} 
                  onChange={(e) => setMaxDaysOld(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background"
                  disabled={loading}
                >
                  <option value={1}>Today only</option>
                  <option value={3}>Last 3 days</option>
                  <option value={7}>Last week (Default)</option>
                  <option value={14}>Last 2 weeks</option>
                  <option value={30}>Last month</option>
                </select>
              </div>

              {/* Post Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">🏢 Post Type</label>
                <select 
                  value={onlyHiring ? 'hiring' : 'all'} 
                  onChange={(e) => setOnlyHiring(e.target.value === 'hiring')}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background"
                  disabled={loading}
                >
                  <option value="hiring">Hiring posts only (Recommended)</option>
                  <option value="all">All posts (including freelancers)</option>
                </select>
              </div>

              {/* Remote Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">🌍 Work Type</label>
                <div className="flex items-center space-x-2 h-10">
                  <input
                    type="checkbox"
                    id="remoteOnly"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="rounded"
                    disabled={loading}
                  />
                  <label htmlFor="remoteOnly" className="text-sm">
                    Remote jobs only
                  </label>
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">Active filters:</span> 
              <span className="ml-1">
                {searchMode === 'strict' && '🎯 Strict mode (exact matches only)'}
                {searchMode === 'moderate' && '⚖️ Moderate mode (balanced approach)'}
                {searchMode === 'loose' && '🔍 Loose mode (broad discovery)'}
                 • Jobs posted within {maxDaysOld === 1 ? 'today' : `${maxDaysOld} days`}
                {onlyHiring && ' • Only companies hiring (excludes freelancer posts)'}
                {remoteOnly && ' • Remote positions only'}
              </span>
            </div>
          </div>

          {/* Search Mode Info Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">🎯 Search Mode Guide</h4>
            <div className="text-xs text-blue-700 space-y-1">
              {searchMode === 'strict' && (
                <div>
                  <span className="font-medium">🎯 Strict Mode:</span> Only shows jobs with exact keyword matches. 
                  Best for specific role hunting with zero false positives. Requires 80% relevance.
                </div>
              )}
              {searchMode === 'moderate' && (
                <div>
                  <span className="font-medium">⚖️ Moderate Mode:</span> Includes synonyms and related terms (e.g., "js" for "javascript"). 
                  Balanced approach perfect for general job searching. Requires 40% relevance.
                </div>
              )}
              {searchMode === 'loose' && (
                <div>
                  <span className="font-medium">🔍 Loose Mode:</span> Broad discovery including category matches and variations. 
                  Great for exploring opportunities and finding hidden gems. Requires 20% relevance.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Scraping Progress */}
      {showProgress && scrapingProgress && (
        <Card className="max-w-4xl mx-auto border-blue-200 bg-blue-50">
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-900">
                  {scrapingProgress.message}
                </h3>
                <span className="text-sm text-blue-700">
                  Stage {scrapingProgress.currentStep}/{scrapingProgress.totalSteps}
                </span>
              </div>
              
              <Progress 
                value={scrapingProgress.progress} 
                className="w-full h-3"
              />
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600">{scrapingProgress.details}</span>
                <span className="text-blue-700 font-medium">
                  {scrapingProgress.progress}%
                </span>
              </div>

              {/* Progress Icons */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                  scrapingProgress.progress >= 20 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Wifi className="h-3 w-3" />
                  Connect
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                  scrapingProgress.progress >= 50 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Filter className="h-3 w-3" />
                  Filter
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                  scrapingProgress.progress >= 70 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Mail className="h-3 w-3" />
                  Extract
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                  scrapingProgress.progress >= 100 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <CheckCircle className="h-3 w-3" />
                  Complete
                </div>
              </div>

              {/* Live Connection Status */}
              <div className="flex items-center justify-center gap-2 text-xs text-blue-600 bg-blue-100 rounded-full py-2 px-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live connection to backend scraper • Session: {sessionIdRef.current.slice(-8)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="max-w-4xl mx-auto border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <h4 className="font-medium text-yellow-800 mb-2">🔧 Debug Info</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>Jobs found: {discoveredJobs.length}</p>
              <p>Backend endpoint: {source === 'reddit' ? '/api/scraper/test-reddit' : '/api/scraper/test-discover'}</p>
              <p>Search params: {JSON.stringify({ jobTitle, location, source, remoteOnly, maxDaysOld, onlyHiring, searchMode })}</p>
              <p>Session ID: {sessionIdRef.current}</p>
              <p>SSE Status: {eventSourceRef.current ? 'Connected' : 'Disconnected'}</p>
              {searchResults && (
                <p>API response keys: {Object.keys(searchResults).join(', ')}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results with Tabs */}
      {discoveredJobs.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Search Results Analysis
                </span>
                {searchResults?.analysis && (
                  <div className="text-sm text-muted-foreground">
                    {searchResults.analysis.contactRate} with direct contacts
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                Compare results at each stage of the filtering process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="filtered" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="filtered" className="text-sm">
                    Final Results ({searchResults?.resultSets?.jobsAfterFiltering?.count || discoveredJobs.length})
                  </TabsTrigger>
                  <TabsTrigger value="jobs" className="text-sm">
                    Jobs Found ({searchResults?.resultSets?.jobsFound?.count || 'N/A'})
                  </TabsTrigger>
                  <TabsTrigger value="total" className="text-sm">
                    Total Posts ({searchResults?.resultSets?.totalFound?.count || 'N/A'})
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Final Filtered Results (Current View) */}
                <TabsContent value="filtered" className="space-y-4 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">📋 Final Filtered Results</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchResults?.resultSets?.jobsAfterFiltering?.description || 'Jobs after all filters applied'}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {discoveredJobs.length} jobs
                    </Badge>
                  </div>
                  
                  <div className="space-y-6">
                    {discoveredJobs.map((job, index) => (
                      <JobCard key={`filtered-${job.id}-${index}`} job={job} />
                    ))}
                  </div>
                </TabsContent>

                {/* Tab 2: All Jobs Found (Before Final Filtering) */}
                <TabsContent value="jobs" className="space-y-4 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">🎯 All Jobs Identified</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchResults?.resultSets?.jobsFound?.description || 'All posts identified as job opportunities (before relevance filtering)'}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {searchResults?.resultSets?.jobsFound?.count || 0} jobs
                    </Badge>
                  </div>
                  
                  <div className="space-y-6">
                    {searchResults?.resultSets?.jobsFound?.data?.map((job: any, index: number) => (
                      <JobCard key={`jobs-${job.id}-${index}`} job={job} showRelevanceScore={true} />
                    )) || (
                      <div className="text-center py-8 text-muted-foreground">
                        No job data available for this tab
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 3: Total Posts Found (Raw Reddit Posts) */}
                <TabsContent value="total" className="space-y-4 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">🌐 Total Posts Found</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchResults?.resultSets?.totalFound?.description || 'Raw posts found from Reddit (before job identification)'}
                      </p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      {searchResults?.resultSets?.totalFound?.count || 0} posts
                    </Badge>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> This tab shows the raw count of posts found from Reddit. 
                      These posts are then analyzed to identify job opportunities and filtered for relevance.
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Search Coverage</h4>
                      <p className="text-sm text-muted-foreground">
                        Total Reddit posts found: {searchResults?.resultSets?.totalFound?.count || 0}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Job Identification Rate</h4>
                      <p className="text-sm text-muted-foreground">
                        {searchResults?.resultSets?.totalFound?.count > 0 
                          ? `${((searchResults?.resultSets?.jobsFound?.count / searchResults?.resultSets?.totalFound?.count) * 100).toFixed(1)}%`
                          : '0%'
                        } of posts identified as jobs
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Final Filter Rate</h4>
                      <p className="text-sm text-muted-foreground">
                        {searchResults?.resultSets?.jobsFound?.count > 0 
                          ? `${((searchResults?.resultSets?.jobsAfterFiltering?.count / searchResults?.resultSets?.jobsFound?.count) * 100).toFixed(1)}%`
                          : '0%'
                        } passed final filters
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && !showProgress && discoveredJobs.length === 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-blue-50 rounded-full">
                <Search className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold">Ready to Find Your Next Job?</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter a job title above to discover opportunities with direct hiring manager contacts. 
              We'll search across Reddit, Twitter, and LinkedIn for the freshest postings.
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-500 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Direct emails discovered</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>No job board limitations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Fresh opportunities daily</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 