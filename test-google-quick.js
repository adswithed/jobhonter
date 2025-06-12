#!/usr/bin/env node

const axios = require('axios');

async function testOptimizedGoogleScraper() {
  console.log('🧪 Testing optimized Google scraper...');
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post('http://localhost:3001/api/scraper/test/google', {
      keywords: ['frontend developer'],
      searchMode: 'strict',
      limit: 10
    }, { 
      timeout: 45000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const duration = Date.now() - startTime;
    const data = response.data.data || response.data;
    
    console.log('✅ SUCCESS!');
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`🎯 Jobs Found: ${data.jobs?.length || 0}`);
    console.log(`📊 Total Found: ${data.totalFound || 0}`);
    
    if (data.jobs && data.jobs.length > 0) {
      console.log('\n📋 SAMPLE JOBS:');
      data.jobs.slice(0, 3).forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   📍 ${job.location || 'Location not specified'}`);
        console.log(`   🔗 ${job.url}`);
        console.log(`   📧 ${job.contact?.email || 'No contact email'}`);
        console.log('');
      });
    }
    
    if (response.data.metadata) {
      console.log('🔧 METADATA:');
      console.log(`   Scraper Duration: ${response.data.metadata.duration || 'N/A'}`);
      console.log(`   Strategies Used: ${response.data.metadata.strategiesUsed?.join(', ') || 'N/A'}`);
      console.log(`   Results Processed: ${response.data.metadata.resultsProcessed || 'N/A'}`);
    }
    
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ Request timed out - scraper may need further optimization');
    }
    
    if (error.response?.data) {
      console.log('📄 Server Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testOptimizedGoogleScraper(); 