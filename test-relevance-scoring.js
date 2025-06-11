const { RedditScraper } = require('./packages/scraper/dist/scrapers/RedditScraper');

// Mock Reddit posts to test relevance scoring
const mockPosts = [
  {
    id: '1',
    title: 'WordPress Developer Position - Remote',
    selftext: 'We are looking for an experienced WordPress developer to join our team. Must have PHP and MySQL experience.',
    author: 'techcompany',
    subreddit: 'forhire',
    url: 'https://reddit.com/r/forhire/1',
    permalink: '/r/forhire/1',
    created_utc: Date.now() / 1000 - 3600, // 1 hour ago
    ups: 15,
    num_comments: 3,
    domain: 'self.forhire',
    is_self: true
  },
  {
    id: '2', 
    title: 'PHP Web Developer Needed',
    selftext: 'Looking for a PHP developer with WordPress experience. WP theme customization required.',
    author: 'webagency',
    subreddit: 'forhire',
    url: 'https://reddit.com/r/forhire/2',
    permalink: '/r/forhire/2',
    created_utc: Date.now() / 1000 - 7200, // 2 hours ago
    ups: 8,
    num_comments: 1,
    domain: 'self.forhire',
    is_self: true
  },
  {
    id: '3',
    title: 'Frontend Developer - React/Vue',
    selftext: 'We need a frontend developer skilled in React and Vue.js. Some CMS experience preferred.',
    author: 'startup',
    subreddit: 'forhire',
    url: 'https://reddit.com/r/forhire/3',
    permalink: '/r/forhire/3',
    created_utc: Date.now() / 1000 - 10800, // 3 hours ago
    ups: 12,
    num_comments: 5,
    domain: 'self.forhire',
    is_self: true
  },
  {
    id: '4',
    title: 'Full Stack Engineer Position',
    selftext: 'Looking for a full stack engineer with experience in web development, databases, and modern frameworks.',
    author: 'techstartup',
    subreddit: 'forhire',
    url: 'https://reddit.com/r/forhire/4',
    permalink: '/r/forhire/4',
    created_utc: Date.now() / 1000 - 14400, // 4 hours ago
    ups: 20,
    num_comments: 8,
    domain: 'self.forhire',
    is_self: true
  },
  {
    id: '5',
    title: 'Marketing Manager Role',
    selftext: 'We are hiring a marketing manager to lead our digital marketing efforts and grow our brand.',
    author: 'marketingco',
    subreddit: 'forhire',
    url: 'https://reddit.com/r/forhire/5',
    permalink: '/r/forhire/5',
    created_utc: Date.now() / 1000 - 18000, // 5 hours ago
    ups: 5,
    num_comments: 2,
    domain: 'self.forhire',
    is_self: true
  }
];

