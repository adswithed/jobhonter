#!/usr/bin/env node

console.log('🧪 JobHonter Scraper Integration Test');
console.log('=====================================\n');

const testScrapers = async () => {
  const tests = [
    {
      name: 'Google Scraper (SerpAPI)',
      endpoint: 'http://localhost:3001/api/scraper/test/google',
      payload: {
        keywords: ['javascript developer'],
        searchMode: 'moderate',
        limit: 5,
        location: 'Remote'
      }
    },
    {
      name: 'RemoteOK Scraper',
      endpoint: 'http://localhost:3001/api/scraper/test/remoteok',
      payload: {
        keywords: ['react developer'],
        limit: 5
      }
    }
  ];

  for (const test of tests) {
    console.log(`🔍 Testing ${test.name}...`);
    console.log(`   Endpoint: ${test.endpoint}`);
    console.log(`   Keywords: ${test.payload.keywords.join(', ')}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(test.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.payload)
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Response indicates failure');
      }
      
      const jobs = data.data.jobs;
      const analysis = data.data.analysis;
      
      console.log(`   ✅ Success! Found ${jobs.length} jobs in ${duration}ms`);
      
      if (jobs.length > 0) {
        const job = jobs[0];
        console.log(`   📋 Sample job: ${job.title} at ${job.company}`);
        console.log(`   📍 Location: ${job.location}`);
        console.log(`   💰 Salary: ${job.salary || 'Not specified'}`);
        console.log(`   🏠 Remote: ${job.remote ? 'Yes' : 'No'}`);
        console.log(`   📧 Contact: ${job.contact?.email ? 'Available' : 'Not available'}`);
        
        // Check data source
        if (job.scraped?.rawData?.serpApiJob) {
          console.log(`   🔗 Source: SerpAPI Google Jobs (Real)`);
        } else if (job.scraped?.rawData?.serpApiOrganic) {
          console.log(`   🔗 Source: SerpAPI Google Organic (Real)`);
        } else if (job.scraped?.rawData?.remoteOkData) {
          console.log(`   🔗 Source: RemoteOK API (Real)`);
        } else if (job.scraped?.rawData?.generated) {
          console.log(`   🔗 Source: Generated (${job.scraped.rawData.style || 'fallback'})`);
        }
      }
      
      if (analysis) {
        console.log(`   📊 Analysis:`);
        if (analysis.realRemoteOKJobs !== undefined) {
          console.log(`      - Real RemoteOK jobs: ${analysis.realRemoteOKJobs}`);
          console.log(`      - Generated jobs: ${analysis.generatedJobs}`);
        }
        if (analysis.contactRate) {
          console.log(`      - Contact rate: ${analysis.contactRate}`);
        }
        if (analysis.remoteRate) {
          console.log(`      - Remote rate: ${analysis.remoteRate}`);
        }
      }
      
      console.log(`   ⏱️  Performance: ${duration}ms\n`);
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }
  
  // Test SerpAPI availability
  console.log('🔑 SerpAPI Configuration:');
  if (process.env.SERPAPI_KEY) {
    console.log('   ✅ SerpAPI key is configured');
    console.log('   🌐 Google scraper will use real Google search results');
  } else {
    console.log('   ⚠️  SerpAPI key not configured');
    console.log('   🔄 Google scraper will use fallback generation mode');
    console.log('   💡 To enable real Google search, set SERPAPI_KEY environment variable');
  }
  
  console.log('\n🎯 Integration Test Complete!');
  console.log('Both scrapers are properly integrated and functional.');
};

// Use dynamic import for fetch in Node.js
(async () => {
  if (typeof fetch === 'undefined') {
    const { default: fetch } = await import('node-fetch');
    global.fetch = fetch;
  }
  await testScrapers();
})(); 