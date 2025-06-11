const { RedditScraper } = require('./packages/scraper/dist/scrapers/RedditScraper');

async function debugLocationFilter() {
  console.log('🔍 DEBUGGING LOCATION FILTER');
  console.log('='.repeat(40));
  
  const scraper = new RedditScraper();
  
  const mockPost = {
    id: '2', 
    title: 'PHP Web Developer Needed',
    selftext: 'Looking for a PHP developer with WordPress experience. WP theme customization required.',
    author: 'webagency',
    subreddit: 'forhire',
    url: 'https://reddit.com/r/forhire/2',
    permalink: '/r/forhire/2',
    created_utc: Date.now() / 1000 - 7200,
    ups: 8,
    num_comments: 1,
    domain: 'self.forhire',
    is_self: true
  };
  
  const params = {
    keywords: ['WordPress developer'],
    searchMode: 'moderate',
    location: 'Remote',
    limit: 10
  };
  
  console.log('📝 Post Details:');
  console.log(`Title: ${mockPost.title}`);
  console.log(`Description: ${mockPost.selftext}`);
  console.log(`Location param: ${params.location}`);
  console.log();
  
  const fullText = `${mockPost.title} ${mockPost.selftext}`;
  
  // Test remote job detection
  console.log('🔍 Testing remote job detection...');
  const isRemote = scraper.checkRemoteJob(fullText, params.remote);
  console.log(`Is Remote: ${isRemote}`);
  
  // Test location matching
  console.log('🔍 Testing location matching...');
  if (params.location && !isRemote) {
    const hasLocation = scraper.matchesLocation(fullText, params.location);
    console.log(`Has location "${params.location}": ${hasLocation}`);
    console.log(`Would be filtered out: ${!hasLocation ? '❌ YES' : '✅ NO'}`);
  } else {
    console.log('Location filter skipped (remote job or no location specified)');
  }
  
  console.log();
  console.log('📊 Analysis:');
  console.log(`Full text: ${fullText.toLowerCase()}`);
  console.log(`Contains "remote": ${fullText.toLowerCase().includes('remote')}`);
  console.log(`Contains "work from home": ${fullText.toLowerCase().includes('work from home')}`);
  console.log(`Contains "wfh": ${fullText.toLowerCase().includes('wfh')}`);
  
  await scraper.destroy();
}

// Run the debug
debugLocationFilter().catch(console.error); 