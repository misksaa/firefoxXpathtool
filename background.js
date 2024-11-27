// Ensure compatibility with Firefox by using the browser namespace or a polyfill
const browser = chrome || browser;

// Listener for tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') { // Wait until the page has finished loading
    if (tab.url) { // Check if the URL is valid
      // Send a message with data to content.js
      browser.tabs.sendMessage(tabId, {
        type: "NEW",
        pageId: tab.url,
      }).catch((error) => {
        // Handle potential errors in Firefox (e.g., when no content script is active)
        console.error("Error sending message to content script:", error);
      });
    }
  }
});
