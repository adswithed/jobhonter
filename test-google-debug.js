#!/usr/bin/env node

const { chromium } = require('playwright');

async function debugGoogleSearch() {
  console.log('🔍 Debug Google search...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // Simple search that should definitely return results
    const query = 'software engineer jobs';
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    console.log(`🌐 Navigating to: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000); // Wait for page to fully load
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check if we're being blocked
    const bodyText = await page.textContent('body');
    console.log(`📄 Page content length: ${bodyText.length}`);
    
    if (bodyText.includes('unusual traffic') || bodyText.includes('captcha') || bodyText.includes('robot')) {
      console.log('🚫 Google is blocking us with anti-bot measures');
    }
    
    // Try to find search results with different selectors
    const selectors = ['.g', '[data-ved]', '.tF2Cxc', '.yuRUbf', 'h3'];
    
    for (const selector of selectors) {
      const elements = await page.$$eval(selector, els => els.length);
      console.log(`🔍 Selector "${selector}": ${elements} elements found`);
      
      if (elements > 0) {
        // Get first few results
        const results = await page.$$eval(selector, els => {
          return els.slice(0, 3).map((el, i) => {
            const title = el.querySelector('h3')?.textContent || el.textContent?.substring(0, 100) || 'No title';
            const link = el.querySelector('a')?.href || 'No link';
            return { index: i, title, link };
          });
        });
        
        console.log(`📋 Sample results from "${selector}":`);
        results.forEach(result => {
          console.log(`  ${result.index + 1}. ${result.title}`);
          console.log(`     ${result.link}`);
        });
        break;
      }
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: '/tmp/google-debug.png', fullPage: false });
    console.log('📸 Screenshot saved to /tmp/google-debug.png');
    
    // Wait a bit so we can see the browser
    console.log('⏳ Waiting 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugGoogleSearch(); 