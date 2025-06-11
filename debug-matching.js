// Debug script to understand the matching logic
const mockPost = {
  id: '2', 
  title: 'PHP Web Developer Needed',
  selftext: 'Looking for a PHP developer with WordPress experience. WP theme customization required.',
  author: 'webagency',
  subreddit: 'forhire',
  url: 'https://reddit.com/r/forhire/2',
  permalink: '/r/forhire/2',
  created_utc: Date.now() / 1000 - 7200,
  ups: 8,
  num_comments: 1,
  domain: 'self.forhire',
  is_self: true
};

const keyword = 'WordPress developer';
const fullText = `${mockPost.title} ${mockPost.selftext}`.toLowerCase();

console.log('🔍 DEBUGGING MATCH LOGIC');
console.log('='.repeat(40));
console.log(`Post: ${mockPost.title}`);
console.log(`Description: ${mockPost.selftext}`);
console.log(`Full text: ${fullText}`);
console.log(`Keyword: ${keyword}`);
console.log();

// Test exact match
const exactMatch = fullText.includes(keyword.toLowerCase());
console.log(`🎯 Exact match "${keyword.toLowerCase()}": ${exactMatch}`);

// Test individual words
const keywordWords = keyword.split(' ');
console.log(`📝 Keyword words: ${keywordWords.join(', ')}`);

keywordWords.forEach(word => {
  const wordMatch = fullText.includes(word.toLowerCase());
  console.log(`   - "${word.toLowerCase()}": ${wordMatch}`);
});

// Test word match percentage
const wordMatches = keywordWords.filter(word => {
  if (word.length <= 2) return false;
  return fullText.includes(word.toLowerCase());
});

const wordMatchPercentage = (wordMatches.length / keywordWords.length) * 100;
console.log(`📊 Word matches: ${wordMatches.length}/${keywordWords.length} (${wordMatchPercentage.toFixed(1)}%)`);
console.log(`✅ Meets 50% threshold: ${wordMatches.length >= Math.ceil(keywordWords.length * 0.5)}`);

// Test synonyms
const synonymMap = {
  'developer': ['dev', 'programmer', 'coder', 'software engineer', 'engineer'],
  'wordpress': ['wp', 'wordpress dev', 'wp dev', 'cms', 'content management', 'woocommerce', 'elementor', 'gutenberg']
};

console.log();
console.log('🔧 SYNONYM TESTING');
keywordWords.forEach(word => {
  const wordLower = word.toLowerCase();
  console.log(`Testing word: "${wordLower}"`);
  
  if (synonymMap[wordLower]) {
    console.log(`   Synonyms: ${synonymMap[wordLower].join(', ')}`);
    
    synonymMap[wordLower].forEach(synonym => {
      const synonymMatch = fullText.includes(synonym.toLowerCase());
      console.log(`   - "${synonym}": ${synonymMatch}`);
    });
  } else {
    console.log(`   No synonyms found`);
  }
});

// Test category matches
const categoryMap = {
  'web': ['frontend', 'backend', 'fullstack', 'html', 'css', 'javascript', 'website', 'php', 'cms'],
  'wordpress': ['php', 'web development', 'cms', 'website', 'frontend', 'backend'],
  'developer': ['engineer', 'programmer', 'coder', 'development', 'software', 'web', 'frontend', 'backend']
};

console.log();
console.log('🌐 CATEGORY TESTING');
keywordWords.forEach(word => {
  const wordLower = word.toLowerCase();
  console.log(`Testing category for: "${wordLower}"`);
  
  if (categoryMap[wordLower]) {
    console.log(`   Categories: ${categoryMap[wordLower].join(', ')}`);
    
    categoryMap[wordLower].forEach(term => {
      const termMatch = fullText.includes(term.toLowerCase());
      console.log(`   - "${term}": ${termMatch}`);
    });
  } else {
    console.log(`   No categories found`);
  }
});

console.log();
console.log('🏁 FINAL ASSESSMENT');
console.log(`Should match in moderate mode: ${wordMatches.length >= Math.ceil(keywordWords.length * 0.5)}`);
console.log(`Should match in loose mode: ${wordMatches.length >= 1 || fullText.includes('php') || fullText.includes('web')}`); 