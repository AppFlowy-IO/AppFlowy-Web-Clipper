console.log('content', localStorage.token);
if (localStorage.token) {
  chrome.storage.local.set({ token: localStorage.token });
}
