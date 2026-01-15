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
    
    // Debug localStorage
    const passwords = await page.evaluate(() => {
      const stored = localStorage.getItem('adminPasswords');
      console.log('Stored passwords:', stored);
      return stored ? JSON.parse(stored) : {};
    });
    
    console.log('Available passwords:', passwords);
    
    // Fill in login form
    await page.type('input[type="email"]', 'therevieree.co@gmail.com');
    await page.type('input[type="password"]', 'admin123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Current URL:', page.url());
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();