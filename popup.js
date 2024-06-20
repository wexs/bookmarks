document.getElementById('exportJson').addEventListener('click', () => {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    exportToJson(bookmarkTreeNodes);
  });
});

document.getElementById('exportHtml').addEventListener('click', () => {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    exportToHtml(bookmarkTreeNodes);
  });
});

document.getElementById('openInNewTab').addEventListener('click', () => {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const bookmarkHtml = convertToHtml(bookmarkTreeNodes);
    const formattedHtml = formatHtml(bookmarkHtml);
    const blob = new Blob([formattedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    chrome.tabs.create({ url });
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

function exportToHtml(bookmarkTreeNodes) {
  const bookmarkHtml = convertToHtml(bookmarkTreeNodes);
  const formattedHtml = formatHtml(bookmarkHtml);
  const blob = new Blob([formattedHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bookmarks.html';
  a.click();
  URL.revokeObjectURL(url);
}

function convertToHtml(nodes) {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="style.css">
  <title>书签</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      padding: 20px; 
      background-color: #e1f5fe;
    }
    ul { list-style-type: none; padding: 0; }
    li { margin: 10px 0; }
    .link { 
      background: #fff; 
      padding: 20px; 
      border-radius: 12px;
      float: left;
      margin-right: 20px;
    }
    .folder { 
      border-radius: 4px; 
      padding: 10px; 
      float: left;
    }

    .folder a{ 
      font-size: 24px;
      text-decoration: none;
      color: tomato;
      font-weight: bold;
    }
    .link a { 
      text-decoration: none; 
      color: #000; 
      display: flex; 
      align-items: center; 
      font-size: 16px;
      font-weight: normal;
    }
    .link a img, .folder a img { 
      width: 32px; 
      height: 32px; 
      margin-right: 10px; 
    }
    .link:hover:hover { 
      background: hsla(0, 0%, 100%, 0.5); 
    }
  </style>
</head>
<body>
  <ul>`;

  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      html += `<li class="folder"><a href="#">${node.title}</a><ul>`;
      node.children.forEach((childNode) => {
        if (childNode.children && childNode.children.length > 0) {
          html += `<li class="folder"><a href="#">${childNode.title}</a><ul>`;
          childNode.children.forEach((grandChildNode) => {
            extractBookmarks(grandChildNode);
          });
          html += '</ul></li>';
        } else {
          extractBookmarks(childNode);
        }
      });
      html += '</ul></li>';
    }
  });

  function extractBookmarks(node) {
    if (node.children && node.children.length > 0) {
      node.children.forEach((childNode) => {
        extractBookmarks(childNode);
      });
    } else if (node.url) {
      const faviconUrl = node.url ? `https://www.google.com/s2/favicons?sz=64&domain_url=${new URL(node.url).hostname}` : '';
      const displayTitle = node.title || node.url;
      html += `<li class="link"><a href="${node.url}"><img src="${faviconUrl}" alt="Icon">${displayTitle}</a></li>`;
    }
  }

  html += `
  </ul>
</body>
</html>`;
  
  return html;
}

function formatHtml(html) {
  const formatted = html.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');
  let pad = 0;
  return formatted.split('\r\n').map((node, index) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) {
        pad -= 1;
      }
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    const padding = '  '.repeat(pad);
    pad += indent;
    return padding + node;
  }).join('\r\n');
}