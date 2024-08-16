document.addEventListener('DOMContentLoaded', function () {
    // 生成侧边栏 HTML
    let bookmarkTreeNodes = null
    chrome.storage.local.get('bookmarkTree', (result) => {
        if (result.bookmarkTree) {
            bookmarkTreeNodes = result.bookmarkTree;
            const sidebarHtml = generateSidebarHtml(bookmarkTreeNodes);
            document.getElementById('bookmarkMenu').innerHTML = sidebarHtml;
            const contentHtml = generateBookmarkContentHtml(bookmarkTreeNodes);
            document.getElementById('bookmarkContent').innerHTML = contentHtml;
            setupSidebarClickHandlers();
        }
    });

    document.getElementById('shareLink').addEventListener('click', function () {
        fetch('https://serve.3702740.xyz/api/temp/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: bookmarkTreeNodes })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    window.open(`https://web.3702740.xyz/?code=${data.data.code}`, "_blank",);
                } else {
                    alert('分享失败，请稍后再试！' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('分享失败，请稍后再试！');
            });
    });

});

function generateSidebarHtml(nodes) {
    let html = '<ul>';
    function generateSidebarItems(nodes) {
        nodes.forEach((node) => {
            if (node.children && node.children.length > 0) {
                html += `<li><a class="sidebar-item" data-id="${node.id}">${node.title}</a></li>`;
                node.children.forEach((child) => {
                    generateSidebarItems([child]);
                });
            }
        });
    }
    generateSidebarItems(nodes);
    html += '</ul>';
    return html;
}
// 生成书签内容 HTML
function generateBookmarkContentHtml(nodes) {
    let html = '';
    function generateContentItems(nodes) {
        nodes.forEach((node) => {
            if (node.children && node.children.length > 0) {
                html += `<h2 id="folder-${node.id}" class="bookmark-title">${node.title}</h2><ul>`;
                node.children.forEach((child) => {
                    generateContentItems([child]);
                });
                html += '</ul>';
            } else if (node.url) {
                const domain = new URL(node.url).hostname.replace('www.', '');
                const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`;
                const displayTitle = node.title || node.url;
                html += `<li class="link"><a href="${node.url}" target="_blank"><img src="${faviconUrl}" onerror="this.onerror=null;this.src='https://api.faviconkit.com/${domain}/64';" alt="Icon">${displayTitle}</a></li>`;
            }
        });
    }
    generateContentItems(nodes);
    return html;
}
// 设置侧边栏点击事件
function setupSidebarClickHandlers() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item) => {
        item.addEventListener('click', function () {
            const id = item.getAttribute('data-id');
            const target = document.getElementById(`folder-${id}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

//书签总数
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
  chrome.bookmarks.getTree((bookmarkTreeNodes) => {
    const totalBookmarks = countBookmarks(bookmarkTreeNodes);
    document.getElementById('bookmarkCount').innerText = `—— Total: ${totalBookmarks} ——`;
  });
