// @ts-ignore
import browser from 'webextension-polyfill';
import { detectBrowser, debounce } from '../src/utils/detection';
import { ensureContentScriptLoaded } from '../src/utils/content-script';
import { updateCurrentActiveTab } from '../src/utils/active-tab';

console.log('background script loaded');

let isContextMenuCreating = false;
let sidePanelOpenWindows: Set<number> = new Set();

browser.runtime.onInstalled.addListener(() => {
  debouncedUpdateContextMenu();
});

const debouncedUpdateContextMenu = debounce(async () => {
  if (isContextMenuCreating) {
    return;
  }
  isContextMenuCreating = true;
  try {
    await browser.contextMenus.removeAll();
    const menuItems: {
      id: string;
      title: string;
      contexts: browser.Menus.ContextType[];
    }[] = [
      {
        id: 'open-appflowy-clipper',
        title: 'Clip this page',
        contexts: ['page', 'selection', 'image', 'video', 'audio'],
      },
    ];

    const browserType = await detectBrowser();
    if (browserType === 'chrome') {
      menuItems.push({
        id: 'open-side-panel',
        title: 'Open side panel',
        contexts: ['page', 'selection'],
      });
    }

    for (const item of menuItems) {
      browser.contextMenus.create(item);
    }
  } catch (error) {
    console.error('Error updating context menu:', error);
  } finally {
    isContextMenuCreating = false;
  }
}, 100); // 100ms debounce t

browser.runtime.onMessage.addListener(
  (
    request: unknown,
    sender: browser.Runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): true | undefined => {
    (async () => {
      if (typeof request === 'object' && request !== null) {
        const typedRequest = request as {
          action: string;
          isActive?: boolean;
          hasHighlights?: boolean;
          tabId?: number;
        };

        console.log(
          `onAction ${typedRequest.action}, tabId:${typedRequest.tabId}, windowId:${sender.tab?.windowId}`
        );

        switch (typedRequest.action) {
          case 'ensureContentScriptLoaded':
            if (typedRequest.tabId) {
              try {
                await ensureContentScriptLoaded(typedRequest.tabId);
                sendResponse({ success: true });
              } catch (error) {
                console.error(
                  'Error ensuring content script is loaded:',
                  error
                );
                sendResponse({
                  success: false,
                  error: error instanceof Error ? error.message : String(error),
                });
              }
            }
            break;

          case 'sidePanelOpened':
            try {
              const tabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
              });
              if (tabs[0] && tabs[0].windowId) {
                await updateCurrentActiveTab(tabs[0]);
              }
              sendResponse({ success: true });
            } catch (error) {
              console.error('Error handling side panel opened:', error);
              sendResponse({
                success: false,
                error: error instanceof Error ? error.message : String(error),
              });
            }
            break;

          case 'openPopup':
            try {
              await browser.action.openPopup();
              sendResponse({ success: true });
            } catch (error) {
              console.error('Error opening popup in background script:', error);
              sendResponse({
                success: false,
                error: error instanceof Error ? error.message : String(error),
              });
            }
            break;

          case 'refreshActiveTab':
            try {
              const tabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
              });
              sendResponse(tabs[0] || null);
            } catch (error) {
              console.error('Error refreshing active tab:', error);
              sendResponse({
                success: false,
                error: error instanceof Error ? error.message : String(error),
              });
            }
            break;

          default:
            console.warn(`Unknown action: ${typedRequest.action}`);
            sendResponse({ success: false, error: 'Unknown action' });
        }
      } else {
        sendResponse({ success: false, error: 'Invalid request' });
      }
    })();
    return true;
  }
);

// Tab listeners
async function setupTabListeners() {
  const browserType = await detectBrowser();
  if (['chrome', 'brave', 'edge'].includes(browserType)) {
    browser.tabs.onActivated.addListener(handleTabChange);
    browser.tabs.onUpdated.addListener(
      (tabId: any, changeInfo: { status: string }, tab: { windowId: any }) => {
        if (changeInfo.status === 'complete') {
          handleTabChange({ tabId, windowId: tab.windowId });
        }
      }
    );
  }
}

async function handleTabChange(activeInfo: {
  tabId: number;
  windowId?: number;
}) {
  if (activeInfo.windowId) {
    browser.tabs
      .query({ active: true, windowId: activeInfo.windowId })
      .then((tabs: any[]) => {
        if (tabs[0]) {
          updateCurrentActiveTab(tabs[0]);
        }
      });
  }
}

setupTabListeners().then(() => {});

// Context menu listeners
browser.contextMenus.onClicked.addListener(
  (info: { menuItemId: string }, tab: { id: number; windowId: number }) => {
    (async () => {
      if (info.menuItemId === 'open-appflowy-clipper') {
        await browser.action.openPopup();
      } else if (
        info.menuItemId === 'open-side-panel' &&
        tab &&
        tab.id &&
        tab.windowId
      ) {
        await chrome.sidePanel.setOptions({
          tabId: tab.id,
          path: '/index.html#/side-panel',
          enabled: true,
        });
        await chrome.sidePanel.open({ tabId: tab.id });

        sidePanelOpenWindows.add(tab.windowId);
        await ensureContentScriptLoaded(tab.id);
      }
    })();
  }
);
