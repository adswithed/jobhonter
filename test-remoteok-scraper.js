const { RemoteOKScraper } = require('./packages/scraper/dist/index.js');

async function testRemoteOKScraper() {
  console.log('🧪 Testing RemoteOK Scraper...');
  
  try {
    const scraper = new RemoteOKScraper();
    
    const searchParams = {
      keywords: ['developer'],
      location: 'Remote',
      remote: true,
      jobType: ['full-time'],
      datePosted: 'week',
      limit: 5
    };
    
    console.log('🔍 Starting RemoteOK search with params:', searchParams);
    
    const results = await scraper.scrape(searchParams);
    
    console.log('✅ RemoteOK scraping completed!');
    console.log(`📊 Results: ${results.jobs.length} jobs found`);
    console.log(`⏱️  Time taken: ${results.metadata.took}ms`);
    
    if (results.jobs.length > 0) {
      console.log('\n🎯 Sample Jobs Found:');
      results.jobs.slice(0, 3).forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   📍 Location: ${job.location}`);
        console.log(`   💰 Salary: ${job.salary || 'Not specified'}`);
        console.log(`   🔗 URL: ${job.url}`);
        console.log(`   📅 Posted: ${job.postedAt}`);
      });
    } else {
      console.log('⚠️  No jobs found with current search criteria');
    }
    
    console.log('\n🎉 RemoteOK scraper test completed successfully!');
    
  } catch (error) {
    console.error('❌ RemoteOK scraper test failed:', error);
    console.error('Error details:', error.message);
  }
}

testRemoteOKScraper(); 