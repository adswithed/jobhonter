const { RedditScraper } = require('./packages/scraper/dist/scrapers/RedditScraper');

async function validateWordPressSearch() {
  console.log('🔍 WordPress Developer Search Validation');
  console.log('='.repeat(50));
  
  const scraper = new RedditScraper();
  
  // Test with a smaller, focused search to validate improvements
  const testParams = {
    keywords: ['WordPress developer'],
    location: 'Remote',
    limit: 5, // Smaller limit for focused testing
    datePosted: 'week',
    searchMode: 'moderate' // Focus on moderate mode improvements
  };

  console.log('🎯 Testing Enhanced Moderate Mode');
  console.log(`Keywords: ${testParams.keywords.join(', ')}`);
  console.log(`Search Mode: ${testParams.searchMode}`);
  console.log(`Expected: Better WordPress synonym matching`);
  console.log();

  try {
    const startTime = Date.now();
    const result = await scraper.scrape(testParams);
    const endTime = Date.now();
    
    console.log(`✅ Search completed in ${(endTime - startTime) / 1000}s`);
    console.log(`📊 Results: ${result.jobs.length} jobs found`);
    console.log(`🔍 Posts processed: ${result.totalFound}`);
    console.log();
    
    if (result.jobs.length > 0) {
      console.log('📋 Detailed Results Analysis:');
      
      result.jobs.forEach((job, index) => {
        const relevanceScore = job.scraped?.rawData?.relevanceScore || 0;
        const title = job.title.toLowerCase();
        const description = (job.description || '').toLowerCase();
        const fullText = `${title} ${description}`;
        
        // Enhanced analysis
        const exactWordPress = fullText.includes('wordpress developer');
        const wordPressVariants = fullText.includes('wordpress') || fullText.includes('wp ') || fullText.includes('wp-');
        const cmsRelated = fullText.includes('cms') || fullText.includes('content management');
        const phpRelated = fullText.includes('php') || fullText.includes('web development');
        const webDev = fullText.includes('web dev') || fullText.includes('website');
        
        console.log(`\n${index + 1}. ${job.title}`);
        console.log(`   Company: ${job.company || 'Not specified'}`);
        console.log(`   Relevance: ${(relevanceScore * 100).toFixed(1)}%`);
        console.log(`   Source: r/${job.scraped?.rawData?.subreddit || 'reddit'}`);
        
        // Match analysis
        const matches = [];
        if (exactWordPress) matches.push('✅ Exact WordPress Developer');
        if (wordPressVariants) matches.push('🔧 WordPress/WP variants');
        if (cmsRelated) matches.push('📝 CMS related');
        if (phpRelated) matches.push('💻 PHP/Web dev');
        if (webDev) matches.push('🌐 Web development');
        
        console.log(`   Matches: ${matches.length > 0 ? matches.join(', ') : '❓ Unclear relevance'}`);
        
        if (job.contact?.email || job.contactEmail) {
          console.log(`   📧 Contact: ${job.contact?.email || job.contactEmail}`);
        }
      });
      
      // Quality metrics
      const wordPressRelated = result.jobs.filter(job => {
        const text = `${job.title} ${job.description || ''}`.toLowerCase();
        return text.includes('wordpress') || text.includes('wp ') || text.includes('cms') || text.includes('php');
      });
      
      const highRelevance = result.jobs.filter(job => {
        const score = job.scraped?.rawData?.relevanceScore || 0;
        return score >= 0.4; // Moderate mode threshold
      });
      
      console.log('\n📊 Quality Metrics:');
      console.log(`   🔧 WordPress Related: ${wordPressRelated.length}/${result.jobs.length} (${((wordPressRelated.length/result.jobs.length)*100).toFixed(1)}%)`);
      console.log(`   📈 High Relevance (≥40%): ${highRelevance.length}/${result.jobs.length} (${((highRelevance.length/result.jobs.length)*100).toFixed(1)}%)`);
      
      // Success criteria
      const wordPressPercentage = (wordPressRelated.length / result.jobs.length) * 100;
      const relevancePercentage = (highRelevance.length / result.jobs.length) * 100;
      
      console.log('\n🎯 Validation Results:');
      console.log(`   WordPress Relevance: ${wordPressPercentage >= 50 ? '✅ GOOD' : wordPressPercentage >= 25 ? '⚠️ FAIR' : '❌ POOR'} (${wordPressPercentage.toFixed(1)}%)`);
      console.log(`   Score Quality: ${relevancePercentage >= 80 ? '✅ EXCELLENT' : relevancePercentage >= 60 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'} (${relevancePercentage.toFixed(1)}%)`);
      
    } else {
      console.log('⚠️ No results found - may indicate overly strict filtering');
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  } finally {
    await scraper.destroy();
  }
}

// Run validation
validateWordPressSearch().catch(console.error); 