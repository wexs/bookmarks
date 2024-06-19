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
    body { font-family: Arial, sans-serif; }
    ul { list-style-type: none; padding: 0; }
    li { margin: 10px 0; }
    a { 
      display: block; 
      padding: 10px; 
      text-decoration: none; 
      color: #000; 
      background: #f9f9f9; 
      border: 1px solid #ddd; 
      border-radius: 4px; 
      box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1); 
      transition: background 0.3s ease; 
    }
    a:hover { background: #f1f1f1; }
    .folder > a { font-weight: bold; }
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
        html += `<li><a href="${node.url}">${node.title}</a></li>`;
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