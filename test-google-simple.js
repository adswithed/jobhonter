#!/usr/bin/env node

// Simple test for Google scraper
const http = require('http');

function testGoogleScraper() {
  console.log('🧪 Testing Google scraper with simple request...');
  
  const postData = JSON.stringify({
    keywords: ['software engineer'],
    searchMode: 'moderate',
    limit: 5
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/scraper/test/google',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 30000
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('✅ Response received');
        console.log(`🎯 Jobs found: ${result.data?.jobs?.length || 0}`);
        console.log(`⏱️  Duration: ${result.metadata?.took || 'unknown'}ms`);
        
        if (result.data?.jobs?.length > 0) {
          console.log('\n📋 Sample job:');
          const job = result.data.jobs[0];
          console.log(`   Title: ${job.title}`);
          console.log(`   Company: ${job.company}`);
          console.log(`   URL: ${job.url}`);
        }
        
        if (result.metadata?.errors?.length > 0) {
          console.log('\n❌ Errors:');
          result.metadata.errors.forEach(error => {
            console.log(`   - ${error}`);
          });
        }
        
        console.log('\n🎯 Test completed');
      } catch (error) {
        console.error('❌ Failed to parse response:', error);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.on('timeout', () => {
    console.error('❌ Request timed out');
    req.destroy();
  });

  req.write(postData);
  req.end();
}

testGoogleScraper(); 