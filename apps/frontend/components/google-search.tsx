"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  Globe, 
  Clock, 
  MapPin, 
  Building, 
  Mail, 
  ExternalLink, 
  Star, 
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Job {
  id: string
  title: string
  company: string
  location?: string
  description: string
  requirements: string[]
  salary?: string
  jobType?: string
  remote: boolean
  url: string
  source: string
  contact?: {
    email?: string
    phone?: string
    name?: string
    website?: string
  }
  postedAt: string
  scraped: {
    scrapedAt: string
    scraperId: string
    rawData?: any
  }
}

interface SearchResult {
  jobs: Job[]
  totalFound: number
  hasMore: boolean
  metadata: {
    searchParams: any
    scrapedAt: string
    scraperId: string
    platform: string
    took: number
    errors: string[]
  }
}

interface SearchParams {
  keywords: string[]
  location?: string
  searchMode: 'strict' | 'moderate' | 'loose'
  limit: number
  jobType?: string[]
  remote?: boolean
}

export function GoogleSearchComponent() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keywords: [''],
    location: '',
    searchMode: 'moderate',
    limit: 20,
    remote: false
  })
  
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStrategy, setCurrentStrategy] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchParams.keywords[0]?.trim()) {
      toast({
        title: "Keywords Required",
        description: "Please enter at least one keyword to search for jobs.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setProgress(0)
    setError(null)
    setResults(null)
    setCurrentStrategy('Initializing search...')

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 15
        })
      }, 500)

      const strategies = [
        'Direct Google search with job-specific queries',
        'Searching major job boards and company sites',
        'Content-type search for job documents',
        'Processing and analyzing results',
        'Extracting contact information'
      ]

      let strategyIndex = 0
      const strategyInterval = setInterval(() => {
        if (strategyIndex < strategies.length) {
          setCurrentStrategy(strategies[strategyIndex])
          strategyIndex++
        }
      }, 2000)

      const response = await fetch('/api/scraper/test/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: searchParams.keywords.filter(k => k.trim()),
          location: searchParams.location || undefined,
          searchMode: searchParams.searchMode,
          limit: searchParams.limit,
          remote: searchParams.remote
        })
      })

      clearInterval(progressInterval)
      clearInterval(strategyInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success === false) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.data || data)
      setCurrentStrategy('Search completed successfully!')
      
      toast({
        title: "Search Completed",
        description: `Found ${data.data?.jobs?.length || 0} jobs in ${data.metadata?.duration || 'unknown time'}`,
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      setCurrentStrategy('Search failed')
      
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...searchParams.keywords]
    newKeywords[index] = value
    setSearchParams(prev => ({ ...prev, keywords: newKeywords }))
  }

  const addKeyword = () => {
    if (searchParams.keywords.length < 5) {
      setSearchParams(prev => ({ 
        ...prev, 
        keywords: [...prev.keywords, ''] 
      }))
    }
  }

  const removeKeyword = (index: number) => {
    if (searchParams.keywords.length > 1) {
      const newKeywords = searchParams.keywords.filter((_, i) => i !== index)
      setSearchParams(prev => ({ ...prev, keywords: newKeywords }))
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRelevanceStars = (score: number) => {
    const stars = Math.round(score * 5)
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < stars ? 'fill-current text-yellow-500' : 'text-gray-300'}`} 
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Search Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Google Job Search (Entire Web)
          </CardTitle>
          <CardDescription>
            Search the entire web for job opportunities using our comprehensive multi-strategy approach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Keywords */}
          <div className="space-y-3">
            <Label>Keywords</Label>
            {searchParams.keywords.map((keyword, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Keyword ${index + 1} (e.g., "frontend developer", "react")`}
                  value={keyword}
                  onChange={(e) => handleKeywordChange(index, e.target.value)}
                  className="flex-1"
                />
                {searchParams.keywords.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeKeyword(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {searchParams.keywords.length < 5 && (
              <Button variant="outline" size="sm" onClick={addKeyword}>
                Add Keyword
              </Button>
            )}
          </div>

          {/* Search Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Location (Optional)</Label>
              <Input
                placeholder="e.g., San Francisco, Remote"
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Search Mode</Label>
              <Select 
                value={searchParams.searchMode} 
                onValueChange={(value: 'strict' | 'moderate' | 'loose') => 
                  setSearchParams(prev => ({ ...prev, searchMode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Strict (Exact matches)</SelectItem>
                  <SelectItem value="moderate">Moderate (Balanced)</SelectItem>
                  <SelectItem value="loose">Loose (Maximum coverage)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Result Limit</Label>
              <Select 
                value={searchParams.limit.toString()} 
                onValueChange={(value) => 
                  setSearchParams(prev => ({ ...prev, limit: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 results</SelectItem>
                  <SelectItem value="20">20 results</SelectItem>
                  <SelectItem value="50">50 results</SelectItem>
                  <SelectItem value="100">100 results</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Remote Work Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remote"
              checked={searchParams.remote}
              onChange={(e) => setSearchParams(prev => ({ ...prev, remote: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="remote">Include remote work opportunities</Label>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch} 
            disabled={loading || !searchParams.keywords[0]?.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Entire Web
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress and Status */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Search Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {currentStrategy}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results && (
        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">
              Jobs ({results.jobs.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="metadata">
              Search Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            {results.jobs.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or using different keywords.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              results.jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Job Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {job.company}
                            </div>
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(job.postedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.scraped.rawData?.relevanceScore && (
                            <div className="flex items-center gap-1">
                              {getRelevanceStars(job.scraped.rawData.relevanceScore)}
                              <span className={`text-sm font-medium ${getRelevanceColor(job.scraped.rawData.relevanceScore)}`}>
                                {(job.scraped.rawData.relevanceScore * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          <Badge variant={job.remote ? "default" : "secondary"}>
                            {job.remote ? "Remote" : "On-site"}
                          </Badge>
                          <Badge variant="outline">{job.source}</Badge>
                        </div>
                      </div>

                      {/* Job Details */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {job.description}
                        </p>
                        
                        {job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {job.requirements.slice(0, 5).map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                            {job.requirements.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.requirements.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Contact and Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-4">
                          {job.contact?.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              {job.contact.email}
                            </div>
                          )}
                          {job.salary && (
                            <div className="text-sm font-medium text-green-600">
                              {job.salary}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={job.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Job
                            </a>
                          </Button>
                          {job.contact?.email && (
                            <Button size="sm">
                              <Mail className="h-4 w-4 mr-1" />
                              Apply
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Search Analytics</CardTitle>
                <CardDescription>
                  Insights from your Google job search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.totalFound}</div>
                    <div className="text-sm text-muted-foreground">Total Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {results.jobs.filter(j => j.contact?.email).length}
                    </div>
                    <div className="text-sm text-muted-foreground">With Contacts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {results.jobs.filter(j => j.remote).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Remote Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(results.metadata.took / 1000)}s
                    </div>
                    <div className="text-sm text-muted-foreground">Search Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata">
            <Card>
              <CardHeader>
                <CardTitle>Search Metadata</CardTitle>
                <CardDescription>
                  Technical details about the search execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Scraper ID:</strong> {results.metadata.scraperId}
                    </div>
                    <div>
                      <strong>Platform:</strong> {results.metadata.platform}
                    </div>
                    <div>
                      <strong>Search Time:</strong> {new Date(results.metadata.scrapedAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>Duration:</strong> {Math.round(results.metadata.took / 1000)}s
                    </div>
                  </div>
                  
                  {results.metadata.errors.length > 0 && (
                    <div>
                      <strong>Errors:</strong>
                      <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                        {results.metadata.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <strong>Search Parameters:</strong>
                    <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto">
                      {JSON.stringify(results.metadata.searchParams, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 