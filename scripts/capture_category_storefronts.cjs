const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const urls = [
    {
      name: 'fevicol',
      url: 'http://localhost:5173/collections/wood-adhesives',
      desktopOut: '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/fevicol_verified_desktop.png',
      mobileOut: '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/fevicol_verified_mobile.png'
    },
    {
      name: 'hinges',
      url: 'http://localhost:5173/collections/hinges',
      desktopOut: '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/hinges_verified_desktop.png',
      mobileOut: '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/hinges_verified_mobile.png'
    },
    {
      name: 'locks',
      url: 'http://localhost:5173/collections/mechanical-locks',
      desktopOut: '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/locks_verified_desktop.png',
      mobileOut: '/Users/rohiitshukla/.gemini/antigravity/brain/d907f893-e111-4aca-b9eb-1bd68dd42e43/locks_verified_mobile.png'
    }
  ];

  for (const item of urls) {
    const page = await browser.newPage();
    // Desktop 1280x800
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
    await page.goto(item.url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: item.desktopOut });
    console.log(`Captured desktop: ${item.name}`);

    // Mobile 390x844
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto(item.url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: item.mobileOut });
    console.log(`Captured mobile: ${item.name}`);

    await page.close();
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
})();
