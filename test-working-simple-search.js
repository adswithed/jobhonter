const axios = require('axios');

async function testWorkingSimpleSearch() {
  console.log('🔍 TESTING: Working Simple Search');
  console.log('='.repeat(50));
  console.log('🎯 Using the approach that actually works');
  console.log();

  try {
    // Test WordPress developer search with simple approach
    const results = await searchRedditSimple('wordpress AND (hiring OR job OR developer)', {
      limit: 20,
      timeframe: 'month'
    });
    
    console.log(`✅ Found ${results.length} posts`);
    
    // Filter for actual job-related posts
    const jobPosts = results.filter(post => {
      const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
      return (
        text.includes('hiring') || 
        text.includes('looking for') || 
        text.includes('we need') ||
        text.includes('job') ||
        text.includes('position') ||
        text.includes('developer')
      );
    });
    
    console.log(`🎯 Job-related posts: ${jobPosts.length}/${results.length}`);
    console.log();
    
    if (jobPosts.length > 0) {
      console.log('📋 FOUND JOBS:');
      console.log('-'.repeat(30));
      
      jobPosts.slice(0, 10).forEach((post, i) => {
        console.log(`${i+1}. ${post.title}`);
        console.log(`   📍 r/${post.subreddit}`);
        console.log(`   📊 Score: ${post.score} | Comments: ${post.num_comments}`);
        console.log(`   🔗 URL: https://reddit.com${post.permalink}`);
        
        // Check if it's actually WordPress related
        const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
        const isWordPressRelated = text.includes('wordpress') || text.includes('wp');
        const isDeveloperRelated = text.includes('developer') || text.includes('dev') || text.includes('programming');
        
        console.log(`   ✅ WordPress: ${isWordPressRelated} | Developer: ${isDeveloperRelated}`);
        console.log();
      });
      
      console.log('🎯 SUCCESS FACTORS:');
      console.log('1. ✅ Simple search query that works');
      console.log('2. ✅ Permissive filtering (not over-filtering)');
      console.log('3. ✅ Broader time range (month vs week)');
      console.log('4. ✅ Fast execution (no complex processing)');
      console.log();
      
      console.log('❌ PROBLEMS WITH CURRENT SYSTEM:');
      console.log('1. Over-complex multi-strategy search');
      console.log('2. Too restrictive filters');
      console.log('3. Slow execution causing timeouts');
      console.log('4. Missing real jobs that exist');
    } else {
      console.log('❌ No job posts found even with simple approach');
    }
    
  } catch (error) {
    console.error('❌ Simple search failed:', error.message);
  }
}

async function searchRedditSimple(query, options = {}) {
  const response = await axios.get('https://www.reddit.com/search.json', {
    params: {
      q: query,
      limit: options.limit || 25,
      sort: 'new',
      t: options.timeframe || 'month',
      type: 'link,sr'
    },
    headers: {
      'User-Agent': 'JobHonter/1.0 (research purposes)'
    },
    timeout: 10000
  });
  
  if (response.data?.data?.children) {
    return response.data.data.children.map(child => child.data);
  }
  
  return [];
}

// Run the test
testWorkingSimpleSearch().catch(console.error); 