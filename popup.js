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
  const categories = {
    "新闻": ["Google.com","toutiao.com"],
    "社交": ["bilibili.com","weibo.com"],
    "购物": ["taobao.com", "jd.com"],
    "设计": ["behance.com", "dribble.com"],
    "其他": []
  };

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>书签</title>
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
      color: #ecf0f1;
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
      color: #ecf0f1;
      text-decoration: none;
      display: block;
      padding: 10px;
      border-radius: 4px;
      transition: all 0.3s;

    }
    .sidebar ul li a:hover {
      background: rgba(40,120,59,0.3);
    }
    .content {
      flex-grow: 1;
      padding: 20px;
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
      
    }
    .share p {
      font-size: 24px;
      transition: all 0.3s;
      text-align: center;
      margin-top: 17px;
    }
    .share:hover p{
      transform: rotateZ(180deg) scale(1.2);
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
  </style>
</head>
<body>
  <div class="sidebar">
    <h1 style="font-size: 60px;text-align: center; margin:4px;">🔖</h1>
    <div class="coffe">
      <p>☕</p>
    </div>
    <div class="share">
      <p>🔗</p>
    </div>
    <div class="info">
      <p>© Maple design</p>
    </div>
    <h2>BookMarks</h2>
    <ul>`;
  
  for (const category in categories) {
    html += `<li><a href="#${category}">${category}</a></li>`;
  }

  html += `</ul></div><div class="content">`;

  for (const category in categories) {
    html += `<h2 id="${category}">${category}</h2><ul>`;
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach((childNode) => {
          if (childNode.children && childNode.children.length > 0) {
            childNode.children.forEach((grandChildNode) => {
              categorizeBookmarks(grandChildNode, category);
            });
          } else {
            categorizeBookmarks(childNode, category);
          }
        });
      }
    });
    html += '</ul>';
  }

  function categorizeBookmarks(node, category) {
    if (node.children && node.children.length > 0) {
      node.children.forEach((childNode) => {
        categorizeBookmarks(childNode, category);
      });
    } else if (node.url) {
      const domain = new URL(node.url).hostname.replace('www.', '');
      if (categories[category].includes(domain) || category === "其他") {
        const faviconUrl = node.url ? `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}` : '';
        const displayTitle = node.title || node.url;
        html += `<li class="link"><a href="${node.url}"><img src="${faviconUrl}" alt="Icon">${displayTitle}</a></li>`;
      }
    }
  }

  html += `
  </div>
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