const { GoogleJobsScraper } = require('./packages/scraper/dist/index.js');

async function testGoogleScraper() {
  console.log('🧪 Testing Google Jobs Scraper...');
  
  try {
    const scraper = new GoogleJobsScraper();
    
    const searchParams = {
      keywords: ['developer'],
      location: 'San Francisco',
      remote: false,
      jobTypes: [],
      datePosted: 'week',
      limit: 5
    };
    
    console.log('🔍 Starting Google Jobs search with params:', searchParams);
    
    const results = await scraper.scrape(searchParams);
    
    console.log('✅ Google Jobs scraping completed!');
    console.log(`📊 Results: ${results.jobs.length} jobs found`);
    console.log(`⏱️  Time taken: ${results.metadata.took}ms`);
    
    if (results.jobs.length > 0) {
      console.log('\n🎯 Sample Jobs Found:');
      results.jobs.slice(0, 3).forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   📍 Location: ${job.location}`);
        console.log(`   💰 Salary: ${job.salary || 'Not specified'}`);
        console.log(`   🔗 URL: ${job.url}`);
        console.log(`   📧 Email: ${job.contact?.email || 'Not found'}`);
      });
    } else {
      console.log('❌ No jobs found. This might indicate an issue with Google\'s response.');
    }
    
    // Cleanup
    await scraper.destroy();
    
  } catch (error) {
    console.error('❌ Google scraper test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGoogleScraper(); 