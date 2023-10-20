chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    id: "sendToChatGPT",
    title: "Send to ChatGPT",
    contexts: ["selection", "page"]
  });

  chrome.contextMenus.create({
    id: "summarizeSelected",
    title: "Summarize selected",
    parentId: "sendToChatGPT",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "summarizePage",
    title: "Summarize page",
    parentId: "sendToChatGPT",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "customPrompt",
    title: "Custom prompt",
    parentId: "sendToChatGPT",
    contexts: ["selection", "page"]
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "summarizeSelected") {
    chrome.windows.create({
      url: chrome.runtime.getURL("contextPopup.html?tabId=" + tab.id + "&prompt=Summarize this"),
      type: "popup",
      width: 400,  // Adjusted width
      height: 350  // Adjusted height
    });
  } else if (info.menuItemId === "summarizePage") {
    chrome.windows.create({
      url: chrome.runtime.getURL("contextPopup.html?tabId=" + tab.id + "&prompt=Summarize this&mode=page"),
      type: "popup",
      width: 400,  // Adjusted width
      height: 350  // Adjusted height
    });
  } else if (info.menuItemId === "customPrompt") {
    chrome.windows.create({
      url: chrome.runtime.getURL("contextPopup.html?tabId=" + tab.id),
      type: "popup",
      width: 400,  // Adjusted width
      height: 350  // Adjusted height
    });
  }
});
