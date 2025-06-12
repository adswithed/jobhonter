#!/usr/bin/env node

const axios = require('axios');

async function testGoogleSerpAPI() {
  console.log('🧪 Testing Google SerpAPI Scraper');
  console.log('==================================\n');

  const baseUrl = 'http://localhost:3001/api/scraper/test/google';
  
  const testPayload = {
    keywords: ['software engineer'],
    searchMode: 'moderate',
    limit: 5,
    location: 'San Francisco'
  };

  try {
    console.log('🔍 Testing Google scraper with SerpAPI...');
    console.log(`   Keywords: ${testPayload.keywords.join(', ')}`);
    console.log(`   Location: ${testPayload.location}`);
    console.log(`   Limit: ${testPayload.limit}`);
    
    const startTime = Date.now();
    
    const response = await axios.post(baseUrl, testPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    const data = response.data;
    
    console.log(`\n📡 Status: ${response.status}`);
    console.log(`✅ Response received`);
    
    if (!data.success) {
      throw new Error('Response indicates failure');
    }
    
    const jobs = data.data.jobs;
    const totalFound = data.data.totalFound;
    const metadata = data.metadata;
    
    console.log(`🎯 Jobs found: ${totalFound}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`🔧 Scraper took: ${metadata.took}ms`);
    
    if (jobs && jobs.length > 0) {
      console.log(`\n📋 Sample job:`);
      const job = jobs[0];
      console.log(`   Title: ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Salary: ${job.salary || 'Not specified'}`);
      console.log(`   Remote: ${job.remote}`);
      console.log(`   URL: ${job.url}`);
      console.log(`   Requirements: ${job.requirements?.slice(0, 3).join(', ') || 'None specified'}`);
      
      if (job.scraped?.rawData?.serpApiJob) {
        console.log(`   🔗 Source: SerpAPI Google Jobs`);
      } else if (job.scraped?.rawData?.serpApiOrganic) {
        console.log(`   🔗 Source: SerpAPI Google Organic`);
      } else if (job.scraped?.rawData?.generated) {
        console.log(`   🔗 Source: Generated (${job.scraped.rawData.style})`);
      }
    }
    
    if (metadata.errors && metadata.errors.length > 0) {
      console.log(`\n❌ Errors:`);
      metadata.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }
    
    console.log(`\n🎯 Test completed`);
    
    // Check if we're using SerpAPI or fallback
    if (process.env.SERPAPI_KEY) {
      console.log(`✅ SerpAPI key detected - using real Google search`);
    } else {
      console.log(`⚠️  No SerpAPI key - using fallback mode`);
    }
    
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    if (error.response) {
      console.log(`📡 Status: ${error.response.status}`);
      console.log(`📄 Response: ${JSON.stringify(error.response.data, null, 2).substring(0, 500)}...`);
    }
  }
}

testGoogleSerpAPI(); 