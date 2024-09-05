document.getElementById('exportJson').addEventListener('click', () => {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    exportToJson(bookmarkTreeNodes);
  });
});

document.getElementById('openIndex').addEventListener('click', () => {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    chrome.storage.local.set({ bookmarkTree: bookmarkTreeNodes }, () => {
      const url = chrome.runtime.getURL('../index.html');
      chrome.tabs.create({ url });
    });
  });
});

function exportToJson(bookmarkTreeNodes) {
  const bookmarkJson = JSON.stringify(bookmarkTreeNodes, null, 2);
  const blob = new Blob([bookmarkJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bookmarks.json';
  a.click();
  URL.revokeObjectURL(url);
}

