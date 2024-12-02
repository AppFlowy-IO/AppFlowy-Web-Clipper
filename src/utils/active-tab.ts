import browser from 'webextension-polyfill';
import { ensureContentScriptLoaded } from './content-script';

// @ts-ignore

export async function updateCurrentActiveTab(tab: browser.Tabs.Tab) {
  if (tab.id && tab.url) {
    console.log(`update active tab ${tab.id}`);
    await ensureContentScriptLoaded(tab.id);
    browser.runtime
      .sendMessage({
        action: 'activeTabChanged',
        tabId: tab.id,
        url: tab.url,
        isValidUrl: isValidUrl(tab.url),
        isBlankPage: isBlankPage(tab.url),
      })
      .then(() => {
        console.log('activeTabChanged message sent');
      });
  }
}

export function isValidUrl(url: string): boolean {
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('file:///')
  );
}

export function isBlankPage(url: string): boolean {
  return (
    url === 'about:blank' ||
    url === 'chrome://newtab/' ||
    url === 'edge://newtab/'
  );
}
