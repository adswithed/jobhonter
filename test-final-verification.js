#!/usr/bin/env node

const axios = require('axios');

async function comprehensiveTest() {
  console.log('🧪 COMPREHENSIVE Google Scraper Test');
  console.log('=====================================\n');

  const baseUrl = 'http://localhost:3001/api/scraper/test/google';
  
  const testCases = [
    {
      name: 'Software Engineer Search',
      payload: {
        keywords: ['software engineer'],
        searchMode: 'moderate',
        limit: 5
      }
    },
    {
      name: 'React Developer Search',
      payload: {
        keywords: ['react developer'],
        searchMode: 'moderate',
        limit: 8
      }
    },
    {
      name: 'Python Developer Remote',
      payload: {
        keywords: ['python developer'],
        searchMode: 'moderate',
        limit: 6,
        remote: true,
        location: 'Remote'
      }
    },
    {
      name: 'Frontend Developer Location-Specific',
      payload: {
        keywords: ['frontend developer'],
        searchMode: 'moderate',
        limit: 7,
        location: 'San Francisco'
      }
    },
    {
      name: 'Multiple Keywords',
      payload: {
        keywords: ['javascript', 'node.js'],
        searchMode: 'moderate',
        limit: 10
      }
    }
  ];

  let totalPassed = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log(`   Keywords: ${testCase.payload.keywords.join(', ')}`);
    console.log(`   Limit: ${testCase.payload.limit}`);
    
    try {
      const startTime = Date.now();
      
      const response = await axios.post(baseUrl, testCase.payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });
      
      const duration = Date.now() - startTime;
      const data = response.data;
      
      // Verify response structure
      if (!data.success) {
        throw new Error('Response indicates failure');
      }
      
      const jobs = data.data.jobs;
      const totalFound = data.data.totalFound;
      
      // Verify we got jobs
      if (!Array.isArray(jobs) || jobs.length === 0) {
        throw new Error('No jobs returned');
      }
      
      // Verify job structure
      const firstJob = jobs[0];
      const requiredFields = ['id', 'title', 'company', 'location', 'description', 'source', 'url'];
      const missingFields = requiredFields.filter(field => !firstJob[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Verify keyword relevance
      const keywordMatch = testCase.payload.keywords.some(keyword => 
        firstJob.title.toLowerCase().includes(keyword.toLowerCase()) ||
        firstJob.description.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (!keywordMatch) {
        console.log(`   ⚠️  Warning: First job may not match keywords`);
      }
      
      console.log(`   ✅ SUCCESS: ${jobs.length} jobs found in ${duration}ms`);
      console.log(`   📊 Sample: "${firstJob.title}" at ${firstJob.company}`);
      console.log(`   💰 Salary: ${firstJob.salary || 'Not specified'}`);
      console.log(`   📍 Location: ${firstJob.location}`);
      console.log(`   🔗 URL: ${firstJob.url}`);
      
      // Verify remote filter if specified
      if (testCase.payload.remote) {
        const remoteJobs = jobs.filter(job => job.remote);
        console.log(`   🏠 Remote jobs: ${remoteJobs.length}/${jobs.length}`);
      }
      
      // Verify location filter if specified
      if (testCase.payload.location && testCase.payload.location !== 'Remote') {
        const locationJobs = jobs.filter(job => 
          job.location.toLowerCase().includes(testCase.payload.location.toLowerCase())
        );
        console.log(`   📍 Location matches: ${locationJobs.length}/${jobs.length}`);
      }
      
      totalPassed++;
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      if (error.response) {
        console.log(`   📡 Status: ${error.response.status}`);
        console.log(`   📄 Response: ${JSON.stringify(error.response.data, null, 2).substring(0, 200)}...`);
      }
    }
    
    console.log('');
  }

  // Performance test
  console.log('⚡ PERFORMANCE TEST');
  console.log('==================');
  
  try {
    const perfTests = [];
    const perfPayload = {
      keywords: ['developer'],
      searchMode: 'moderate',
      limit: 15
    };
    
    // Run 3 concurrent requests
    for (let i = 0; i < 3; i++) {
      perfTests.push(
        axios.post(baseUrl, perfPayload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        })
      );
    }
    
    const startTime = Date.now();
    const results = await Promise.all(perfTests);
    const totalDuration = Date.now() - startTime;
    
    const avgJobsPerRequest = results.reduce((sum, r) => sum + r.data.data.jobs.length, 0) / results.length;
    
    console.log(`✅ Concurrent requests: 3 requests completed in ${totalDuration}ms`);
    console.log(`📊 Average jobs per request: ${avgJobsPerRequest.toFixed(1)}`);
    console.log(`⚡ Average response time: ${(totalDuration / 3).toFixed(0)}ms`);
    
  } catch (error) {
    console.log(`❌ Performance test failed: ${error.message}`);
  }

  // Summary
  console.log('\n🎯 TEST SUMMARY');
  console.log('===============');
  console.log(`✅ Passed: ${totalPassed}/${totalTests} tests`);
  console.log(`📊 Success rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Google scraper is working perfectly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

comprehensiveTest().catch(console.error); 