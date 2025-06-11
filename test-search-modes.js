const { RedditScraper } = require('./packages/scraper/dist/scrapers/RedditScraper');

async function demonstrateSearchModes() {
  console.log('🎯 Reddit Search Modes Demonstration');
  console.log('='.repeat(70));
  console.log();
  
  const scraper = new RedditScraper();
  
  const baseParams = {
    keywords: ['javascript developer'],
    location: 'San Francisco',
    limit: 5
  };

  console.log('📋 Base Search Parameters:');
  console.log(`   Keywords: ${baseParams.keywords.join(', ')}`);
  console.log(`   Location: ${baseParams.location}`);
  console.log(`   Limit: ${baseParams.limit} jobs per mode`);
  console.log();

  try {
    // Test each search mode
    const modes = [
      {
        name: 'Strict Mode',
        mode: 'strict',
        icon: '🎯',
        description: 'Only exact keyword matches, 80% relevance threshold'
      },
      {
        name: 'Moderate Mode', 
        mode: 'moderate',
        icon: '⚖️',
        description: 'Partial matches + synonyms, 40% relevance threshold'
      },
      {
        name: 'Loose Mode',
        mode: 'loose', 
        icon: '🔍',
        description: 'Broad discovery with related terms, 20% threshold'
      }
    ];

    const results = {};

    for (const { name, mode, icon, description } of modes) {
      console.log(`${icon} ${name.toUpperCase()}`);
      console.log('-'.repeat(50));
      console.log(`📖 ${description}`);
      console.log();
      
      const startTime = Date.now();
      
      try {
        const searchParams = { ...baseParams, searchMode: mode };
        const result = await scraper.scrape(searchParams);
        const endTime = Date.now();
        
        results[mode] = result;
        
        console.log(`✅ Search completed in ${(endTime - startTime) / 1000}s`);
        console.log(`📊 Results: ${result.jobs.length} jobs found`);
        console.log(`🔍 Posts processed: ${result.totalFound}`);
        console.log();
        
        if (result.jobs.length > 0) {
          console.log('📋 Sample Jobs:');
          result.jobs.slice(0, 2).forEach((job, index) => {
            const relevanceScore = job.scraped?.rawData?.relevanceScore || 'N/A';
            console.log(`   ${index + 1}. ${job.title}`);
            console.log(`      Company: ${job.company}`);
            console.log(`      Relevance: ${typeof relevanceScore === 'number' ? (relevanceScore * 100).toFixed(1) + '%' : relevanceScore}`);
            console.log(`      Source: r/${job.scraped?.rawData?.subreddit || 'reddit'}`);
            console.log();
          });
        } else {
          console.log('   ℹ️  No jobs found with current criteria');
          console.log();
        }
        
      } catch (error) {
        console.log(`❌ ${name} failed: ${error.message}`);
        console.log();
      }
      
      // Add delay between modes
      if (mode !== 'loose') {
        console.log('⏳ Waiting 3 seconds before next mode...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log();
      }
    }

    // Summary comparison
    console.log('📊 SEARCH MODES COMPARISON');
    console.log('='.repeat(70));
    
    const strictJobs = results.strict?.jobs.length || 0;
    const moderateJobs = results.moderate?.jobs.length || 0;
    const looseJobs = results.loose?.jobs.length || 0;
    
    console.log(`🎯 Strict Mode:    ${strictJobs} jobs (Highest precision)`);
    console.log(`⚖️  Moderate Mode:  ${moderateJobs} jobs (Balanced approach)`);
    console.log(`🔍 Loose Mode:     ${looseJobs} jobs (Maximum discovery)`);
    console.log();
    
    console.log('🎛️ USER CONTROL BENEFITS:');
    console.log('   ✅ Choose precision vs discovery based on needs');
    console.log('   ✅ Strict mode eliminates false positives');
    console.log('   ✅ Loose mode finds hidden opportunities');
    console.log('   ✅ Moderate mode provides balanced results');
    console.log('   ✅ Relevance scores help rank results');
    console.log();
    
    console.log('🚀 IMPLEMENTATION FEATURES:');
    console.log('   📊 Real-time relevance scoring');
    console.log('   🔍 Smart synonym and partial matching');
    console.log('   🎯 Adaptive search queries per mode');
    console.log('   📋 Detailed metadata for user feedback');
    console.log('   ⚡ All modes run on same comprehensive subreddit coverage');
    
  } catch (error) {
    console.error('❌ Demonstration failed:', error.message);
  } finally {
    await scraper.destroy();
  }
}

// Run the demonstration
demonstrateSearchModes().catch(console.error); 