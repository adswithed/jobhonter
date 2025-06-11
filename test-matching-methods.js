const { RedditScraper } = require('./packages/scraper/dist/scrapers/RedditScraper');

async function testMatchingMethods() {
  console.log('🧪 TESTING MATCHING METHODS DIRECTLY');
  console.log('='.repeat(50));
  
  const scraper = new RedditScraper();
  
  const testCases = [
    {
      title: 'WordPress Developer Position - Remote',
      description: 'We are looking for an experienced WordPress developer to join our team. Must have PHP and MySQL experience.',
      keyword: 'WordPress developer',
      expectedStrict: true,
      expectedModerate: true,
      expectedLoose: true
    },
    {
      title: 'PHP Web Developer Needed',
      description: 'Looking for a PHP developer with WordPress experience. WP theme customization required.',
      keyword: 'WordPress developer',
      expectedStrict: false,
      expectedModerate: true,
      expectedLoose: true
    },
    {
      title: 'Frontend Developer - React/Vue',
      description: 'We need a frontend developer skilled in React and Vue.js. Some CMS experience preferred.',
      keyword: 'WordPress developer',
      expectedStrict: false,
      expectedModerate: false,
      expectedLoose: true
    },
    {
      title: 'Full Stack Engineer Position',
      description: 'Looking for a full stack engineer with experience in web development, databases, and modern frameworks.',
      keyword: 'WordPress developer',
      expectedStrict: false,
      expectedModerate: false,
      expectedLoose: true
    },
    {
      title: 'Marketing Manager Role',
      description: 'We are hiring a marketing manager to lead our digital marketing efforts and grow our brand.',
      keyword: 'WordPress developer',
      expectedStrict: false,
      expectedModerate: false,
      expectedLoose: false
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.title}`);
    console.log(`Description: ${testCase.description}`);
    console.log(`Keyword: ${testCase.keyword}`);
    
    const fullText = `${testCase.title} ${testCase.description}`.toLowerCase();
    const keywords = [testCase.keyword.toLowerCase()];
    
    // Test each mode
    const modes = ['strict', 'moderate', 'loose'];
    const results = {};
    
    for (const mode of modes) {
      let result = false;
      
      try {
        switch (mode) {
          case 'strict':
            result = scraper.isStrictMatch(fullText, keywords);
            break;
          case 'moderate':
            result = scraper.isModerateMatch(fullText, keywords);
            break;
          case 'loose':
            result = scraper.isLooseMatch(fullText, keywords);
            break;
        }
        
        results[mode] = result;
        
        const expected = mode === 'strict' ? testCase.expectedStrict :
                        mode === 'moderate' ? testCase.expectedModerate :
                        testCase.expectedLoose;
        
        const status = result === expected ? '✅' : '❌';
        console.log(`   ${mode === 'strict' ? '🎯' : mode === 'moderate' ? '⚖️' : '🔍'} ${mode}: ${result} ${status} (expected: ${expected})`);
        
      } catch (error) {
        console.log(`   ${mode}: ERROR - ${error.message}`);
        results[mode] = false;
      }
    }
    
    // Test partial matching specifically
    if (testCase.keyword === 'WordPress developer') {
      console.log('\n   🔍 Detailed Analysis:');
      
      // Test hasPartialOrSynonymMatch
      try {
        const partialMatch = scraper.hasPartialOrSynonymMatch(fullText, testCase.keyword.toLowerCase());
        console.log(`   📝 hasPartialOrSynonymMatch: ${partialMatch}`);
        
        // Test hasBroadCategoryMatch
        const categoryMatch = scraper.hasBroadCategoryMatch(fullText, testCase.keyword.toLowerCase());
        console.log(`   🌐 hasBroadCategoryMatch: ${categoryMatch}`);
        
        // Test individual words
        const words = testCase.keyword.toLowerCase().split(' ');
        console.log(`   📋 Individual word matches:`);
        words.forEach(word => {
          const wordMatch = fullText.includes(word);
          console.log(`      - "${word}": ${wordMatch}`);
        });
        
      } catch (error) {
        console.log(`   Error in detailed analysis: ${error.message}`);
      }
    }
  }
  
  console.log('\n🏁 SUMMARY');
  console.log('='.repeat(30));
  console.log('✅ = Working as expected');
  console.log('❌ = Not working as expected');
  console.log('\nExpected behavior:');
  console.log('🎯 Strict: Only exact matches');
  console.log('⚖️ Moderate: Partial/synonym matches');
  console.log('🔍 Loose: Broad category matches');
  
  await scraper.destroy();
}

// Run the test
testMatchingMethods().catch(console.error); 