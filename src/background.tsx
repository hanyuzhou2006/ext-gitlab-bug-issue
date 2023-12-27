let data: {
  screenshotUrl?: string
  url?: string
} = {

}

chrome.runtime.onMessage.addListener(async function listener(msg, sender, sendResponse) {
  if (msg.type === 'getScreenshotUrl') {
    sendResponse({ screenshotUrl: data.screenshotUrl });
  } else if (msg.type === 'getUrl') {
    sendResponse({ url: data.url });
  }
});

async function shot() {
  const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  const originUrl = activeTab.url;
  data.url = originUrl;
  const screenshotUrl = await chrome.tabs.captureVisibleTab({ format: "png" });
  data.screenshotUrl = screenshotUrl;
  const url = chrome.runtime.getURL("/html/content.html");
  await chrome.tabs.create({ url });
}


async function setting() {
  const url = chrome.runtime.getURL("/html/settings.html");
  await chrome.tabs.create({ url });
}

async function match(){
  const url = chrome.runtime.getURL("/html/settings.html#/match");
  await chrome.tabs.create({ url });
}

chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === 'newIssue') {
    sendResponse({ success: true });
    await shot();
  } else if (msg.type === 'setting') {
    sendResponse({ success: true });
    await setting();
  } else if (msg.type === 'match') {
    sendResponse({ success: true });
    await match();
  }
})
