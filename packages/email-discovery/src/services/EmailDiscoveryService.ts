import { 
  IEmailDiscoveryService, 
  EmailDiscoveryParams, 
  EmailDiscoveryResult, 
  EmailDiscoveryConfig, 
  EmailContact, 
  EmailValidationResult,
  EmailDiscoveryError,
  EmailSource,
  EmailDiscoveryEvent,
  EmailDiscoveryEventHandler
} from '../types'
import { EmailExtractor } from '../utils/EmailExtractor'
import { WebsiteParser } from '../parsers/WebsiteParser'
import { RateLimiter } from '../utils/RateLimiter'

export class EmailDiscoveryService implements IEmailDiscoveryService {
  private readonly config: EmailDiscoveryConfig
  private readonly websiteParser: WebsiteParser
  private readonly rateLimiter: RateLimiter
  private eventHandlers: EmailDiscoveryEventHandler[] = []

  constructor(config?: Partial<EmailDiscoveryConfig>) {
    this.config = {
      maxRequestsPerMinute: 30,
      requestDelay: 2000,
      requestTimeout: 10000,
      enableEmailValidation: true,
      enableDisposableEmailCheck: true,
      enableWebsiteParsing: true,
      enableWhoisLookup: false, // Disabled for now due to complexity
      enableSocialMediaParsing: false, // Disabled for now due to API restrictions
      userAgent: 'JobHonter/1.0 (Email Discovery Bot)',
      randomizeUserAgent: false,
      ...config
    }

    this.websiteParser = new WebsiteParser(this.config.requestTimeout, this.config.userAgent)
    this.rateLimiter = new RateLimiter(this.config.maxRequestsPerMinute, this.config.requestDelay)
  }

  /**
   * Add event handler for monitoring discovery progress
   */
  public addEventHandler(handler: EmailDiscoveryEventHandler): void {
    this.eventHandlers.push(handler)
  }

  /**
   * Remove event handler
   */
  public removeEventHandler(handler: EmailDiscoveryEventHandler): void {
    const index = this.eventHandlers.indexOf(handler)
    if (index > -1) {
      this.eventHandlers.splice(index, 1)
    }
  }

