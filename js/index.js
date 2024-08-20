document.addEventListener('DOMContentLoaded', function () {
    const notyf = new Notyf({
        duration: 0,
        dismissible: true,
        position: {
            x: 'right',
            y: 'top',
        },
        types: [
            {
                type: 'success',
                className: 'custom-notyf',
                icon: false,
            },
            {
                type: 'error',
                className: 'custom-notyf',
                icon: false,
            }
        ]
    });

    let bookmarkTreeNodes = null;
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

    const shareLink = document.getElementById('shareLink');
    shareLink.addEventListener('click', function () {
        shareLink.classList.add('loading');
        fetch('https://serve.3702740.xyz/api/temp/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: bookmarkTreeNodes })
        })
        .then(response => response.json())
        .then(data => {
            shareLink.classList.remove('loading');

            if (data.status) {
                navigator.clipboard.writeText(`https://web.3702740.xyz/?code=${data.data.code}`)
                    .then(() => {
                        notyf.success(`Success! Link copied to clipboard <br />
                            <a href="https://web.3702740.xyz/?code=${data.data.code}" target="_blank">Click here</a>`);
                        setTimeout(function() {
                            window.open(`https://web.3702740.xyz/?code=${data.data.code}`, "_blank", "noopener,noreferrer");
                        }, 1500);
                    })
                    .catch(err => {
                        notyf.error('error Failed to copy the link, please try again');
                    });
            } else {
                notyf.error('error Sharing failed. Please try again later' + data.message);
            }
        })
        .catch(error => {
            shareLink.classList.remove('loading');
            notyf.error('error Sharing failed. Please try again later');
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
