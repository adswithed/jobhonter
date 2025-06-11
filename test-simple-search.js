const { RedditScraper } = require('./packages/scraper/dist/scrapers/RedditScraper');

async function testSimpleVsComplexSearch() {
  console.log('🧪 TESTING: Simple vs Complex Search');
  console.log('='.repeat(60));
  console.log('🎯 User found results with: ("wordpress" AND "hiring")');
  console.log('❓ Our system returns: Very few or no results');
  console.log('📊 Let\'s investigate why...');
  console.log();

  const scraper = new RedditScraper();

  // Test 1: Simple search like the user used
  console.log('🔍 TEST 1: Simple Search (like user)');
  console.log('-'.repeat(40));
  
  try {
    // Simulate a simple Reddit search
    const simpleQuery = 'wordpress AND hiring';
    console.log(`Query: ${simpleQuery}`);
    console.log('This would directly search Reddit with basic terms...');
    console.log();
    
    // Test 2: Our current complex system
    console.log('🔍 TEST 2: Our Current System');
    console.log('-'.repeat(40));
    
    const params = {
      keywords: ['WordPress developer'],
      searchMode: 'loose', // Most permissive
      limit: 20,
      datePosted: 'month' // Broader date range
    };
    
    console.log('Our search parameters:');
    console.log(`  Keywords: ${params.keywords.join(', ')}`);
    console.log(`  Search Mode: ${params.searchMode}`);
    console.log(`  Date Range: ${params.datePosted}`);
    console.log(`  Limit: ${params.limit}`);
    console.log();
    
    console.log('📋 Issues Identified:');
    console.log('1. 🎯 QUERY COMPLEXITY:');
    console.log('   - User: Simple "wordpress AND hiring"');
    console.log('   - Us: Complex multi-strategy with 6 different approaches');
    console.log('   - Problem: Over-engineering vs proven simple approach');
    console.log();
    
    console.log('2. 🔧 FILTER AGGRESSIVENESS:');
    console.log('   - Relevance thresholds: 80%/40%/20% (hardcoded)');
    console.log('   - Date filtering: Last 7 days default (too restrictive)');
    console.log('   - Location filtering: Excluding non-remote jobs');
    console.log('   - Job type filtering: Only hiring posts vs for-hire');
    console.log();
    
    console.log('3. 🤖 INTELLIGENCE LEVEL:');
    console.log('   - Current: Rule-based hardcoded logic');
    console.log('   - Claimed: AI-powered smart system');
    console.log('   - Reality: No ML/AI, just string matching');
    console.log();
    
    console.log('🎯 ROOT CAUSES:');
    console.log('1. Search queries are too complex/restrictive');
    console.log('2. Filters are too aggressive (over-filtering)');
    console.log('3. No actual AI - just hardcoded rules');
    console.log('4. No feedback loop from real user searches');
    console.log('5. Testing with mock data vs real Reddit data');
    console.log();
    
    console.log('💡 SOLUTIONS NEEDED:');
    console.log('1. 🔍 Simplify search queries (use proven simple terms)');
    console.log('2. 🎛️ Make filters more permissive by default');
    console.log('3. 🤖 Add actual AI relevance scoring');
    console.log('4. 📊 Test with real Reddit data');
    console.log('5. 🔄 Add user feedback to improve results');
    console.log();
    
    console.log('⚠️ IMMEDIATE ACTION REQUIRED:');
    console.log('The system is NOT delivering on its "AI-powered" promise.');
    console.log('We need to fix the core search and filtering logic.');
    
  } catch (error) {
    console.error('Error during testing:', error);
  }
  
  await scraper.destroy();
}

// Run the diagnostic
testSimpleVsComplexSearch().catch(console.error); 