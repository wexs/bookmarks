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
  const totalBookmarks = countBookmarks(nodes);
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
      padding: 0px;
      box-sizing: border-box;
      height: 100%;
      overflow-y: auto;
      z-index: 2;
    }
    .sidebar h1 {
      text-align: center;
      margin-top: 24px;
      margin-bottom: 0px;
      font-size: 80px;
    }
    .sidebar h2 {
      text-align: center;
      margin: 0px;
      font-size: 24px;
    }
    .sidebar p {
      text-align: center;
      margin-top:4px;
      font-size: 12px;
      color:rgba(0,0,0,0.50);
    }
    .sidebar ul {
      list-style-type: none;
      padding: 20px;
      padding-top: 0px;
      padding-bottom: 80px;
      font-size: 16px;
      margin-top: 0px;
    }
    .sidebar ul li {
      margin: 10px 0;
      font-weight: bold;
    }
    .sidebar ul li a {
      color: rgb(0, 97, 21);
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
      max-width:1200px;
      margin: 0 auto;
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
    .info p {
      color: rgba(0,0,0,0.50);
      font-size: 12px;
      margin: 0px;
      margin-top:4px;
      text-align:left;
    }
    .info {
      bottom: 0px;
      position: fixed;
      background-color: #ffffff00;
      backdrop-filter: saturate(180%) blur(20px);
      -webkit-backdrop-filter: saturate(180%) blur(20px);;
      width: 160px;
      padding: 20px;
      padding-top: 12px;
      padding-bottom: 12px;
      z-index: 999;
    }
    .coffe svg{
      color:#000;
    }
    .coffe :hover{
      color:rgba(0,0,0,0.5);
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
    <h1>🔖</h1>
    <div class="share" >
      <a href="https://song.bss.design/">🚧</a>
    </div>
    <div class="info">
      <div class="coffe">
        <a href="https://github.com/wexs/bookmarks">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z"></path></svg>
        </a>
      </div>
      <p>© Maple design</p>
    </div>
    <h2>BookMarks</h2>
    <p>总计: ${totalBookmarks}</p>
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
        const faviconUrl = node.url ? `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}` : 'default-icon.png';
        const displayTitle = node.title || node.url;
        html += `${' '.repeat(indent)}<li class="link"><a href="${node.url}"><img src="${faviconUrl}" onerror="this.onerror=null;this.src='default-icon.png';" alt="Icon">${displayTitle}</a></li>\n`;
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

function countBookmarks(nodes) {
  let count = 0;
  nodes.forEach((node) => {
    if (node.url) {
      count++;
    } else if (node.children) {
      count += countBookmarks(node.children);
    }
  });
  return count;
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