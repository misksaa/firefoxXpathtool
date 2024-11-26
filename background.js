// when page updated
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') { //wait tile complete loading
      if (tab.url ) { // if url is true
        // send message with data to content.js 
        chrome.tabs.sendMessage(tabId, {
          type: "NEW",
          pageId: tab.url,
        });
      }
    }
  });

  