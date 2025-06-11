const axios = require('axios');

async function testEnhancedRedditSearch() {
  console.log('🚀 ENHANCED REDDIT SEARCH TEST - ALL OF REDDIT COVERAGE');
  console.log('='.repeat(60));
  console.log('🎯 Testing comprehensive search like manual Reddit search');
  console.log();

  const keyword = 'wordpress developer';
  const searchModes = ['moderate', 'loose'];
  
  for (const searchMode of searchModes) {
    console.log(`\n📊 Testing Search Mode: ${searchMode.toUpperCase()}`);
    console.log('-'.repeat(40));
    
    try {
      // 1. GLOBAL REDDIT SEARCH (comprehensive like manual search)
      console.log('🌍 1. GLOBAL Reddit Search (ALL subreddits)...');
      
      const globalResults = await searchRedditGlobally(keyword, searchMode);
      console.log(`✅ Global search found: ${globalResults.length} posts`);
      
      // 2. TARGETED SUBREDDIT SEARCH (additional coverage)
      console.log('🎯 2. Targeted Subreddit Search...');
      
      const targetedResults = await searchTargetedSubreddits(keyword, searchMode);
      console.log(`✅ Targeted search found: ${targetedResults.length} posts`);
      
      // 3. COMBINED RESULTS
      const allPosts = [...globalResults, ...targetedResults];
      const uniquePosts = deduplicateByTitle(allPosts);
      
      console.log(`🏆 TOTAL UNIQUE POSTS: ${uniquePosts.length}`);
      console.log(`🔄 Removed duplicates: ${allPosts.length - uniquePosts.length}`);
      
      // Show sample results
      if (uniquePosts.length > 0) {
        console.log('\n📋 Sample Results:');
        uniquePosts.slice(0, 5).forEach((post, i) => {
          console.log(`${i+1}. ${post.title}`);
          console.log(`   📍 r/${post.subreddit} | 🗳️ ${post.score} | 💬 ${post.num_comments}`);
          console.log(`   🕒 ${formatDate(post.created_utc)}`);
          if (post.selftext && post.selftext.length > 0) {
            console.log(`   📄 ${post.selftext.substring(0, 100)}...`);
          }
          console.log();
        });
      }
      
    } catch (error) {
      console.error(`❌ Search mode ${searchMode} failed:`, error.message);
    }
  }
}

async function searchRedditGlobally(keyword, searchMode) {
  const allPosts = [];
  const baseUrl = 'https://www.reddit.com/search.json';
  
  // Build comprehensive search query
  const queries = buildComprehensiveQueries(keyword, searchMode);
  
  // Multiple search strategies for maximum coverage
  const strategies = [
    { sort: 'new', limit: 50 },       // Fresh posts (priority)
    { sort: 'relevance', limit: 40 }, // Most relevant
    { sort: 'hot', limit: 30 },       // Popular posts
    { sort: 'top', limit: 20, t: 'week' } // Top this week
  ];
  
  for (const query of queries) {
    for (const strategy of strategies) {
      try {
        const response = await axios.get(baseUrl, {
          params: {
            q: query,
            ...strategy,
            t: strategy.t || 'week', // Default to 7 days max
            type: 'link,sr'
          },
          headers: {
            'User-Agent': 'JobHonter/1.0 (job search research)'
          },
          timeout: 15000
        });
        
        if (response.data?.data?.children) {
          const posts = response.data.data.children
            .map(child => child.data)
            .filter(post => post && post.title && post.subreddit);
          
          allPosts.push(...posts);
        }
        
        // Rate limiting
        await sleep(1000);
        
      } catch (error) {
        console.log(`⚠️ Query failed: ${query} (${strategy.sort})`);
      }
    }
  }
  
  return allPosts;
}

async function searchTargetedSubreddits(keyword, searchMode) {
  const allPosts = [];
  
  // Comprehensive subreddit list for job searching
  const jobSubreddits = [
    'forhire', 'remotework', 'RemoteJobs', 'jobs', 'hiring', 'WorkOnline',
    'freelance', 'programming', 'webdev', 'javascript', 'PHP', 'WordPress',
    'entrepreneur', 'startups', 'digitalnomad', 'cscareerquestions'
  ];
  
  for (const subreddit of jobSubreddits.slice(0, 10)) { // Limit for testing
    try {
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/search.json`, {
        params: {
          q: keyword,
          restrict_sr: 1,
          sort: 'new',
          limit: 15,
          t: 'week'
        },
        headers: {
          'User-Agent': 'JobHonter/1.0 (job search research)'
        },
        timeout: 8000
      });
      
      if (response.data?.data?.children) {
        const posts = response.data.data.children
          .map(child => child.data)
          .filter(post => post && post.title);
        
        allPosts.push(...posts);
      }
      
      // Rate limiting
      await sleep(500);
      
    } catch (error) {
      console.log(`⚠️ Subreddit r/${subreddit} failed`);
    }
  }
  
  return allPosts;
}

function buildComprehensiveQueries(keyword, searchMode) {
  switch (searchMode) {
    case 'strict':
      return [
        `"${keyword}" AND (hiring OR "looking for" OR "we are hiring")`,
        `"${keyword}" AND (job OR position)`
      ];
    case 'moderate':
      return [
        `${keyword} AND (hiring OR job OR position OR opportunity)`,
        `${keyword} AND remote`,
        `${keyword} AND freelance`
      ];
    case 'loose':
      return [
        `${keyword} AND (hiring OR job OR work OR career OR position OR opportunity OR looking OR need)`,
        `${keyword} AND (remote OR freelance OR contract)`,
        `${keyword} developer`,
        `${keyword} engineer`
      ];
    default:
      return [`${keyword} AND (hiring OR job OR position)`];
  }
}

function deduplicateByTitle(posts) {
  const seen = new Set();
  return posts.filter(post => {
    const key = post.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();
  const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the enhanced test
console.log('🔬 Starting Enhanced Reddit Search Test...');
testEnhancedRedditSearch()
  .then(() => {
    console.log('\n🎉 Enhanced Reddit Search Test Completed!');
    console.log('📈 This demonstrates comprehensive Reddit coverage like manual search');
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  }); 