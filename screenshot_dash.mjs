import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(e.message));
await page.setViewportSize({ width: 1440, height: 860 });

// Try login with any credentials — Firebase will auto-create if needed
await page.goto('http://localhost:5174/login');
await page.waitForTimeout(2000);

// Find inputs by looking at the rendered HTML
const inputs = await page.$$('input');
console.log('Input count:', inputs.length);
for (const inp of inputs) {
  const t = await inp.getAttribute('type');
  const p = await inp.getAttribute('placeholder');
  console.log('input type:', t, 'placeholder:', p);
}

await page.screenshot({ path: 'login-state.png' });

// Fill whatever inputs exist
if (inputs.length >= 2) {
  await inputs[0].fill('test@demo.com');
  await inputs[1].fill('demo1234');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
}

console.log('Final URL:', page.url());
console.log('Errors:', errors);
await page.screenshot({ path: 'dashboard-preview.png' });
await browser.close();
