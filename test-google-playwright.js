#!/usr/bin/env node

const axios = require('axios');

async function testPlaywrightGoogleScraper() {
  console.log('🧪 Testing Playwright Google scraper...');
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post('http://localhost:3001/api/scraper/test/google', {
      keywords: ['frontend developer', 'react developer'],
      searchMode: 'moderate',
      limit: 15,
      location: 'San Francisco',
      remote: true
    }, { 
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const duration = Date.now() - startTime;
    const data = response.data.data || response.data;
    
    console.log('✅ SUCCESS!');
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`🎯 Jobs Found: ${data.jobs?.length || 0}`);
    console.log(`📊 Total Found: ${data.totalFound || 0}`);
    
    if (data.jobs && data.jobs.length > 0) {
      console.log('\n📋 Sample Jobs:');
      data.jobs.slice(0, 5).forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title}`);
        console.log(`   🏢 Company: ${job.company}`);
        console.log(`   📍 Location: ${job.location}`);
        console.log(`   🔗 URL: ${job.url}`);
        console.log(`   💰 Salary: ${job.salary || 'Not specified'}`);
        console.log(`   📧 Contact: ${job.contact?.email || 'Not found'}`);
        console.log(`   🏠 Remote: ${job.remote ? 'Yes' : 'No'}`);
        console.log(`   📝 Description: ${job.description?.substring(0, 100)}...`);
      });
    }
    
    if (data.metadata) {
      console.log('\n📊 Metadata:');
      console.log(`   ⏱️  Scraper took: ${data.metadata.took}ms`);
      console.log(`   🔧 Scraper ID: ${data.metadata.scraperId}`);
      console.log(`   🌐 Platform: ${data.metadata.platform}`);
      if (data.metadata.errors && data.metadata.errors.length > 0) {
        console.log(`   ❌ Errors: ${data.metadata.errors.length}`);
        data.metadata.errors.slice(0, 3).forEach(error => {
          console.log(`      - ${error}`);
        });
      }
    }
    
    // Test effectiveness
    const effectiveness = data.jobs?.length || 0;
    console.log(`\n🎯 EFFECTIVENESS ANALYSIS:`);
    console.log(`   📈 Jobs found: ${effectiveness}`);
    console.log(`   ⚡ Speed: ${duration < 30000 ? 'FAST' : duration < 60000 ? 'MODERATE' : 'SLOW'} (${duration}ms)`);
    console.log(`   🎪 Success rate: ${effectiveness > 0 ? 'SUCCESS' : 'FAILED'}`);
    
    if (effectiveness === 0) {
      console.log('\n❌ ZERO JOBS FOUND - NEEDS OPTIMIZATION');
      console.log('   Possible issues:');
      console.log('   - Google blocking requests');
      console.log('   - Search queries too restrictive');
      console.log('   - Parsing logic needs improvement');
      console.log('   - Rate limiting issues');
    } else if (effectiveness < 5) {
      console.log('\n⚠️  LOW RESULTS - ROOM FOR IMPROVEMENT');
    } else {
      console.log('\n✅ GOOD RESULTS - SCRAPER WORKING WELL');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the backend server is running on port 3001');
    }
  }
}

// Run the test
testPlaywrightGoogleScraper(); 