const puppeteer = require('puppeteer');
const { EXTENSION_PATH, EXTENSION_ID } = require('./util');

let browser;

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });
});

afterEach(async () => {
  await browser.close();
  browser = undefined;
});

test('test auth redirect correctly', async () => {
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${EXTENSION_ID}/index.html#/popup`);
  await page.waitForSelector('button', { timeout: 5000 });

  // Use evaluate to set token in browser.storage.local
  await page.evaluate(() => {
    chrome.storage.local.set({ auth_flow_active: 'true' });
    chrome.storage.local.set({ token: 'mock token' });
  });

  // Wait for the redirect
  await page.waitForFunction(
    () => window.location.hash === '#/auth-redirect', // Use hash to check redirect
    { timeout: 10000 }
  );

  await browser.close();
});
