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
  const styles = `
  <style>
    body {
      display: flex;
      font-family: Arial, sans-serif;
      background-color: #fff;
      margin: 0;
      padding: 0;
      height: 100vh;
      box-sizing: border-box;
    }
    .sidebar {
      min-width: 200px;
      background-image: linear-gradient(-45deg, #E0EA5E 0%, #30D158 100%);
      color: #000;
      padding: 20px;
      box-sizing: border-box;
      height: 100%;
      overflow-y: auto;
    }
    .sidebar h2 {
      text-align: center;
      margin: 0 0 20px;
      font-size: 24px;
    }
    .sidebar ul {
      list-style-type: none;
      padding: 0;
      margin-top: 40px;
      font-size: 16px;
    }
    .sidebar ul li {
      margin: 10px 0;
      font-weight: bold;
    }
    .sidebar ul li a {
      color: rgba(0,0,0,0.5);
      text-decoration: none;
      display: block;
      padding: 12px;
      border-radius: 8px;
      transition: all 0.3s;

    }
    .sidebar ul li a:hover {
      background: rgba(250,250,250,0.5);
    }
    .content {
      flex-grow: 1;
      padding-right: 24px;
      padding-left: 24px;
      box-sizing: border-box;
      overflow-y: auto;
    }
    .content ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
      font-size: 16px;
    }
    .content li {
      margin: 10px 0;
      background: rgba(48,209,88,0.1);
      border-radius: 4px;
      padding: 16px;
      box-sizing: border-box;
      float: left;
      margin-right: 20px;
      border-radius: 12px;
    }
    .content li a {
      text-decoration: none;
      color: #000;
      display: flex;
      align-items: center;
    }
    .content li a img {
      width: 32px;
      height: 32px;
      margin-right: 10px;
    }
    .content li:hover {
      background: rgba(48,209,88,0.2);
    }
    .bookmark-title {
      margin-bottom: 12px;
      clear: both;
      font-size:32px;
      padding-top:32px;
      margin-top: 0px;
    }
    folder-0 {
      user-select: none;
    }
    .info p {
      position: fixed;  
      bottom: 12px;
      color: rgba(0,0,0,0.50);
      font-size: 14px;
    }
    .coffe p{
      position: fixed;  
      bottom: 8px;
      font-size: 40px;
    }
    .share {
      background-image: linear-gradient(-45deg, #E0EA5E 0%, #30D158 100%);
      width: 64px;
      height: 64px;
      border-radius: 32px;
      position: fixed;  
      top: 40px;
      right: 40px;
      transition: all 0.3s;
    }
    .share a {
      font-size: 32px;
      text-align: center;
      line-height:60px;
      padding:16px;
      text-decoration: none;
    }
    .share:hover { 
      transform: rotateZ(30deg) scale(1.1);
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-image: linear-gradient(45deg, #0A2A12 0%, #2D2F13 100%);
        color:#fff;
      }
      .content li a {
        color: #fff;
      }
      .content li {
        background: rgba(250,250,250,0.05);
      }
    }
  </style>`;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>书签</title>
  ${styles}
</head>
<body>
  <div class="sidebar">
    <h1 style="font-size: 80px;text-align: center; margin:4px;">🔖</h1>
    <div class="coffe">
      <p>☕</p>
    </div>
    <div class="share" >
      <a href="https://song.bss.design/">🚧</a>
    </div>
    <div class="info">
      <p>© Maple design</p>
    </div>
    <h2>书签文件夹</h2>
    <ul>`;

  function generateSidebar(nodes) {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        html += `<li><a href="#folder-${node.id}">${node.title}</a></li>`;
        node.children.forEach((child) => {
          generateSidebar([child]); // Recursively add child folders to sidebar
        });
      }
    });
  }

  generateSidebar(nodes);

  html += `</ul></div><div class="content">`;

  function generateBookmarkList(nodes, indent = 0) {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        html += `${' '.repeat(indent)}<h2 id="folder-${node.id}" class="bookmark-title">${node.title}</h2>\n${' '.repeat(indent)}<ul>\n`;
        node.children.forEach((child) => {
          generateBookmarkList([child], indent + 2); // Recursively add child bookmarks
        });
        html += `${' '.repeat(indent)}</ul>\n`;
      } else if (node.url) {
        const domain = new URL(node.url).hostname.replace('www.', '');
        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
        const displayTitle = node.title || node.url;
        const color = stringToColor(domain);
        const initial = domain.charAt(0).toUpperCase();
        html += `${' '.repeat(indent)}<li class="link"><a href="${node.url}"><img src="${faviconUrl}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="icon-placeholder" style="display: none; background-color:${color};">${initial}</div>${displayTitle}</a></li>\n`;
      }
    });
  }

  generateBookmarkList(nodes);

  html += `
  </div>
</body>
</html>`;

  return html;
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return '#' + '00000'.substring(0, 6 - color.length) + color;
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