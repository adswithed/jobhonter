const { RedditScraper } = require('./packages/scraper/dist/scrapers/RedditScraper');

async function debugRelevanceScore() {
  console.log('🔍 DEBUGGING RELEVANCE SCORE');
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
  console.log(`Keywords: ${params.keywords.join(', ')}`);
  console.log(`Search Mode: ${params.searchMode}`);
  console.log();
  
  // Calculate relevance score directly
  console.log('🔍 Calculating relevance score...');
  const relevanceScore = scraper.calculateRelevanceScore(mockPost, params);
  console.log(`Relevance Score: ${(relevanceScore * 100).toFixed(1)}%`);
  
  // Get minimum required score
  const minScore = scraper.getMinRelevanceScore(params.searchMode);
  console.log(`Minimum Required: ${(minScore * 100).toFixed(1)}%`);
  console.log(`Passes Threshold: ${relevanceScore >= minScore ? '✅ YES' : '❌ NO'}`);
  
  console.log();
  console.log('📊 Analysis:');
  const fullText = `${mockPost.title} ${mockPost.selftext}`.toLowerCase();
  console.log(`Full text: ${fullText}`);
  
  // Check exact match
  const exactMatch = fullText.includes('wordpress developer');
  console.log(`Exact match "wordpress developer": ${exactMatch}`);
  
  // Check partial matches
  const hasWordPress = fullText.includes('wordpress') || fullText.includes('wp');
  const hasDeveloper = fullText.includes('developer') || fullText.includes('dev');
  console.log(`Has WordPress: ${hasWordPress}`);
  console.log(`Has Developer: ${hasDeveloper}`);
  
  await scraper.destroy();
}

// Run the debug
debugRelevanceScore().catch(console.error); 