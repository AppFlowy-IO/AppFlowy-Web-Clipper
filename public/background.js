console.log('background script loaded');

chrome.runtime.onMessage.addListener((message, sender, send_response) => {
  if (message && message.name) {
    if (message.name === 'update_this_tab_url') {
    } else if (message.name === 'get_sender_tab_data') {
      send_response(sender.tab);
    } else if (message.name === 'get_active_tab_data') {
      chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        send_response(tabs[0]);
      });
      // this is required to let the browser know that we will
      // send a response after a while
      return true;
    }
  }
});
