// Debug the Frontend Developer case specifically
const text = 'frontend developer - react/vue we need a frontend developer skilled in react and vue.js. some cms experience preferred.';
const keyword = 'wordpress developer';

console.log('🔍 DEBUGGING FRONTEND DEVELOPER CASE');
console.log('='.repeat(50));
console.log(`Text: ${text}`);
console.log(`Keyword: ${keyword}`);
console.log();

const keywordWords = keyword.split(' ');
console.log(`Keyword words: ${keywordWords.join(', ')}`);

const synonymMap = {
  'developer': ['dev', 'programmer', 'coder', 'software engineer', 'engineer'],
  'wordpress': ['wp', 'wordpress dev', 'wp dev', 'cms', 'content management', 'woocommerce', 'elementor', 'gutenberg']
};

console.log('\n📝 WORD MATCHING ANALYSIS:');
const wordMatches = keywordWords.filter(word => {
  if (word.length <= 2) return false;
  
  console.log(`\nTesting word: "${word}"`);
  
  // Direct word match
  const directMatch = text.includes(word.toLowerCase());
  console.log(`  Direct match: ${directMatch}`);
  
  if (directMatch) {
    return true;
  }
  
  // Check synonyms for this word
  for (const [mainTerm, synonyms] of Object.entries(synonymMap)) {
    if (word.toLowerCase() === mainTerm) {
      console.log(`  Found synonyms for "${mainTerm}": ${synonyms.join(', ')}`);
      
      for (const synonym of synonyms) {
        const synonymMatch = text.includes(synonym.toLowerCase());
        console.log(`    - "${synonym}": ${synonymMatch}`);
        if (synonymMatch) {
          console.log(`  ✅ Synonym match found!`);
          return true;
        }
      }
    }
  }
  
  console.log(`  ❌ No match found`);
  return false;
});

console.log(`\n📊 FINAL RESULTS:`);
console.log(`Word matches: ${wordMatches.length}/${keywordWords.length}`);
console.log(`Required for moderate mode: ${keywordWords.filter(w => w.length > 2).length} (100%)`);
console.log(`Should match in moderate mode: ${wordMatches.length === keywordWords.filter(w => w.length > 2).length}`);

console.log('\n🎯 ISSUE IDENTIFIED:');
console.log('The text contains "cms" which is a synonym for "wordpress"');
console.log('AND it contains "developer" directly');
console.log('So both words of "WordPress developer" are found, causing a match');
console.log('\n💡 SOLUTION:');
console.log('We need to be more specific about synonyms in moderate mode');
console.log('CMS should only be a loose synonym, not a moderate one'); 