import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  try {
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
    
    // Wait a bit for React to mount
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if React rendered anything
    const content = await page.content();
    const hasLoginForm = content.includes('Sign in to access admin panel');
    const hasReactRoot = content.includes('root');
    
    console.log('Has login form text:', hasLoginForm);
    console.log('Has React root:', hasReactRoot);
    console.log('Page title:', await page.title());
    
    // Take screenshot
    await page.screenshot({ path: 'admin-login-test.png', fullPage: true });
    console.log('Screenshot saved as admin-login-test.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();