import browser from 'webextension-polyfill';

console.log('content script loaded');
console.log('current token', localStorage.token);

if (localStorage.token) {
  browser.storage.local.set({ token: localStorage.token })
      .then(() => {
        console.log('Token saved successfully');
      })
      .catch((error) => {
        console.error('Error saving token:', error);
      });
}