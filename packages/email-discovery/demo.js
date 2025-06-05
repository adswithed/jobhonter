const { EmailExtractor } = require('./dist/utils/EmailExtractor');

console.log('🔍 EMAIL DISCOVERY DEMO');
console.log('='.repeat(50));

const testText = `
Welcome to TechCorp! Contact our HR team at hr@techcorp.com 
or reach out to John Smith (john.smith@techcorp.com) - Senior Recruiter.
For general inquiries: info [at] techcorp [dot] com
Careers: mailto:careers@techcorp.com
CEO: jane.doe@techcorp.com
Support: temp@disposable.com
`;

const source = { 
  type: 'webpage', 
  url: 'https://techcorp.com', 
  confidence: 0.8, 
  extractedAt: new Date(), 
  method: 'Website parsing' 
};

const emails = EmailExtractor.extractFromText(testText, source);

console.log('📧 EXTRACTED EMAILS:');
emails.forEach((email, i) => {
  console.log(`${i+1}. ${email.email}`);
  console.log(`   👤 Name: ${email.name || 'Not detected'}`);
  console.log(`   🏢 Title: ${email.title || 'Not detected'}`);
  console.log(`   📊 Pattern: ${email.source.method}`);
  console.log(`   ⭐ Confidence: ${email.source.confidence}`);
  console.log(`   🚫 Disposable: ${email.isDisposable}`);
  console.log('');
});

console.log('🎯 PRIORITIZED BY RELEVANCE:');
const prioritized = EmailExtractor.prioritizeEmails(emails);
prioritized.forEach((email, i) => {
  console.log(`${i+1}. ${email.email} (Higher relevance for job applications)`);
});

console.log('\n💡 EMAIL SUGGESTIONS:');
const suggestions = EmailExtractor.suggestEmailFormats('John Smith', 'techcorp.com');
console.log('For "John Smith" at techcorp.com:');
suggestions.forEach((suggestion, i) => {
  console.log(`${i+1}. ${suggestion}`);
}); 