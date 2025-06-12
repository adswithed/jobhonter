#!/usr/bin/env node

// Test script to verify Google API integration
const axios = require('axios');

const GOOGLE_API_KEY = 'AIzaSyABQK9hJpAU093BlmmKTXNU6kytfPSSsO8';
const GOOGLE_CSE_ID = 'e085a6625882c4c4c';

async function testGoogleCustomSearch() {
  console.log('🔍 Testing Google Custom Search API...');
  
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CSE_ID,
        q: 'software engineer jobs',
        num: 3
      }
    });

    if (response.data.items && response.data.items.length > 0) {
      console.log('✅ Google Custom Search API is working!');
      console.log(`📊 Found ${response.data.items.length} results`);
      
      response.data.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   ${item.link}`);
        console.log(`   ${item.snippet.substring(0, 100)}...`);
        console.log('');
      });
      
      return true;
    } else {
      console.log('❌ No results returned from Google Custom Search API');
      return false;
    }
  } catch (error) {
    console.error('❌ Google Custom Search API test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testJobHonterGoogleScraper() {
  console.log('🔍 Testing JobHonter Google Scraper...');
  
  try {
    const response = await axios.post('http://localhost:3001/api/scraper/test/google', {
      keywords: ['software engineer'],
      searchMode: 'moderate',
      limit: 3
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      env: {
        GOOGLE_API_KEY,
        GOOGLE_CSE_ID
      }
    });

    if (response.data.success && response.data.data.jobs.length > 0) {
      console.log('✅ JobHonter Google Scraper is working!');
      console.log(`📊 Found ${response.data.data.totalFound} jobs`);
      
      response.data.data.jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   Location: ${job.location}`);
        console.log(`   Source Type: ${job.scraped.rawData.source_type || 'fallback'}`);
        console.log('');
      });
      
      return true;
    } else {
      console.log('❌ JobHonter Google Scraper returned no results');
      return false;
    }
  } catch (error) {
    console.error('❌ JobHonter Google Scraper test failed:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Google API Integration Tests\n');
  
  const googleApiWorking = await testGoogleCustomSearch();
  console.log('');
  
  const scraperWorking = await testJobHonterGoogleScraper();
  console.log('');
  
  console.log('📋 Test Summary:');
  console.log(`   Google Custom Search API: ${googleApiWorking ? '✅ Working' : '❌ Failed'}`);
  console.log(`   JobHonter Google Scraper: ${scraperWorking ? '✅ Working' : '❌ Failed'}`);
  
  if (googleApiWorking && !scraperWorking) {
    console.log('\n💡 The Google API is working, but the JobHonter scraper may need the backend server to be restarted with the new environment variables.');
    console.log('   Try restarting the backend server and running this test again.');
  }
  
  if (!googleApiWorking) {
    console.log('\n💡 The Google API is not working. Please check:');
    console.log('   1. API key is valid and has Custom Search API enabled');
    console.log('   2. Custom Search Engine ID is correct');
    console.log('   3. You have remaining quota for API calls');
  }
}

main().catch(console.error); 