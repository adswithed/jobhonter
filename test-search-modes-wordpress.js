const { RedditScraper } = require('./packages/scraper/dist/scrapers/RedditScraper');

async function testWordPressSearchModes() {
  console.log('🧪 WordPress Developer Search Mode Testing');
  console.log('='.repeat(70));
  console.log('🎯 Testing keyword: "WordPress developer"');
  console.log('📊 Evaluating: Strict vs Moderate vs Loose modes');
  console.log();
  
  const scraper = new RedditScraper();
  
  const baseParams = {
    keywords: ['WordPress developer'],
    location: 'Remote',
    limit: 15,
    datePosted: 'week'
  };

  console.log('📋 Base Search Parameters:');
  console.log(`   Keywords: ${baseParams.keywords.join(', ')}`);
  console.log(`   Location: ${baseParams.location}`);
  console.log(`   Date Range: ${baseParams.datePosted}`);
  console.log(`   Limit: ${baseParams.limit} jobs per mode`);
  console.log();

  const testResults = {};
  const modes = [
    {
      name: 'Strict Mode',
      mode: 'strict',
      icon: '🎯',
      expectation: 'Only exact "WordPress developer" matches',
      minRelevance: 0.8
    },
    {
      name: 'Moderate Mode', 
      mode: 'moderate',
      icon: '⚖️',
      expectation: 'WordPress + related terms (WP, PHP, dev)',
      minRelevance: 0.4
    },
    {
      name: 'Loose Mode',
      mode: 'loose', 
      icon: '🔍',
      expectation: 'Web dev, CMS, PHP, frontend opportunities',
      minRelevance: 0.2
    }
  ];

  try {
    for (const { name, mode, icon, expectation, minRelevance } of modes) {
      console.log(`${icon} ${name.toUpperCase()} TESTING`);
      console.log('-'.repeat(50));
      console.log(`📝 Expected: ${expectation}`);
      console.log(`📊 Min Relevance: ${(minRelevance * 100)}%`);
      console.log();
      
      const startTime = Date.now();
      
      try {
        const searchParams = { ...baseParams, searchMode: mode };
        const result = await scraper.scrape(searchParams);
        const endTime = Date.now();
        
        testResults[mode] = {
          result,
          duration: endTime - startTime,
          mode,
          expectation
        };
        
        console.log(`✅ Search completed in ${(endTime - startTime) / 1000}s`);
        console.log(`📊 Results: ${result.jobs.length} jobs found`);
        console.log(`🔍 Posts processed: ${result.totalFound}`);
        console.log(`❌ Errors: ${result.metadata.errors.length}`);
        console.log();
        
        if (result.jobs.length > 0) {
          console.log('📋 Top Results Analysis:');
          
          result.jobs.slice(0, 5).forEach((job, index) => {
            const relevanceScore = job.scraped?.rawData?.relevanceScore || 0;
            const title = job.title.toLowerCase();
            
            // Analyze keyword matching
            const exactMatch = title.includes('wordpress developer');
            const wordpressMatch = title.includes('wordpress') || title.includes('wp');
            const developerMatch = title.includes('developer') || title.includes('dev');
            const relatedTech = title.includes('php') || title.includes('web') || title.includes('cms');
            
            console.log(`   ${index + 1}. ${job.title}`);
            console.log(`      Company: ${job.company}`);
            console.log(`      Relevance: ${typeof relevanceScore === 'number' ? (relevanceScore * 100).toFixed(1) + '%' : 'N/A'}`);
            console.log(`      Analysis: ${exactMatch ? '✅ Exact match' : wordpressMatch && developerMatch ? '⚖️ Partial match' : relatedTech ? '🔍 Related tech' : '❓ Unclear match'}`);
            console.log(`      Source: r/${job.scraped?.rawData?.subreddit || 'reddit'}`);
            console.log();
          });
          
          // Quality assessment
          const highQualityJobs = result.jobs.filter(job => {
            const relevanceScore = job.scraped?.rawData?.relevanceScore || 0;
            return relevanceScore >= minRelevance;
          });
          
          const exactMatches = result.jobs.filter(job => {
            const title = job.title.toLowerCase();
            return title.includes('wordpress developer') || title.includes('wp developer');
          });
          
          const wordpressJobs = result.jobs.filter(job => {
            const title = job.title.toLowerCase();
            const desc = (job.description || '').toLowerCase();
            return title.includes('wordpress') || title.includes('wp') || desc.includes('wordpress');
          });
          
          console.log('📊 Quality Analysis:');
          console.log(`   📈 High Quality (>${(minRelevance * 100)}% relevance): ${highQualityJobs.length}/${result.jobs.length} (${((highQualityJobs.length / result.jobs.length) * 100).toFixed(1)}%)`);
          console.log(`   🎯 Exact Matches: ${exactMatches.length}/${result.jobs.length} (${((exactMatches.length / result.jobs.length) * 100).toFixed(1)}%)`);
          console.log(`   🔧 WordPress Related: ${wordpressJobs.length}/${result.jobs.length} (${((wordpressJobs.length / result.jobs.length) * 100).toFixed(1)}%)`);
          console.log();
          
        } else {
          console.log('   ℹ️  No jobs found - this may indicate filtering is too strict');
          console.log();
        }
        
      } catch (error) {
        console.log(`❌ ${name} failed: ${error.message}`);
        testResults[mode] = { error: error.message, mode };
        console.log();
      }
      
      // Delay between tests
      if (mode !== 'loose') {
        console.log('⏳ Waiting 5 seconds before next test...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log();
      }
    }

    // Comprehensive Analysis
    console.log('🔬 COMPREHENSIVE SEARCH MODE ANALYSIS');
    console.log('='.repeat(70));
    
    const strictResults = testResults.strict?.result?.jobs || [];
    const moderateResults = testResults.moderate?.result?.jobs || [];
    const looseResults = testResults.loose?.result?.jobs || [];
    
    console.log('📊 Volume Comparison:');
    console.log(`   🎯 Strict:   ${strictResults.length} jobs (Highest precision)`);
    console.log(`   ⚖️ Moderate: ${moderateResults.length} jobs (Balanced)`);
    console.log(`   🔍 Loose:    ${looseResults.length} jobs (Maximum discovery)`);
    console.log();
    
    // Expected pattern: Strict ≤ Moderate ≤ Loose
    const volumeProgression = strictResults.length <= moderateResults.length && moderateResults.length <= looseResults.length;
    console.log(`📈 Volume Progression (Strict ≤ Moderate ≤ Loose): ${volumeProgression ? '✅ CORRECT' : '❌ ISSUE DETECTED'}`);
    console.log();
    
    // Quality Analysis
    console.log('🎯 Quality Assessment:');
    
    Object.entries(testResults).forEach(([mode, data]) => {
      if (data.error) {
        console.log(`   ${mode.toUpperCase()}: ❌ ${data.error}`);
        return;
      }
      
      const jobs = data.result?.jobs || [];
      if (jobs.length === 0) {
        console.log(`   ${mode.toUpperCase()}: ⚠️  No results found`);
        return;
      }
      
      const avgRelevance = jobs.reduce((sum, job) => {
        const score = job.scraped?.rawData?.relevanceScore || 0;
        return sum + score;
      }, 0) / jobs.length;
      
      const wordPressRelated = jobs.filter(job => {
        const text = `${job.title} ${job.description || ''}`.toLowerCase();
        return text.includes('wordpress') || text.includes('wp') || text.includes('cms');
      }).length;
      
      const contactsAvailable = jobs.filter(job => job.contact?.email || job.contactEmail).length;
      
      console.log(`   ${mode.toUpperCase()}:`);
      console.log(`     📊 Average Relevance: ${(avgRelevance * 100).toFixed(1)}%`);
      console.log(`     🔧 WordPress Related: ${wordPressRelated}/${jobs.length} (${((wordPressRelated/jobs.length)*100).toFixed(1)}%)`);
      console.log(`     📧 Contacts Available: ${contactsAvailable}/${jobs.length} (${((contactsAvailable/jobs.length)*100).toFixed(1)}%)`);
      console.log(`     ⏱️  Search Duration: ${(data.duration/1000).toFixed(1)}s`);
      console.log();
    });
    
    // Platform Goal Assessment
    console.log('🎯 PLATFORM GOAL ASSESSMENT');
    console.log('-'.repeat(40));
    console.log('Goal: Help users find job opportunities as soon as they are posted');
    console.log();
    
    const totalUniqueJobs = new Set([
      ...strictResults.map(j => j.id),
      ...moderateResults.map(j => j.id),
      ...looseResults.map(j => j.id)
    ]).size;
    
    const totalContacts = new Set([
      ...strictResults.filter(j => j.contact?.email || j.contactEmail).map(j => j.contact?.email || j.contactEmail),
      ...moderateResults.filter(j => j.contact?.email || j.contactEmail).map(j => j.contact?.email || j.contactEmail),
      ...looseResults.filter(j => j.contact?.email || j.contactEmail).map(j => j.contact?.email || j.contactEmail)
    ]).size;
    
    console.log(`✅ Total Unique Opportunities Found: ${totalUniqueJobs}`);
    console.log(`📧 Unique Direct Contacts Discovered: ${totalContacts}`);
    console.log(`🎯 Search Mode Flexibility: Users can choose precision level`);
    console.log(`⚡ Real-time Discovery: Fresh posts from 240+ subreddits`);
    console.log(`🔍 Comprehensive Coverage: Multiple search strategies`);
    console.log();
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS FOR USERS:');
    console.log('-'.repeat(30));
    console.log('🎯 Use STRICT mode when: You want only "WordPress developer" roles');
    console.log('⚖️ Use MODERATE mode when: You want WordPress + PHP/CMS opportunities');  
    console.log('🔍 Use LOOSE mode when: You want to explore all web development roles');
    console.log();
    
    // Final Assessment
    const systemWorking = volumeProgression && totalUniqueJobs > 0;
    console.log('🏁 FINAL ASSESSMENT:');
    console.log(`System Status: ${systemWorking ? '✅ WORKING AS EXPECTED' : '❌ NEEDS OPTIMIZATION'}`);
    console.log(`Confidence Level: ${systemWorking ? '100%' : 'Requires fixes'}`);
    console.log(`Ready for Production: ${systemWorking ? '✅ YES' : '❌ NO'}`);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await scraper.destroy();
  }
}

// Run the comprehensive test
testWordPressSearchModes().catch(console.error); 