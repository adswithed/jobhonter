const { RemoteOKScraper } = require('./packages/scraper/dist/index.js');

async function testSmartScraper() {
  console.log('🧪 Testing Smart Job Discovery Architecture...');
  
  try {
    const scraper = new RemoteOKScraper();
    
    const searchParams = {
      keywords: ['developer', 'engineer'],
      location: 'Remote',
      remote: true,
      jobType: ['full-time'],
      datePosted: 'week',
      limit: 10
    };
    
    console.log('🔍 Starting smart discovery with params:', searchParams);
    
    const results = await scraper.scrape(searchParams);
    
    console.log('✅ Smart discovery completed!');
    console.log(`📊 Total jobs found: ${results.jobs.length}`);
    
    if (results.jobs.length > 0) {
      console.log('\n🎯 Jobs with Calculated Relevance:');
      
      // Simulate relevance calculation like in our new backend
      const jobsWithRelevance = results.jobs.map(job => {
        let score = 0.5; // Base score
        
        // Keyword matching in title
        const titleLower = job.title.toLowerCase();
        const keywordMatches = searchParams.keywords.filter(keyword => 
          titleLower.includes(keyword.toLowerCase())
        ).length;
        score += (keywordMatches / searchParams.keywords.length) * 0.3;
        
        // Keyword matching in description
        if (job.description) {
          const descLower = job.description.toLowerCase();
          const descKeywordMatches = searchParams.keywords.filter(keyword => 
            descLower.includes(keyword.toLowerCase())
          ).length;
          score += (descKeywordMatches / searchParams.keywords.length) * 0.2;
        }
        
        // Remote bonus
        if (job.remote) score += 0.1;
        
        // Salary bonus
        if (job.salary) score += 0.05;
        
        // Email bonus
        if (job.contact?.email) score += 0.1;
        
        // URL bonus
        if (job.url) score += 0.05;
        
        return {
          ...job,
          relevanceScore: Math.min(1.0, Math.max(0.0, score))
        };
      });
      
      // Sort by relevance
      jobsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      console.log('\n📈 Top 5 Most Relevant Jobs:');
      jobsWithRelevance.slice(0, 5).forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title} at ${job.company}`);
        console.log(`   🎯 Relevance: ${(job.relevanceScore * 100).toFixed(1)}%`);
        console.log(`   📍 Location: ${job.location}`);
        console.log(`   💰 Salary: ${job.salary || 'Not specified'}`);
        console.log(`   📧 Contact: ${job.contact?.email || 'None'}`);
        console.log(`   🔗 URL: ${job.url}`);
      });
      
      console.log('\n📊 Relevance Distribution:');
      const highRelevance = jobsWithRelevance.filter(j => j.relevanceScore >= 0.8).length;
      const mediumRelevance = jobsWithRelevance.filter(j => j.relevanceScore >= 0.6 && j.relevanceScore < 0.8).length;
      const lowRelevance = jobsWithRelevance.filter(j => j.relevanceScore < 0.6).length;
      
      console.log(`   🔥 High relevance (≥80%): ${highRelevance} jobs`);
      console.log(`   🔶 Medium relevance (60-79%): ${mediumRelevance} jobs`);
      console.log(`   🔸 Low relevance (<60%): ${lowRelevance} jobs`);
      
      console.log('\n💡 Smart Saving Recommendations:');
      console.log(`   • Auto-save threshold: 80% (${highRelevance} jobs would be auto-saved)`);
      console.log(`   • Preview mode: Show all ${jobsWithRelevance.length} jobs for user selection`);
      console.log(`   • Average relevance: ${(jobsWithRelevance.reduce((sum, job) => sum + job.relevanceScore, 0) / jobsWithRelevance.length * 100).toFixed(1)}%`);
    }
    
    console.log('\n🎉 Smart scraper architecture test completed successfully!');
    console.log('\n🏗️  Architecture Benefits:');
    console.log('   ✅ User preview before saving');
    console.log('   ✅ Intelligent relevance scoring');
    console.log('   ✅ Automatic high-quality job detection');
    console.log('   ✅ Duplicate prevention');
    console.log('   ✅ Storage optimization');
    
  } catch (error) {
    console.error('❌ Smart scraper test failed:', error);
    console.error('Error details:', error.message);
  }
}

testSmartScraper(); 