  /**
   * Emit event to all handlers
   */
  private emitEvent(event: EmailDiscoveryEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        console.error('Error in event handler:', error)
      }
    })
  }

  /**
   * Main email discovery method
   */
  async discoverEmails(params: EmailDiscoveryParams): Promise<EmailDiscoveryResult> {
    const startTime = Date.now()
    const errors: EmailDiscoveryError[] = []
    const allEmails: EmailContact[] = []
    
    this.emitEvent({
      type: 'start',
      message: `Starting email discovery for ${params.companyName}`,
      data: params,
      timestamp: new Date()
    })

    const result: EmailDiscoveryResult = {
      companyName: params.companyName,
      companyDomain: this.extractDomainFromWebsite(params.companyWebsite),
      emails: [],
      totalFound: 0,
      uniqueEmails: 0,
      verifiedEmails: 0,
      processingTime: 0,
      errors: [],
      metadata: {
        websiteScanned: false,
        whoisChecked: false,
        socialMediaChecked: false,
        contactPageFound: false,
        processingSteps: []
      }
    }

    try {
      // Method 1: Website parsing (primary method)
      if (this.config.enableWebsiteParsing && params.companyWebsite) {
        this.emitEvent({
          type: 'progress',
          message: 'Analyzing company website...',
          timestamp: new Date()
        })
        
        try {
          await this.rateLimiter.waitForSlot()
          const websiteEmails = await this.discoverFromWebsite(params.companyWebsite, params.companyName)
          allEmails.push(...websiteEmails)
          result.metadata.websiteScanned = true
          result.metadata.processingSteps.push('Website analysis completed')
          
          this.emitEvent({
            type: 'progress',
            message: `Found ${websiteEmails.length} emails from website`,
            data: { emailCount: websiteEmails.length },
            timestamp: new Date()
          })
        } catch (error) {
          const err: EmailDiscoveryError = {
            type: 'network',
            message: `Website parsing failed: ${error}`,
            url: params.companyWebsite,
            timestamp: new Date()
          }
          errors.push(err)
          result.metadata.processingSteps.push('Website analysis failed')
        }
      }

      // Method 2: Job post analysis
      if (params.jobUrl) {
        this.emitEvent({
          type: 'progress',
          message: 'Analyzing job post...',
          timestamp: new Date()
        })
        
        try {
          await this.rateLimiter.waitForSlot()
          const jobEmails = await this.extractFromJobPost(params.jobUrl, params.companyName)
          allEmails.push(...jobEmails)
          result.metadata.processingSteps.push('Job post analysis completed')
          
          this.emitEvent({
            type: 'progress',
            message: `Found ${jobEmails.length} emails from job post`,
            data: { emailCount: jobEmails.length },
            timestamp: new Date()
          })
        } catch (error) {
          const err: EmailDiscoveryError = {
            type: 'parsing',
            message: `Job post parsing failed: ${error}`,
            url: params.jobUrl,
            timestamp: new Date()
          }
          errors.push(err)
          result.metadata.processingSteps.push('Job post analysis failed')
        }
      }

      // Method 3: Additional URLs
      if (params.additionalUrls && params.additionalUrls.length > 0) {
        this.emitEvent({
          type: 'progress',
          message: 'Analyzing additional URLs...',
          timestamp: new Date()
        })
        
        for (const url of params.additionalUrls) {
          try {
            await this.rateLimiter.waitForSlot()
            const urlEmails = await this.discoverFromUrl(url, params.companyName)
            allEmails.push(...urlEmails)
          } catch (error) {
            const err: EmailDiscoveryError = {
              type: 'network',
              message: `Additional URL parsing failed: ${error}`,
              url,
              timestamp: new Date()
            }
            errors.push(err)
          }
        }
        result.metadata.processingSteps.push(`Analyzed ${params.additionalUrls.length} additional URLs`)
      }

      // Deduplicate and prioritize emails
      const uniqueEmails = this.deduplicateEmails(allEmails)
      const prioritizedEmails = EmailExtractor.prioritizeEmails(uniqueEmails)

      // Validate emails if enabled
      let validatedEmails = prioritizedEmails
      if (this.config.enableEmailValidation) {
        this.emitEvent({
          type: 'progress',
          message: 'Validating discovered emails...',
          timestamp: new Date()
        })
        
        validatedEmails = await this.validateEmails(prioritizedEmails)
        result.metadata.processingSteps.push('Email validation completed')
      }

      // Update result
      result.emails = validatedEmails
      result.totalFound = allEmails.length
      result.uniqueEmails = uniqueEmails.length
      result.verifiedEmails = validatedEmails.filter(email => email.verified).length
      result.processingTime = Date.now() - startTime
      result.errors = errors

      this.emitEvent({
        type: 'complete',
        message: `Discovery completed: found ${result.uniqueEmails} unique emails`,
        data: result,
        timestamp: new Date()
      })

      return result

    } catch (error) {
      this.emitEvent({
        type: 'error',
        message: `Discovery failed: ${error}`,
        timestamp: new Date()
      })
      
      result.processingTime = Date.now() - startTime
      result.errors = errors
      return result
    }
  }

  /**
   * Discover emails from a job post
   */
  async discoverFromJobPost(jobUrl: string, companyName: string): Promise<EmailDiscoveryResult> {
    const startTime = Date.now()
    
    try {
      const source: EmailSource = {
        type: 'job_post',
        url: jobUrl,
        confidence: 0.8,
        extractedAt: new Date(),
        method: 'Job post analysis'
      }

      // Parse the job post page
      const emails = await this.websiteParser.extractEmailsFromPage(jobUrl)
      const emailContacts: EmailContact[] = emails.map(email => ({
        email,
        company: companyName,
        source,
        verified: false,
        isDisposable: false // Will be checked in validation
      }))

      return {
        companyName,
        emails: emailContacts,
        totalFound: emailContacts.length,
        uniqueEmails: emailContacts.length,
        verifiedEmails: 0,
        processingTime: Date.now() - startTime,
        errors: [],
        metadata: {
          websiteScanned: false,
          whoisChecked: false,
          socialMediaChecked: false,
          contactPageFound: false,
          processingSteps: ['Job post parsed']
        }
      }
    } catch (error) {
      throw new Error(`Failed to discover emails from job post: ${error}`)
    }
  }

  /**
   * Discover emails from a company
   */
  async discoverFromCompany(companyName: string, companyWebsite?: string): Promise<EmailDiscoveryResult> {
    const params: EmailDiscoveryParams = {
      companyName,
      companyWebsite,
      methods: ['website', 'contact_pages']
    }

    return this.discoverEmails(params)
  }

  /**
   * Validate a list of emails
   */
  async validateEmailList(emails: string[]): Promise<EmailValidationResult[]> {
    const results: EmailValidationResult[] = []
    
    for (const email of emails) {
      try {
        const validation = await EmailExtractor.validateEmailDeliverability(email)
        results.push(validation)
      } catch (error) {
        results.push({
          email,
          isValid: false,
          isDisposable: false,
          deliverable: 'unknown',
          reason: `Validation error: ${error}`
        })
      }
    }

    return results
  }

  /**
   * Discover emails from website
   */
  private async discoverFromWebsite(websiteUrl: string, companyName: string): Promise<EmailContact[]> {
    const allEmails: EmailContact[] = []
    
    try {
      // Parse main website
      const websiteAnalysis = await this.websiteParser.parseWebsite(websiteUrl)
      
      // Extract emails from main page
      if (websiteAnalysis.emails.length > 0) {
        const mainPageEmails = websiteAnalysis.emails.map(email => {
          const source: EmailSource = {
            type: 'webpage',
            url: websiteUrl,
            confidence: 0.8,
            extractedAt: new Date(),
            method: 'Main website parsing'
          }
          
          return {
            email,
            company: companyName,
            source,
            verified: false,
            isDisposable: false
          } as EmailContact
        })
        
        allEmails.push(...mainPageEmails)
      }

      // Parse contact pages
      if (websiteAnalysis.contactLinks.length > 0) {
        for (const contactUrl of websiteAnalysis.contactLinks.slice(0, 3)) { // Limit to 3 contact pages
          try {
            await this.rateLimiter.waitForSlot()
            const contactEmails = await this.websiteParser.extractEmailsFromPage(contactUrl)
            
            const contactPageEmails = contactEmails.map(email => {
              const source: EmailSource = {
                type: 'contact_page',
                url: contactUrl,
                confidence: 0.9,
                extractedAt: new Date(),
                method: 'Contact page parsing'
              }
              
              return {
                email,
                company: companyName,
                source,
                verified: false,
                isDisposable: false
              } as EmailContact
            })
            
            allEmails.push(...contactPageEmails)
          } catch (error) {
            console.error(`Error parsing contact page ${contactUrl}:`, error)
          }
        }
      }

      // Parse team/about pages (limited)
      const otherPages = [...websiteAnalysis.teamPageLinks, ...websiteAnalysis.aboutPageLinks]
      for (const pageUrl of otherPages.slice(0, 2)) { // Limit to 2 additional pages
        try {
          await this.rateLimiter.waitForSlot()
          const pageEmails = await this.websiteParser.extractEmailsFromPage(pageUrl)
          
          const pageEmailContacts = pageEmails.map(email => {
            const source: EmailSource = {
              type: 'about_page',
              url: pageUrl,
              confidence: 0.7,
              extractedAt: new Date(),
              method: 'Team/About page parsing'
            }
            
            return {
              email,
              company: companyName,
              source,
              verified: false,
              isDisposable: false
            } as EmailContact
          })
          
          allEmails.push(...pageEmailContacts)
        } catch (error) {
          console.error(`Error parsing page ${pageUrl}:`, error)
        }
      }

      return allEmails
      
    } catch (error) {
      throw new Error(`Failed to discover emails from website: ${error}`)
    }
  }

  /**
   * Discover emails from any URL
   */
  private async discoverFromUrl(url: string, companyName: string): Promise<EmailContact[]> {
    try {
      const emails = await this.websiteParser.extractEmailsFromPage(url)
      
      const source: EmailSource = {
        type: 'webpage',
        url,
        confidence: 0.6,
        extractedAt: new Date(),
        method: 'Generic URL parsing'
      }
      
      return emails.map(email => ({
        email,
        company: companyName,
        source,
        verified: false,
        isDisposable: false
      }))
    } catch (error) {
      throw new Error(`Failed to discover emails from URL: ${error}`)
    }
  }

  /**
   * Extract emails from job post URL (helper method)
   */
  private async extractFromJobPost(jobUrl: string, companyName: string): Promise<EmailContact[]> {
    try {
      const source: EmailSource = {
        type: 'job_post',
        url: jobUrl,
        confidence: 0.8,
        extractedAt: new Date(),
        method: 'Job post analysis'
      }

      // Parse the job post page
      const emails = await this.websiteParser.extractEmailsFromPage(jobUrl)
      return emails.map(email => ({
        email,
        company: companyName,
        source,
        verified: false,
        isDisposable: false // Will be checked in validation
      }))
    } catch (error) {
      throw new Error(`Failed to extract emails from job post: ${error}`)
    }
  }

  /**
   * Remove duplicate emails while preserving highest confidence sources
   */
  private deduplicateEmails(emails: EmailContact[]): EmailContact[] {
    const emailMap = new Map<string, EmailContact>()
    
    for (const emailContact of emails) {
      const email = emailContact.email.toLowerCase()
      
      if (!emailMap.has(email)) {
        emailMap.set(email, emailContact)
      } else {
        const existing = emailMap.get(email)!
        // Keep the one with higher confidence or better source type
        if (emailContact.source.confidence > existing.source.confidence ||
            this.getSourcePriority(emailContact.source.type) > this.getSourcePriority(existing.source.type)) {
          emailMap.set(email, emailContact)
        }
      }
    }
    
    return Array.from(emailMap.values())
  }

  /**
   * Get priority score for different source types
   */
  private getSourcePriority(sourceType: string): number {
    const priorities = {
      'contact_page': 10,
      'team_page': 8,
      'about_page': 6,
      'job_post': 7,
      'webpage': 5,
      'social': 3,
      'whois': 2
    }
    
    return priorities[sourceType as keyof typeof priorities] || 1
  }

  /**
   * Validate emails and update verification status
   */
  private async validateEmails(emails: EmailContact[]): Promise<EmailContact[]> {
    const validatedEmails: EmailContact[] = []
    
    for (const emailContact of emails) {
      try {
        const validation = await EmailExtractor.validateEmailDeliverability(emailContact.email)
        
        const validatedContact: EmailContact = {
          ...emailContact,
          verified: validation.isValid && validation.deliverable === 'valid',
          isDisposable: validation.isDisposable,
          deliverable: validation.deliverable
        }
        
        validatedEmails.push(validatedContact)
        
        // Add small delay between validations to be respectful
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        // Keep original email contact if validation fails
        validatedEmails.push(emailContact)
      }
    }
    
    return validatedEmails
  }

  /**
   * Extract domain from website URL
   */
  private extractDomainFromWebsite(website?: string): string | undefined {
    if (!website) return undefined
    
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`)
      return url.hostname.replace(/^www\./, '')
    } catch {
      return undefined
    }
  }
} 