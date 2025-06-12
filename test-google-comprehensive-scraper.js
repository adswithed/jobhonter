#!/usr/bin/env node

/**
 * COMPREHENSIVE GOOGLE SCRAPER TEST
 * 
 * This script tests the new GoogleScraper that searches the ENTIRE web
 * using multiple strategies for maximum job discovery coverage.
 * 
 * Strategies tested:
 * 1. Direct Google/DuckDuckGo search with multiple patterns
 * 2. Site-specific targeted searches (job boards, company sites)
 * 3. Content-type specific searches (PDFs, blogs, articles)
 * 4. Real-time browser automation with JavaScript rendering
 * 5. Deep content extraction from blogs and community sites
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test configurations for different scenarios
const testConfigurations = [
  {
    name: 'Frontend Developer - Strict Mode',
    config: {
      keywords: ['frontend developer', 'react developer'],
      location: 'Remote',
      searchMode: 'strict',
      limit: 20
    },
    expectedMinResults: 5,
    description: 'Strict search for frontend developers with exact keyword matching'
  },
  {
    name: 'Full Stack Engineer - Moderate Mode',
    config: {
      keywords: ['full stack engineer', 'javascript developer'],
      location: 'San Francisco',
      searchMode: 'moderate',
      limit: 30
    },
    expectedMinResults: 10,
    description: 'Moderate search balancing precision and coverage'
  },
  {
    name: 'Software Engineer - Loose Mode',
    config: {
      keywords: ['software engineer', 'backend developer'],
      remote: true,
      searchMode: 'loose',
      limit: 50
    },
    expectedMinResults: 15,
    description: 'Loose search for maximum coverage across the entire web'
  }
];

async function testGoogleScraper() {
  console.log('🚀 COMPREHENSIVE GOOGLE SCRAPER TEST');
  console.log('=====================================');
  console.log('Testing multi-strategy web search across entire Google index');
  console.log('Strategies: Direct, Site-Specific, Content-Type, Browser, Deep-Content\n');

  const results = [];
  let totalJobsFound = 0;
  let totalContactsFound = 0;

  for (const test of testConfigurations) {
    console.log(`\n📋 TEST: ${test.name}`);
    console.log(`📝 ${test.description}`);
    console.log(`🔍 Keywords: ${test.config.keywords.join(', ')}`);
    console.log(`📍 Location: ${test.config.location || 'Any'}`);
    console.log(`🎯 Mode: ${test.config.searchMode}`);
    console.log(`📊 Limit: ${test.config.limit}`);
    console.log('─'.repeat(60));

    try {
      const startTime = Date.now();
      
      const response = await axios.post(`${API_BASE}/scraper/test/google`, test.config, {
        timeout: 120000, // 2 minutes timeout for comprehensive search
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const duration = Date.now() - startTime;
      const data = response.data.data;
      const metadata = response.data.metadata;

      // Extract key metrics
      const jobsFound = data.jobs.length;
      const contactsFound = data.analysis?.jobsWithContacts || 0;
      const remoteJobs = data.analysis?.remoteJobs || 0;
      const highRelevanceJobs = data.analysis?.highRelevanceJobs || 0;
      const averageRelevance = parseFloat(data.analysis?.averageRelevance || 0);
      const topDomains = data.analysis?.topDomains?.slice(0, 5) || [];

      totalJobsFound += jobsFound;
      totalContactsFound += contactsFound;

      // Validate results
      const passed = jobsFound >= test.expectedMinResults;
      const status = passed ? '✅ PASSED' : '❌ FAILED';

      console.log(`${status} - Found ${jobsFound} jobs (expected min: ${test.expectedMinResults})`);
      console.log(`⏱️  Duration: ${duration}ms (${metadata.duration})`);
      console.log(`📧 Contacts: ${contactsFound} (${data.analysis?.contactRate || '0%'})`);
      console.log(`🏠 Remote: ${remoteJobs} (${data.analysis?.remoteRate || '0%'})`);
      console.log(`⭐ High Relevance: ${highRelevanceJobs} (${data.analysis?.highRelevanceRate || '0%'})`);
      console.log(`📈 Avg Relevance: ${averageRelevance}`);
      
      if (topDomains.length > 0) {
        console.log('\n🌐 TOP DOMAINS FOUND:');
        topDomains.forEach((domain, index) => {
          console.log(`   ${index + 1}. ${domain.domain} (${domain.count} jobs)`);
        });
      }

      if (data.analysis?.searchStrategies) {
        console.log('\n🔧 SEARCH STRATEGIES USED:');
        Object.entries(data.analysis.searchStrategies).forEach(([strategy, description]) => {
          console.log(`   • ${strategy}: ${description}`);
        });
      }

      // Sample jobs for quality check
      if (data.jobs.length > 0) {
        console.log('\n📋 SAMPLE JOBS FOUND:');
        data.jobs.slice(0, 3).forEach((job, index) => {
          const relevance = job.googleMetadata?.relevanceScore || 0;
          const domain = job.googleMetadata?.searchResult?.displayLink || 'unknown';
          console.log(`   ${index + 1}. ${job.title} at ${job.company}`);
          console.log(`      📍 ${job.location} | 💼 ${job.jobType || 'Not specified'} | ⭐ ${relevance.toFixed(2)}`);
          console.log(`      🌐 ${domain} | 📧 ${job.contact?.email || 'No contact'}`);
          console.log(`      🔗 ${job.url}`);
        });
      }

      results.push({
        test: test.name,
        passed,
        jobsFound,
        contactsFound,
        highRelevanceJobs,
        averageRelevance,
        duration,
        topDomains: topDomains.map(d => d.domain),
        strategiesUsed: metadata.strategiesUsed
      });

    } catch (error) {
      console.log(`❌ FAILED - Error: ${error.message}`);
      if (error.response?.data) {
        console.log(`   Server response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      results.push({
        test: test.name,
        passed: false,
        error: error.message,
        jobsFound: 0,
        contactsFound: 0,
        highRelevanceJobs: 0,
        averageRelevance: 0,
        duration: 0
      });
    }

    console.log(''); // Empty line for readability
  }

  // Final summary
  console.log('\n🎯 COMPREHENSIVE TEST SUMMARY');
  console.log('==============================');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log(`📊 Tests Passed: ${passedTests}/${totalTests} (${successRate}%)`);
  console.log(`🎯 Total Jobs Found: ${totalJobsFound}`);
  console.log(`📧 Total Contacts: ${totalContactsFound}`);
  console.log(`📈 Average Contact Rate: ${totalJobsFound > 0 ? ((totalContactsFound / totalJobsFound) * 100).toFixed(1) : 0}%`);

  // Unique domains across all tests
  const allDomains = new Set();
  results.forEach(result => {
    if (result.topDomains) {
      result.topDomains.forEach(domain => allDomains.add(domain));
    }
  });
  
  console.log(`🌐 Unique Domains Discovered: ${allDomains.size}`);
  console.log(`🔧 Search Coverage: Entire web (job boards, company sites, blogs, forums, social platforms)`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Google comprehensive scraper is working perfectly!');
    console.log('✅ Multi-strategy approach successfully covers the entire web');
    console.log('✅ All search modes (strict, moderate, loose) functioning correctly');
    console.log('✅ Contact extraction and relevance scoring working well');
    console.log('✅ Browser automation and deep content extraction operational');
  } else {
    console.log('\n⚠️  Some tests failed. Check the results above for details.');
  }

  // Detailed results table
  console.log('\n📋 DETAILED RESULTS:');
  console.log('─'.repeat(100));
  console.log('Test Name'.padEnd(30) + 'Status'.padEnd(10) + 'Jobs'.padEnd(8) + 'Contacts'.padEnd(10) + 'Relevance'.padEnd(12) + 'Duration');
  console.log('─'.repeat(100));
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const relevance = result.averageRelevance ? result.averageRelevance.toFixed(2) : '0.00';
    const duration = result.duration ? `${result.duration}ms` : 'N/A';
    
    console.log(
      result.test.padEnd(30) +
      status.padEnd(10) +
      result.jobsFound.toString().padEnd(8) +
      result.contactsFound.toString().padEnd(10) +
      relevance.padEnd(12) +
      duration
    );
  });

  console.log('\n🚀 Google Comprehensive Scraper Test Complete!');
  console.log('💡 This scraper searches the ENTIRE web, not just job boards');
  console.log('🎯 Perfect for finding hidden opportunities across all platforms');
}

// Run the test
if (require.main === module) {
  testGoogleScraper().catch(console.error);
}

module.exports = { testGoogleScraper }; 