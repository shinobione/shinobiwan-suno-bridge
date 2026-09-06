chrome.action.onClicked.addListener(async tab => {
  if (!tab.id || !/^https:\/\/(www\.)?suno\.com\//.test(tab.url || '')) return;
  try {
    await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['core.js', 'bridge.js']});
  } catch (error) { console.warn('Suno Bridge:', error.message); }
});
