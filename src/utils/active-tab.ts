import browser from 'webextension-polyfill';
import { ensureContentScriptLoaded } from './content-script';

let currentActiveTabId: number | undefined;

// @ts-ignore
let currentWindowId: number | undefined;

export async function updateCurrentActiveTab(windowId: number | undefined) {
  if (windowId === undefined) {
    return;
  }

  const tabs = await browser.tabs.query({ active: true, windowId: windowId });
  if (tabs[0] && tabs[0].id && tabs[0].url) {
    console.log(`update active tab ${tabs[0].id}, windowId: ${windowId}`);
    currentActiveTabId = tabs[0].id;
    currentWindowId = windowId;
    await ensureContentScriptLoaded(currentActiveTabId);
    browser.runtime
      .sendMessage({
        action: 'activeTabChanged',
        tabId: currentActiveTabId,
        url: tabs[0].url,
        isValidUrl: isValidUrl(tabs[0].url),
        isBlankPage: isBlankPage(tabs[0].url),
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
