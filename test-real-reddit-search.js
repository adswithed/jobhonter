const axios = require('axios');

async function testRealRedditSearch() {
  console.log('🔍 TESTING REAL REDDIT SEARCH');
  console.log('='.repeat(50));
  console.log('🎯 Comparing our system vs manual Reddit search');
  console.log();

  // Test 1: Manual Reddit search (what user found works)
  console.log('📊 TEST 1: Manual Reddit Search');
  console.log('-'.repeat(30));
  
  try {
    // Use Reddit's own search API with simple terms
    const redditSearchUrl = 'https://www.reddit.com/search.json';
    const manualQuery = 'wordpress AND hiring';
    
    console.log(`Query: ${manualQuery}`);
    console.log('Searching Reddit directly...');
    
    const response = await axios.get(redditSearchUrl, {
      params: {
        q: manualQuery,
        limit: 25,
        sort: 'new',
        t: 'month'
      },
      headers: {
        'User-Agent': 'JobHonter/1.0 (research purposes)'
      }
    });
    
    if (response.data && response.data.data && response.data.data.children) {
      const posts = response.data.data.children.map(child => child.data);
      console.log(`✅ Found ${posts.length} posts with manual search`);
      
      // Analyze the results
      const jobRelatedPosts = posts.filter(post => {
        const text = `${post.title} ${post.selftext}`.toLowerCase();
        return text.includes('hiring') || text.includes('job') || 
               text.includes('looking for') || text.includes('we need');
      });
      
      console.log(`🎯 Job-related posts: ${jobRelatedPosts.length}/${posts.length}`);
      
      // Show top 5 examples
      console.log('\n📋 Top 5 Results:');
      jobRelatedPosts.slice(0, 5).forEach((post, i) => {
        console.log(`${i+1}. ${post.title}`);
        console.log(`   Subreddit: r/${post.subreddit}`);
        console.log(`   Score: ${post.score} | Comments: ${post.num_comments}`);
        if (post.selftext && post.selftext.length > 0) {
          const preview = post.selftext.substring(0, 100);
          console.log(`   Preview: ${preview}${post.selftext.length > 100 ? '...' : ''}`);
        }
        console.log();
      });
      
    } else {
      console.log('❌ No results from manual search');
    }
    
  } catch (error) {
    console.error('❌ Manual search failed:', error.message);
  }
  
  console.log('\n🔧 TEST 2: Our Improved System');
  console.log('-'.repeat(30));
  console.log('Testing with backend API...');
  
  try {
    // Test our backend API with simplified approach
    const backendResponse = await axios.post('http://localhost:3001/api/scraper/test-reddit', {
      keywords: ['WordPress developer'],
      searchMode: 'loose',
      limit: 20,
      maxDaysOld: 30,
      onlyHiring: false // More permissive
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    });
    
    if (backendResponse.data.success) {
      const jobs = backendResponse.data.data?.jobs || [];
      console.log(`✅ Our system found: ${jobs.length} jobs`);
      
      if (jobs.length > 0) {
        console.log('\n📋 Our Top 3 Results:');
        jobs.slice(0, 3).forEach((job, i) => {
          console.log(`${i+1}. ${job.title}`);
          console.log(`   Company: ${job.company || 'Not specified'}`);
          console.log(`   Relevance: ${((job.scraped?.rawData?.relevanceScore || 0) * 100).toFixed(1)}%`);
          if (job.contact?.email || job.contactEmail) {
            console.log(`   📧 Contact: Available`);
          }
          console.log();
        });
      }
    } else {
      console.log(`❌ Our system failed: ${backendResponse.data.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Our system error: ${error.message}`);
  }
  
  console.log('\n🏁 COMPARISON SUMMARY');
  console.log('='.repeat(30));
  console.log('This test shows if our improvements work better');
  console.log('We should see more results with the simplified approach');
}

// Run the test
testRealRedditSearch().catch(console.error); 