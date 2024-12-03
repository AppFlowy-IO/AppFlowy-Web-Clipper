// FIXME: add support for firefox and safari
// add webpack to enable this type of importing
// @ts-ignore
let browser = chrome;
browser.runtime.onMessage.addListener((request: any, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({});
    return true;
  }
});

// Only use this script on appflowy.com
if (window.location.hostname.endsWith('appflowy.com')) {
  if (localStorage.token) {
    browser.storage.local.get(['auth_flow_active']).then((storage_data) => {
      if (storage_data.auth_flow_active) {
        browser.storage.local
          .set({
            token: localStorage.token,
            auth_flow_active: false,
          })
          .then(() => {
            console.log('Token saved successfully');
            location.href = chrome.runtime.getURL('/index.html#/auth-redirect');
          })
          .catch((error) => {
            console.error('Error saving token:', error);
          });
      }
    });
  }
}
