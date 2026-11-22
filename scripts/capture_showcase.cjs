const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle0' });

  // Scroll to shelves
  await page.evaluate(() => {
    const el = document.getElementById('shelf-paint');
    if (el) el.scrollIntoView();
  });

  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/home_showcase_feed_view1.png'
  });

  // Scroll down more to show more shelves
  await page.evaluate(() => {
    window.scrollBy(0, 950);
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/home_showcase_feed_view2.png'
  });

  // Scroll down more for bottom shelves
  await page.evaluate(() => {
    window.scrollBy(0, 1100);
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/home_showcase_feed_view3.png'
  });

  await browser.close();
  console.log("Screenshots captured successfully!");
})();
