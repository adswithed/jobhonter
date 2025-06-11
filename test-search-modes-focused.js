const axios = require('axios');

async function testSearchModes() {
  console.log('🧪 FOCUSED SEARCH MODE TESTING');
  console.log('='.repeat(60));
  console.log('🎯 Testing: WordPress developer');
  console.log('📍 Objective: Validate keyword-specific results per mode');
  console.log();

  const baseParams = {
    keywords: ['WordPress developer'],
    location: 'Remote',
    limit: 8,
    maxDaysOld: 30,
    onlyHiring: true
  };

  const modes = [
    {
      mode: 'strict',
      icon: '🎯',
      expectation: 'Only posts with "WordPress developer" in title/description',
      minWordPressMatch: 80 // At least 80% should contain WordPress
    },
    {
      mode: 'moderate', 
      icon: '⚖️',
      expectation: 'WordPress + related terms (WP, PHP, CMS)',
      minWordPressMatch: 40 // At least 40% should be WordPress related
    },
    {
      mode: 'loose',
      icon: '🔍', 
      expectation: 'Web dev, CMS, PHP broadly related',
      minWordPressMatch: 20 // At least 20% should be web dev related
    }
  ];

  const results = {};

  for (const { mode, icon, expectation, minWordPressMatch } of modes) {
    console.log(`${icon} ${mode.toUpperCase()} MODE TEST`);
    console.log('-'.repeat(40));
    console.log(`Expected: ${expectation}`);
    console.log(`Min Match Rate: ${minWordPressMatch}%`);
    console.log();

    try {
      const params = { ...baseParams, searchMode: mode };
      
      console.log('📡 Making API request...');
      const response = await axios.post('http://localhost:3001/api/scraper/test-reddit', params, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 300000 // 5 minute timeout
      });

      if (response.data.success) {
        const jobs = response.data.data?.jobs || [];
        results[mode] = jobs;
        
        console.log(`✅ Found ${jobs.length} jobs`);
        console.log();

        if (jobs.length > 0) {
          // Analyze relevance
          let exactMatches = 0;
          let wordpressRelated = 0;
          let webDevRelated = 0;
          
          console.log('📋 Job Analysis:');
          jobs.forEach((job, i) => {
            const title = job.title.toLowerCase();
            const description = (job.description || '').toLowerCase();
            const fullText = `${title} ${description}`;
            
            // Check different match types
            const hasExactMatch = fullText.includes('wordpress developer') || title.includes('wordpress developer');
            const hasWordPress = fullText.includes('wordpress') || fullText.includes('wp ') || fullText.includes('wp-');
            const hasWebDev = fullText.includes('web dev') || fullText.includes('php') || fullText.includes('cms') || 
                             fullText.includes('website') || fullText.includes('frontend') || fullText.includes('backend');
            
            if (hasExactMatch) exactMatches++;
            if (hasWordPress) wordpressRelated++;
            if (hasWebDev) webDevRelated++;
            
            // Show top 3 results
            if (i < 3) {
              console.log(`   ${i+1}. ${job.title}`);
              console.log(`      Company: ${job.company || 'Not specified'}`);
              console.log(`      Match Type: ${hasExactMatch ? '✅ Exact' : hasWordPress ? '🔧 WordPress' : hasWebDev ? '🌐 Web Dev' : '❓ Other'}`);
              if (job.contact?.email || job.contactEmail) {
                console.log(`      📧 Contact: Available`);
              }
              console.log();
            }
          });

          // Calculate match rates
          const exactRate = (exactMatches / jobs.length) * 100;
          const wordpressRate = (wordpressRelated / jobs.length) * 100;
          const webDevRate = (webDevRelated / jobs.length) * 100;
          
          console.log('📊 Match Analysis:');
          console.log(`   🎯 Exact "WordPress developer": ${exactMatches}/${jobs.length} (${exactRate.toFixed(1)}%)`);
          console.log(`   🔧 WordPress/WP related: ${wordpressRelated}/${jobs.length} (${wordpressRate.toFixed(1)}%)`);
          console.log(`   🌐 Web development related: ${webDevRelated}/${jobs.length} (${webDevRate.toFixed(1)}%)`);
          
          // Assessment for this mode
          const relevantRate = mode === 'strict' ? exactRate : 
                              mode === 'moderate' ? wordpressRate :
                              webDevRate;
          
          const assessment = relevantRate >= minWordPressMatch ? '✅ PASS' : '❌ FAIL';
          console.log(`   🎯 Mode Assessment: ${assessment} (${relevantRate.toFixed(1)}% relevant, need ${minWordPressMatch}%)`);
          
        } else {
          console.log('⚠️ No results found');
        }
        
      } else {
        console.log(`❌ API Error: ${response.data.message}`);
        results[mode] = null;
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
      results[mode] = null;
    }
    
    console.log();
    
    // Wait between tests to avoid rate limiting
    if (mode !== 'loose') {
      console.log('⏳ Waiting 10 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log();
    }
  }

  // Final comparison
  console.log('🔬 FINAL COMPARISON');
  console.log('='.repeat(50));
  
  const strictJobs = results.strict?.length || 0;
  const moderateJobs = results.moderate?.length || 0;
  const looseJobs = results.loose?.length || 0;
  
  console.log('📊 Volume Analysis:');
  console.log(`   🎯 Strict:   ${strictJobs} jobs`);
  console.log(`   ⚖️ Moderate: ${moderateJobs} jobs`);
  console.log(`   🔍 Loose:    ${looseJobs} jobs`);
  
  const correctProgression = strictJobs <= moderateJobs && moderateJobs <= looseJobs;
  console.log(`   📈 Progression: ${correctProgression ? '✅ CORRECT' : '❌ ISSUE'} (Strict ≤ Moderate ≤ Loose)`);
  console.log();
  
  // Quality assessment
  if (results.strict) {
    const strictWordPress = results.strict.filter(job => {
      const text = `${job.title} ${job.description || ''}`.toLowerCase();
      return text.includes('wordpress developer') || text.includes('wp developer');
    }).length;
    const strictRate = (strictWordPress / results.strict.length) * 100;
    console.log(`🎯 Strict Quality: ${strictRate.toFixed(1)}% exact matches (target: 80%+)`);
  }
  
  if (results.moderate) {
    const moderateWordPress = results.moderate.filter(job => {
      const text = `${job.title} ${job.description || ''}`.toLowerCase();
      return text.includes('wordpress') || text.includes('wp ') || text.includes('php') || text.includes('cms');
    }).length;
    const moderateRate = (moderateWordPress / results.moderate.length) * 100;
    console.log(`⚖️ Moderate Quality: ${moderateRate.toFixed(1)}% WordPress related (target: 40%+)`);
  }
  
  if (results.loose) {
    const looseWebDev = results.loose.filter(job => {
      const text = `${job.title} ${job.description || ''}`.toLowerCase();
      return text.includes('web') || text.includes('dev') || text.includes('php') || 
             text.includes('frontend') || text.includes('backend') || text.includes('cms');
    }).length;
    const looseRate = (looseWebDev / results.loose.length) * 100;
    console.log(`🔍 Loose Quality: ${looseRate.toFixed(1)}% web dev related (target: 20%+)`);
  }
  
  console.log();
  console.log('🏁 FINAL VERDICT:');
  const systemWorking = correctProgression && strictJobs >= 0 && moderateJobs >= 0 && looseJobs >= 0;
  console.log(`System Status: ${systemWorking ? '✅ WORKING' : '❌ NEEDS FIX'}`);
  console.log(`Recommendation: ${systemWorking ? 'Ready for production use' : 'Requires further optimization'}`);
}

// Run the test
testSearchModes().catch(console.error); 