async function testRelevanceScoring() {
  console.log('🧪 RELEVANCE SCORING TEST');
  console.log('='.repeat(50));
  console.log('🎯 Testing: WordPress developer keyword matching');
  console.log('📊 Mock posts: 5 different job types');
  console.log();

  const scraper = new RedditScraper();
  const keyword = 'WordPress developer';
  
  const modes = ['strict', 'moderate', 'loose'];
  
  for (const mode of modes) {
    console.log(`${mode === 'strict' ? '🎯' : mode === 'moderate' ? '⚖️' : '🔍'} ${mode.toUpperCase()} MODE`);
    console.log('-'.repeat(30));
    
    const searchParams = {
      keywords: [keyword],
      location: undefined,
      remote: true,
      limit: 10,
      searchMode: mode
    };
    
    console.log('📋 Processing mock posts...');
    
    const results = [];
    
    for (const post of mockPosts) {
      try {
        // Use the scraper's internal method to parse the post
        const job = await scraper.parsePostForJob(post, searchParams);
        
        if (job) {
          const relevanceScore = job.scraped?.rawData?.relevanceScore || 0;
          const title = job.title.toLowerCase();
          const description = (job.description || '').toLowerCase();
          const fullText = `${title} ${description}`;
          
          // Analyze match type
          const exactMatch = fullText.includes('wordpress developer');
          const wordpressMatch = fullText.includes('wordpress') || fullText.includes('wp');
          const phpMatch = fullText.includes('php');
          const webDevMatch = fullText.includes('web dev') || fullText.includes('frontend') || fullText.includes('full stack');
          const cmsMatch = fullText.includes('cms');
          
          results.push({
            title: job.title,
            relevanceScore,
            exactMatch,
            wordpressMatch,
            phpMatch,
            webDevMatch,
            cmsMatch,
            included: true
          });
          
          console.log(`   ✅ ${job.title}`);
          console.log(`      Relevance: ${(relevanceScore * 100).toFixed(1)}%`);
          console.log(`      Matches: ${exactMatch ? '🎯 Exact' : wordpressMatch ? '🔧 WordPress' : phpMatch ? '💻 PHP' : webDevMatch ? '🌐 Web Dev' : cmsMatch ? '📝 CMS' : '❓ Other'}`);
        } else {
          results.push({
            title: post.title,
            relevanceScore: 0,
            exactMatch: false,
            wordpressMatch: false,
            phpMatch: false,
            webDevMatch: false,
            cmsMatch: false,
            included: false
          });
          
          console.log(`   ❌ ${post.title} (filtered out)`);
        }
      } catch (error) {
        console.log(`   ⚠️ ${post.title} (error: ${error.message})`);
      }
    }
    
    // Analysis
    const includedJobs = results.filter(r => r.included);
    const exactMatches = includedJobs.filter(r => r.exactMatch).length;
    const wordpressMatches = includedJobs.filter(r => r.wordpressMatch).length;
    const webDevMatches = includedJobs.filter(r => r.webDevMatch).length;
    
    console.log();
    console.log('📊 Results Summary:');
    console.log(`   📈 Jobs included: ${includedJobs.length}/${results.length}`);
    console.log(`   🎯 Exact matches: ${exactMatches}/${includedJobs.length} (${includedJobs.length > 0 ? ((exactMatches/includedJobs.length)*100).toFixed(1) : 0}%)`);
    console.log(`   🔧 WordPress related: ${wordpressMatches}/${includedJobs.length} (${includedJobs.length > 0 ? ((wordpressMatches/includedJobs.length)*100).toFixed(1) : 0}%)`);
    console.log(`   🌐 Web dev related: ${webDevMatches}/${includedJobs.length} (${includedJobs.length > 0 ? ((webDevMatches/includedJobs.length)*100).toFixed(1) : 0}%)`);
    
    if (includedJobs.length > 0) {
      const avgRelevance = includedJobs.reduce((sum, job) => sum + job.relevanceScore, 0) / includedJobs.length;
      console.log(`   📊 Average relevance: ${(avgRelevance * 100).toFixed(1)}%`);
    }
    
    // Mode-specific assessment
    let assessment = '';
    switch (mode) {
      case 'strict':
        const strictQuality = includedJobs.length > 0 ? (exactMatches / includedJobs.length) * 100 : 0;
        assessment = strictQuality >= 80 ? '✅ EXCELLENT' : strictQuality >= 50 ? '⚠️ GOOD' : '❌ POOR';
        console.log(`   🎯 Strict Quality: ${assessment} (${strictQuality.toFixed(1)}% exact matches, target: 80%+)`);
        break;
      case 'moderate':
        const moderateQuality = includedJobs.length > 0 ? (wordpressMatches / includedJobs.length) * 100 : 0;
        assessment = moderateQuality >= 40 ? '✅ EXCELLENT' : moderateQuality >= 25 ? '⚠️ GOOD' : '❌ POOR';
        console.log(`   ⚖️ Moderate Quality: ${assessment} (${moderateQuality.toFixed(1)}% WordPress related, target: 40%+)`);
        break;
      case 'loose':
        const looseQuality = includedJobs.length > 0 ? (webDevMatches / includedJobs.length) * 100 : 0;
        assessment = looseQuality >= 20 ? '✅ EXCELLENT' : looseQuality >= 10 ? '⚠️ GOOD' : '❌ POOR';
        console.log(`   🔍 Loose Quality: ${assessment} (${looseQuality.toFixed(1)}% web dev related, target: 20%+)`);
        break;
    }
    
    console.log();
  }
  
  await scraper.destroy();
  
  console.log('🏁 RELEVANCE SCORING ASSESSMENT');
  console.log('='.repeat(40));
  console.log('✅ Test completed successfully');
  console.log('📊 Each mode filters and scores posts differently');
  console.log('🎯 Strict mode should show highest precision');
  console.log('⚖️ Moderate mode should balance relevance and discovery');
  console.log('🔍 Loose mode should maximize opportunity discovery');
}

// Run the test
testRelevanceScoring().catch(console.error); 