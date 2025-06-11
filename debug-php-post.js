const { RedditScraper } = require('./packages/scraper/dist/scrapers/RedditScraper');

async function debugPhpPost() {
  console.log('🔍 DEBUGGING PHP WEB DEVELOPER POST');
  console.log('='.repeat(50));
  
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
  console.log(`Search Mode: ${params.searchMode}`);
  console.log();
  
  // Test isJobRelatedPost
  console.log('🔍 Testing isJobRelatedPost...');
  const isJobRelated = scraper.isJobRelatedPost(mockPost);
  console.log(`Result: ${isJobRelated}`);
  console.log();
  
  // Test isRelevantJob
  console.log('🔍 Testing isRelevantJob...');
  const isRelevant = scraper.isRelevantJob(mockPost, params);
  console.log(`Result: ${isRelevant}`);
  console.log();
  
  // Test parsePostForJob
  console.log('🔍 Testing parsePostForJob...');
  try {
    const job = await scraper.parsePostForJob(mockPost, params);
    console.log(`Result: ${job ? 'Job created' : 'Job filtered out'}`);
    if (job) {
      console.log(`Job title: ${job.title}`);
      console.log(`Relevance score: ${job.scraped?.rawData?.relevanceScore || 'N/A'}`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  
  await scraper.destroy();
}

// Run the debug
debugPhpPost().catch(console.error); 