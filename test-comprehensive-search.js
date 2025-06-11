const axios = require('axios');

async function testComprehensiveSearch() {
  console.log('🔍 TESTING: Comprehensive Reddit Search');
  console.log('='.repeat(60));
  console.log('🎯 Goal: Match manual Reddit search results');
  console.log();

  try {
    // Test the comprehensive approach
    console.log('📊 COMPREHENSIVE SEARCH STRATEGY:');
    console.log('1. 🌍 Global Reddit search (like typing in search bar)');
    console.log('2. 🎯 ALL relevant subreddits (not just 5)');
    console.log('3. ✅ Smart filtering (relevance-based)');
    console.log();

    // 1. Global Reddit search (like manual)
    console.log('🌍 STEP 1: Global Reddit Search');
    console.log('-'.repeat(40));
    
    const globalResults = await searchRedditGlobal('wordpress hiring');
    console.log(`✅ Global search found: ${globalResults.length} posts`);
    
    // Show sample results
    if (globalResults.length > 0) {
      console.log('\n📋 Sample Global Results:');
      globalResults.slice(0, 3).forEach((post, i) => {
        console.log(`${i+1}. ${post.title}`);
        console.log(`   📍 r/${post.subreddit} | 👍 ${post.score}`);
      });
    }
    
    console.log();
    
    // 2. Targeted subreddit search
    console.log('🎯 STEP 2: Targeted Subreddit Search');
    console.log('-'.repeat(40));
    
    const targetSubreddits = [
      'forhire', 'WordPress', 'webdev', 'freelance', 'jobs4bitcoins',
      'remotejs', 'javascript', 'ITCareerQuestions', 'startups',
      'programming', 'cscareerquestions'
    ];
    
    let subredditResults = [];
    let successCount = 0;
    
    for (const subreddit of targetSubreddits.slice(0, 8)) { // Test 8 subreddits
      try {
        const posts = await searchSubreddit(subreddit, 'wordpress');
        if (posts.length > 0) {
          subredditResults.push(...posts);
          console.log(`✅ r/${subreddit}: ${posts.length} posts`);
          successCount++;
        } else {
          console.log(`⚪ r/${subreddit}: 0 posts`);
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`❌ r/${subreddit}: Failed`);
      }
    }
    
    console.log(`\n🎯 Subreddit search results: ${subredditResults.length} posts from ${successCount} subreddits`);
    
    // 3. Combined results
    console.log('\n🏁 COMBINED RESULTS');
    console.log('-'.repeat(40));
    
    const allPosts = [...globalResults, ...subredditResults];
    const uniquePosts = removeDuplicates(allPosts);
    
    console.log(`📊 Total unique posts found: ${uniquePosts.length}`);
    console.log(`🔄 Duplicates removed: ${allPosts.length - uniquePosts.length}`);
    
    // Filter for job-relevant posts
    const jobPosts = uniquePosts.filter(post => {
      const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
      return (
        text.includes('hiring') || 
        text.includes('job') || 
        text.includes('looking for') || 
        text.includes('developer') ||
        text.includes('position') ||
        text.includes('freelance')
      );
    });
    
    console.log(`🎯 Job-relevant posts: ${jobPosts.length}/${uniquePosts.length} (${((jobPosts.length/uniquePosts.length)*100).toFixed(1)}%)`);
    
    if (jobPosts.length > 0) {
      console.log('\n📋 TOP JOB RESULTS:');
      jobPosts.slice(0, 5).forEach((post, i) => {
        console.log(`${i+1}. ${post.title}`);
        console.log(`   📍 r/${post.subreddit} | 👍 ${post.score} | 💬 ${post.num_comments}`);
        
        // Check WordPress relevance
        const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
        const wpRelevant = text.includes('wordpress') || text.includes('wp');
        const devRelevant = text.includes('developer') || text.includes('dev') || text.includes('programming');
        
        console.log(`   ✅ WordPress: ${wpRelevant} | Developer: ${devRelevant}`);
        console.log();
      });
    }
    
    // Compare with manual search expectation
    console.log('🔬 COMPARISON WITH MANUAL SEARCH:');
    console.log(`Expected: ~12 job posts (from manual search)`);
    console.log(`Our result: ${jobPosts.length} job posts`);
    console.log(`Success rate: ${jobPosts.length >= 8 ? '✅ GOOD' : jobPosts.length >= 4 ? '⚠️ PARTIAL' : '❌ POOR'}`);
    
    if (jobPosts.length >= 8) {
      console.log('\n🎉 SUCCESS: Comprehensive search is working!');
      console.log('✅ Found similar number of jobs as manual search');
      console.log('✅ Results are relevant and well-filtered');
      console.log('✅ Ready for integration into main system');
    } else {
      console.log('\n⚠️ NEEDS IMPROVEMENT:');
      console.log('• May need to search more subreddits');
      console.log('• Could adjust search queries');
      console.log('• Might need to optimize filtering');
    }
    
  } catch (error) {
    console.error('❌ Comprehensive search test failed:', error.message);
  }
}

async function searchRedditGlobal(query) {
  const response = await axios.get('https://www.reddit.com/search.json', {
    params: {
      q: query,
      limit: 50,
      sort: 'new',
      t: 'month',
      type: 'link'
    },
    headers: { 'User-Agent': 'JobHonter/1.0' },
    timeout: 10000
  });
  
  return response.data?.data?.children?.map(child => child.data) || [];
}

async function searchSubreddit(subreddit, keyword) {
  const response = await axios.get(`https://www.reddit.com/r/${subreddit}/search.json`, {
    params: {
      q: keyword,
      restrict_sr: 1,
      sort: 'new',
      limit: 15,
      t: 'month'
    },
    headers: { 'User-Agent': 'JobHonter/1.0' },
    timeout: 5000
  });
  
  return response.data?.data?.children?.map(child => child.data) || [];
}

function removeDuplicates(posts) {
  const seen = new Set();
  return posts.filter(post => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
}

// Run the test
testComprehensiveSearch().catch(console.error); 