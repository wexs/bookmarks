document.getElementById('export').addEventListener('click', () => {
  const fileType = document.getElementById('fileType').value;

  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    if (fileType === 'json') {
      exportToJson(bookmarkTreeNodes);
    } else {
      exportToHtml(bookmarkTreeNodes);
    }
  });
});

document.getElementById('openInNewTab').addEventListener('click', () => {
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const bookmarkHtml = convertToHtml(bookmarkTreeNodes);
    const blob = new Blob([bookmarkHtml], { type: 'text/html' });
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
  const blob = new Blob([bookmarkHtml], { type: 'text/html' });
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
  <title>书签</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5; }
    ul { list-style-type: none; padding: 0; }
    li { margin: 10px 0; }
    .link { 
      background: #fff; 
      padding: 20px; 
      border-radius: 12px;
    }
    .folder { 
      background: #e1f5fe; 
      border-radius: 4px; 
      padding: 10px; 
    }
    .folder a{ 
      font-size: 24px;
      text-decoration: none;
      color: tomato;
    }
    .link a { 
      text-decoration: none; 
      color: #000; 
      display: flex; 
      align-items: center; 
      font-size: 16px;
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

  function traverse(nodes) {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        html += `<li class="folder"><a href="#">${node.title}</a><ul>`;
        traverse(node.children);
        html += '</ul></li>';
      } else {
        const faviconUrl = node.url ? `https://www.google.com/s2/favicons?sz=64&domain_url=${new URL(node.url).hostname}` : '';
        const displayTitle = node.title || node.url;
        html += `<li class="link"><a href="${node.url}"><img src="${faviconUrl}" alt="Icon">${displayTitle}</a></li>`;
      }
    });
  }

  traverse(nodes);
  html += `
  </ul>
</body>
</html>`;
  
  return html;
}