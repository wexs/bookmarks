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

document.getElementById('exportHtml').addEventListener('click', exportHtml);
function exportHtml() {
  fetch(chrome.runtime.getURL('index.html'))
    .then(response => response.text())
    .then(htmlContent => {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        function countBookmarks(nodes) {
          let total = 0;
          let folders = 0;
          function count(nodes) {
            nodes.forEach(node => {
              if (node.children) {
                folders++;
                count(node.children);
              } else if (node.url) {
                total++;
              }
            });
          }
          count(nodes);
          return { total, folders };
        }

        function generateSidebarHtml(nodes) {
          let html = '<ul>';
          function generateItems(nodes) {
            nodes.forEach((node) => {
              if (node.children && node.children.length > 0) {
                html += `<li><a class="sidebar-item" data-id="${node.id}">${escapeHtml(node.title)}</a></li>`;
                generateItems(node.children);
              }
            });
          }
          generateItems(nodes);
          html += '</ul>';
          return html;
        }

        function generateBookmarkContentHtml(nodes) {
          let html = '';
          function generateItems(nodes) {
            nodes.forEach((node) => {
              if (node.children && node.children.length > 0) {
                html += `<h2 id="folder-${node.id}" class="bookmark-title">${escapeHtml(node.title)}</h2><ul>`;
                generateItems(node.children);
                html += '</ul>';
              } else if (node.url) {
                const domain = new URL(node.url).hostname.replace('www.', '');
                const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
                const displayTitle = node.title || node.url;
                html += `<li class="link"><a href="${escapeHtml(node.url)}" target="_blank"><img src="${faviconUrl}" onerror="this.onerror=null;this.src='https://api.faviconkit.com/${domain}/64';" alt="Icon">${escapeHtml(displayTitle)}</a></li>`;
              }
            });
          }
          generateItems(nodes);
          return html;
        }

        function escapeHtml(unsafe) {
          return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }

        const bookmarkCount = countBookmarks(bookmarkTreeNodes);
        const sidebarHtml = generateSidebarHtml(bookmarkTreeNodes);
        const contentHtml = generateBookmarkContentHtml(bookmarkTreeNodes);

        doc.getElementById('bookmarkCount').innerText = `—— Total: ${bookmarkCount.total} ——`;
        doc.getElementById('bookmarkMenu').innerHTML = sidebarHtml;
        doc.getElementById('bookmarkContent').innerHTML = contentHtml;

        const shareLink = doc.getElementById('shareLink');
        if (shareLink) {
          shareLink.remove();
        }

        const scriptsToRemove = doc.querySelectorAll('script:not([src^="https://"])');
        scriptsToRemove.forEach(script => script.remove());

        const cssUrls = [
          'https://web.3702740.xyz/css/index.css',
          'https://web.3702740.xyz/css/style.css'
        ];

        cssUrls.forEach(url => {
          if (!doc.querySelector(`link[href="${url}"]`)) {
            const link = doc.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            doc.head.appendChild(link);
          }
        });

        const updatedHtml = doc.documentElement.outerHTML;
        const blob = new Blob([updatedHtml], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
          url: url,
          filename: 'bookmarks.html'
        });
      });
    });
}