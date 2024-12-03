const puppeteer = require('puppeteer');

const EXTENSION_PATH = '../dist';
const EXTENSION_ID = 'bnhhcpdgpabghbipjeocenbhompjlmll';

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

test('popup renders correctly', async () => {
  const page = await browser.newPage();
  await page.goto(`chrome-extension://${EXTENSION_ID}/index.html#/popup`);
  // Ensure that the extension page is loaded and the DOM is fully rendered before querying for buttons.
  await page.waitForSelector('button', { timeout: 5000 });

  const signInButtonExists = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some((button) =>
      button.textContent.includes('Sign in with AppFlowy')
    );
  });

  if (signInButtonExists) {
    await page.evaluate(() => {
      const button = Array.from(document.querySelectorAll('button')).find(
        (button) => button.textContent.includes('Sign in with AppFlowy')
      );
      button.click();
    });
  } else {
    throw new Error('Sign in button not found');
  }

  await page.close();
  await browser.close();
});
