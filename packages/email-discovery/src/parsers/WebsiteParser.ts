import axios from 'axios'
import * as cheerio from 'cheerio'
import { WebsiteAnalysis, IWebsiteParser, EmailSource } from '../types'
import { EmailExtractor } from '../utils/EmailExtractor'

export class WebsiteParser implements IWebsiteParser {
  private readonly timeout: number
  private readonly userAgent: string
  
  constructor(timeout = 10000, userAgent = 'JobHonter/1.0 (Email Discovery Bot)') {
    this.timeout = timeout
    this.userAgent = userAgent
  }

  /**
   * Parse a website and extract comprehensive information
   */
  async parseWebsite(url: string): Promise<WebsiteAnalysis> {
    const startTime = Date.now()
    
    try {
      // Normalize URL
      const normalizedUrl = this.normalizeUrl(url)
      
      // Fetch the main page
      const response = await axios.get(normalizedUrl, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        maxRedirects: 3
      })

      const $ = cheerio.load(response.data)
      
      // Extract basic information
      const title = $('title').text().trim()
      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || ''

      // Extract emails from the main page
      const source: EmailSource = {
        type: 'webpage',
        url: normalizedUrl,
        confidence: 0.8,
        extractedAt: new Date(),
        method: 'Website parsing'
      }
      
      const emailContacts = EmailExtractor.extractFromHtml(response.data, source)
      const emails = emailContacts.map(contact => contact.email)

      // Find various types of links
      const contactLinks = this.findContactLinks($, normalizedUrl)
      const socialLinks = this.findSocialLinks($)
      const teamPageLinks = this.findTeamPageLinks($, normalizedUrl)
      const aboutPageLinks = this.findAboutPageLinks($, normalizedUrl)
      
      // Check for contact forms
      const hasContactForm = this.hasContactForm($)
      
      // Extract company information
      const companyInfo = this.extractCompanyInfo($, title)

      const analysis: WebsiteAnalysis = {
        url: normalizedUrl,
        title,
        description,
        emails,
        contactLinks,
        socialLinks,
        teamPageLinks,
        aboutPageLinks,
        hasContactForm,
        companyInfo
      }

      console.log(`Website analysis completed for ${normalizedUrl} in ${Date.now() - startTime}ms`)
      
      return analysis
      
    } catch (error) {
      console.error(`Error parsing website ${url}:`, error)
      
      // Return minimal analysis on error
      return {
        url,
        emails: [],
        contactLinks: [],
        socialLinks: [],
        teamPageLinks: [],
        aboutPageLinks: [],
        hasContactForm: false,
        companyInfo: {}
      }
    }
  }

  /**
   * Find contact pages from the main website
   */
  async findContactPages(baseUrl: string): Promise<string[]> {
    try {
      const normalizedUrl = this.normalizeUrl(baseUrl)
      const response = await axios.get(normalizedUrl, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      })

      const $ = cheerio.load(response.data)
      const contactUrls = this.findContactLinks($, normalizedUrl)
      
      // Add common contact page patterns
      const commonContactPaths = [
        '/contact', '/contact-us', '/contact.html', '/contact.php',
        '/about', '/about-us', '/about.html', '/team', '/people',
        '/careers', '/jobs', '/hiring', '/hr'
      ]
      
      const baseUrlObj = new URL(normalizedUrl)
      for (const path of commonContactPaths) {
        const contactUrl = `${baseUrlObj.origin}${path}`
        if (!contactUrls.includes(contactUrl)) {
          // Test if URL exists
          try {
            await axios.head(contactUrl, { timeout: 5000 })
            contactUrls.push(contactUrl)
          } catch {
            // URL doesn't exist, skip
          }
        }
      }

      return contactUrls
      
    } catch (error) {
      console.error(`Error finding contact pages for ${baseUrl}:`, error)
      return []
    }
  }

  /**
   * Extract emails from a specific page
   */
  async extractEmailsFromPage(url: string): Promise<string[]> {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: { 'User-Agent': this.userAgent }
      })

      const source: EmailSource = {
        type: 'contact_page',
        url,
        confidence: 0.9,
        extractedAt: new Date(),
        method: 'Contact page parsing'
      }

      const emailContacts = EmailExtractor.extractFromHtml(response.data, source)
      return emailContacts.map(contact => contact.email)
      
    } catch (error) {
      console.error(`Error extracting emails from ${url}:`, error)
      return []
    }
  }

  /**
   * Normalize URL to ensure consistent format
   */
  private normalizeUrl(url: string): string {
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      
      const urlObj = new URL(url)
      return urlObj.href
    } catch {
      // If URL is invalid, try with https prefix
      try {
        return new URL('https://' + url).href
      } catch {
        throw new Error(`Invalid URL: ${url}`)
      }
    }
  }

  /**
   * Find contact-related links
   */
  private findContactLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const contactKeywords = [
      'contact', 'contact-us', 'contact_us', 'get-in-touch', 'reach-us',
      'about', 'about-us', 'team', 'people', 'staff', 'leadership',
      'careers', 'jobs', 'hiring', 'hr', 'human-resources'
    ]
    
    const links: string[] = []
    const baseUrlObj = new URL(baseUrl)
    
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')
      const text = $(element).text().toLowerCase().trim()
      
      if (!href) return
      
      // Check if link text or href contains contact keywords
      const isContactLink = contactKeywords.some(keyword => 
        text.includes(keyword) || href.toLowerCase().includes(keyword)
      )
      
      if (isContactLink) {
        try {
          let fullUrl: string
          if (href.startsWith('http')) {
            fullUrl = href
          } else if (href.startsWith('/')) {
            fullUrl = `${baseUrlObj.origin}${href}`
          } else {
            fullUrl = `${baseUrlObj.origin}/${href}`
          }
          
          if (!links.includes(fullUrl)) {
            links.push(fullUrl)
          }
        } catch {
          // Invalid URL, skip
        }
      }
    })
    
    return links
  }

  /**
   * Find social media links
   */
  private findSocialLinks($: cheerio.CheerioAPI): string[] {
    const socialDomains = [
      'linkedin.com', 'twitter.com', 'facebook.com', 'instagram.com',
      'youtube.com', 'github.com', 'medium.com', 'tiktok.com'
    ]
    
    const links: string[] = []
    
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')
      if (!href) return
      
      for (const domain of socialDomains) {
        if (href.includes(domain)) {
          if (!links.includes(href)) {
            links.push(href)
          }
          break
        }
      }
    })
    
    return links
  }

  /**
   * Find team/people page links
   */
  private findTeamPageLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const teamKeywords = ['team', 'people', 'staff', 'leadership', 'management', 'executives', 'founders']
    
    const links: string[] = []
    const baseUrlObj = new URL(baseUrl)
    
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')
      const text = $(element).text().toLowerCase().trim()
      
      if (!href) return
      
      const isTeamLink = teamKeywords.some(keyword => 
        text.includes(keyword) || href.toLowerCase().includes(keyword)
      )
      
      if (isTeamLink) {
        try {
          let fullUrl: string
          if (href.startsWith('http')) {
            fullUrl = href
          } else if (href.startsWith('/')) {
            fullUrl = `${baseUrlObj.origin}${href}`
          } else {
            fullUrl = `${baseUrlObj.origin}/${href}`
          }
          
          if (!links.includes(fullUrl)) {
            links.push(fullUrl)
          }
        } catch {
          // Invalid URL, skip
        }
      }
    })
    
    return links
  }

  /**
   * Find about page links
   */
  private findAboutPageLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const aboutKeywords = ['about', 'about-us', 'company', 'our-story', 'mission', 'vision']
    
    const links: string[] = []
    const baseUrlObj = new URL(baseUrl)
    
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href')
      const text = $(element).text().toLowerCase().trim()
      
      if (!href) return
      
      const isAboutLink = aboutKeywords.some(keyword => 
        text.includes(keyword) || href.toLowerCase().includes(keyword)
      )
      
      if (isAboutLink) {
        try {
          let fullUrl: string
          if (href.startsWith('http')) {
            fullUrl = href
          } else if (href.startsWith('/')) {
            fullUrl = `${baseUrlObj.origin}${href}`
          } else {
            fullUrl = `${baseUrlObj.origin}/${href}`
          }
          
          if (!links.includes(fullUrl)) {
            links.push(fullUrl)
          }
        } catch {
          // Invalid URL, skip
        }
      }
    })
    
    return links
  }

  /**
   * Check if page has contact form
   */
  private hasContactForm($: cheerio.CheerioAPI): boolean {
    // Look for forms with contact-related elements
    const forms = $('form')
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms.eq(i)
      const formHtml = form.html()?.toLowerCase() || ''
      
      // Check for common contact form indicators
      const contactIndicators = [
        'email', 'message', 'subject', 'name', 'contact',
        'inquiry', 'get-in-touch', 'reach-out'
      ]
      
      const hasContactIndicator = contactIndicators.some(indicator => 
        formHtml.includes(indicator)
      )
      
      if (hasContactIndicator) {
        return true
      }
    }
    
    return false
  }

  /**
   * Extract company information from page content
   */
  private extractCompanyInfo($: cheerio.CheerioAPI, title: string): {
    name?: string
    industry?: string
    size?: string
    location?: string
  } {
    const info: any = {}
    
    // Try to extract company name from various sources
    info.name = this.extractCompanyName($, title)
    
    // Try to extract industry
    info.industry = this.extractIndustry($)
    
    // Try to extract company size
    info.size = this.extractCompanySize($)
    
    // Try to extract location
    info.location = this.extractLocation($)
    
    return info
  }

  private extractCompanyName($: cheerio.CheerioAPI, title: string): string | undefined {
    // Try various methods to extract company name
    
    // Method 1: Look for schema.org markup
    const schemaName = $('[itemtype*="Organization"] [itemprop="name"]').text().trim()
    if (schemaName) return schemaName
    
    // Method 2: Look for meta tags
    const ogSiteName = $('meta[property="og:site_name"]').attr('content')
    if (ogSiteName) return ogSiteName
    
    // Method 3: Extract from title (remove common suffixes)
    const titleWithoutSuffixes = title
      .replace(/\s*[-|]\s*(Home|Homepage|Welcome|Official Site|Company|Inc|LLC|Ltd|Corp).*$/i, '')
      .trim()
    
    if (titleWithoutSuffixes && titleWithoutSuffixes.length > 2) {
      return titleWithoutSuffixes
    }
    
    return undefined
  }

  private extractIndustry($: cheerio.CheerioAPI): string | undefined {
    // Look for industry-related keywords in the content
    const text = $('body').text().toLowerCase()
    
    const industries = [
      'technology', 'software', 'fintech', 'healthcare', 'education',
      'e-commerce', 'retail', 'manufacturing', 'consulting', 'marketing',
      'finance', 'insurance', 'real estate', 'automotive', 'energy'
    ]
    
    for (const industry of industries) {
      if (text.includes(industry)) {
        return industry.charAt(0).toUpperCase() + industry.slice(1)
      }
    }
    
    return undefined
  }

  private extractCompanySize($: cheerio.CheerioAPI): string | undefined {
    const text = $('body').text().toLowerCase()
    
    // Look for size indicators
    const sizePatterns = [
      /(\d+)\+?\s*employees/i,
      /team\s+of\s+(\d+)/i,
      /(startup|small|medium|large|enterprise)\s+company/i
    ]
    
    for (const pattern of sizePatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0]
      }
    }
    
    return undefined
  }

  private extractLocation($: cheerio.CheerioAPI): string | undefined {
    // Look for address or location information
    const addressSelectors = [
      '[itemtype*="PostalAddress"]',
      '.address', '.location', '.contact-info',
      '[class*="address"]', '[class*="location"]'
    ]
    
    for (const selector of addressSelectors) {
      const address = $(selector).text().trim()
      if (address && address.length > 10) {
        return address
      }
    }
    
    return undefined
  }
} 