import debounce from "@mui/material/utils/debounce";
import browser from "webextension-polyfill";
import { detectBrowser } from "../src/utils/detection";
import { ensureContentScriptLoaded } from "../src/utils/content-script";
import { updateCurrentActiveTab } from "../src/utils/active-tab";
console.log('background script loaded');

let isContextMenuCreating = false;
let sidePanelOpenWindows: Set<number> = new Set();

browser.runtime.onInstalled.addListener(() => {
	debouncedUpdateContextMenu(-1); // Use a dummy tabId for initial creation
});

const debouncedUpdateContextMenu = debounce(async (tabId: number) => {
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
					id: "open-appflowy-clipper",
					title: "Clip this page",
					contexts: ["page", "selection", "image", "video", "audio"]
				},
			];

		const browserType = await detectBrowser();
		if (browserType === 'chrome') {
			menuItems.push({
				id: 'open-side-panel',
				title: 'Open side panel',
				contexts: ["page", "selection"]
			});
		}

		for (const item of menuItems) {
			await browser.contextMenus.create(item);
		}
	} catch (error) {
		console.error('Error updating context menu:', error);
	} finally {
		isContextMenuCreating = false;
	}
}, 100); // 100ms debounce t



browser.runtime.onMessage.addListener((request: unknown, sender: browser.Runtime.MessageSender, sendResponse: (response?: any) => void): true | undefined => {
	if (typeof request === 'object' && request !== null) {
		const typedRequest = request as { action: string; isActive?: boolean; hasHighlights?: boolean; tabId?: number };
		console.log(`onAction ${typedRequest.action}, tabId:${typedRequest.tabId}, windowId:${sender.tab?.windowId}`);

		if (typedRequest.action === "ensureContentScriptLoaded" && typedRequest.tabId) {
			ensureContentScriptLoaded(typedRequest.tabId).then(sendResponse);
			return true;
		}

		if (typedRequest.action === "sidePanelOpened") {
			browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
				if (tabs[0] && tabs[0].windowId) {
					updateCurrentActiveTab(tabs[0]);
				}
			});
			return true;
		}

		// Open the popup
		if (typedRequest.action === "openPopup") {
			browser.action.openPopup()
				.then(() => {
					sendResponse({ success: true });
				})
				.catch((error: unknown) => {
					console.error('Error opening popup in background script:', error);
					sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
				});
			return true;
		}

		// Refresh the active tab
    if (typedRequest.action === 'refreshActiveTab') {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        sendResponse(tabs[0]);
      });
      return true;
    }
	}
	return undefined;
});


// Tab listeners
async function setupTabListeners() {
	const browserType = await detectBrowser();
	if (['chrome', 'brave', 'edge'].includes(browserType)) {
		browser.tabs.onActivated.addListener(handleTabChange);
		browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
			if (changeInfo.status === 'complete') {
				handleTabChange({ tabId, windowId: tab.windowId });
			}
		});
	}
}

async function handleTabChange(activeInfo: { tabId: number; windowId?: number }) {
	if (activeInfo.windowId) {
		browser.tabs.query({ active: true, windowId: activeInfo.windowId }).then((tabs) => {
			if (tabs[0]) {
				updateCurrentActiveTab(tabs[0]);
			}
		});
	}
}

setupTabListeners();


// Context menu listeners
browser.contextMenus.onClicked.addListener(async (info, tab) => {
	if (info.menuItemId === "open-appflowy-clipper") {
		browser.action.openPopup();
	} 
	else if (info.menuItemId === 'open-side-panel' && tab && tab.id && tab.windowId) {
    chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: '/index.html#/side-panel',
      enabled: true,
    });
		chrome.sidePanel.open({ tabId: tab.id });
		
		sidePanelOpenWindows.add(tab.windowId);
		await ensureContentScriptLoaded(tab.id);
	}
});