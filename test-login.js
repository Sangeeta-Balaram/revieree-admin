import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  try {
    await page.goto('http://localhost:5173/admin/login', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Fill in login form
    await page.type('input[type="email"]', 'therevieree.co@gmail.com');
    await page.type('input[type="password"]', 'admin123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());
    
    await page.screenshot({ path: 'admin-after-login.png', fullPage: true });
    console.log('Screenshot saved as admin-after-login.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();