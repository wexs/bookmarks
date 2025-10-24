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
                // 添加包含按钮的容器（只保留编辑和删除按钮）
                html += `
                <li class="link" data-id="${node.id}">
                    <a href="${node.url}" target="_blank">
                        <img src="${faviconUrl}" onerror="this.onerror=null;this.src='https://api.faviconkit.com/${domain}/64';" alt="Icon">
                        ${displayTitle}
                    </a>
                    <div class="bookmark-actions">
                        <button class="action-btn edit-btn" title="Edit" data-id="${node.id}" data-title="${escapeHtml(displayTitle)}" data-url="${escapeHtml(node.url)}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                            </svg>
                        </button>
                        <button class="action-btn delete-btn" title="Delete" data-id="${node.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>
                    </div>
                </li>`;
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

    // 添加编辑按钮事件监听器
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-btn')) {
            const editBtn = e.target.closest('.edit-btn');
            const bookmarkId = editBtn.getAttribute('data-id');
            const currentTitle = editBtn.getAttribute('data-title');
            const currentUrl = editBtn.getAttribute('data-url');
            editBookmark(bookmarkId, currentTitle, currentUrl);
        }
        
        if (e.target.closest('.delete-btn')) {
            const deleteBtn = e.target.closest('.delete-btn');
            const bookmarkId = deleteBtn.getAttribute('data-id');
            deleteBookmark(bookmarkId);
        }
    });
}
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
if (chrome?.bookmarks?.getTree) {
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
                                setTimeout(function () {
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
} else {
    document.getElementById('shareLink').style.display = 'none';
    const urlParams = new URLSearchParams(window.location.search);
    fetch(`https://serve.3702740.xyz/api/temp/get/${urlParams.get('code')}`, { method: 'GET' })
        .then(response => {
            return response.json();
        })
        .then(data => {
            const sidebarHtml = generateSidebarHtml(data.data);
            document.getElementById('bookmarkMenu').innerHTML = sidebarHtml;
            const contentHtml = generateBookmarkContentHtml(data.data);
            document.getElementById('bookmarkContent').innerHTML = contentHtml;
            setupSidebarClickHandlers();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 添加编辑书签的函数
function editBookmark(bookmarkId, currentTitle, currentUrl) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editBookmarkModal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Edit Bookmark</h2>
            <form id="editBookmarkForm">
                <label for="editTitle">Title:</label>
                <input type="text" id="editTitle" value="${currentTitle}" required>
                <label for="editUrl">URL:</label>
                <input type="url" id="editUrl" value="${currentUrl}" required>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // 显示模态框
    modal.style.display = 'block';

    // 关闭模态框事件
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    }

    // 点击模态框外部关闭
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        }
    }

    // 表单提交事件
    const form = document.getElementById('editBookmarkForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        const newTitle = document.getElementById('editTitle').value;
        const newUrl = document.getElementById('editUrl').value;
        
        // 使用 Chrome bookmarks API 更新书签
        if (chrome?.bookmarks?.update) {
            chrome.bookmarks.update(bookmarkId, {
                title: newTitle,
                url: newUrl
            }, (updatedBookmark) => {
                if (chrome.runtime.lastError) {
                    console.error('Error updating bookmark:', chrome.runtime.lastError);
                    alert('Failed to update bookmark: ' + chrome.runtime.lastError.message);
                } else {
                    // 更新页面上的显示
                    updateBookmarkDisplay(bookmarkId, newTitle, newUrl);
                    // 更新localStorage中的书签数据
                    updateLocalStorageBookmarks();
                }
            });
        } else {
            // 如果没有 Chrome API 权限，只更新页面上的显示
            updateBookmarkDisplay(bookmarkId, newTitle, newUrl);
        }
        
        // 关闭模态框
        modal.style.display = 'none';
        document.body.removeChild(modal);
    }
}

// 更新书签显示
function updateBookmarkDisplay(bookmarkId, newTitle, newUrl) {
    const bookmarkElement = document.querySelector(`.link[data-id="${bookmarkId}"]`);
    if (bookmarkElement) {
        const linkElement = bookmarkElement.querySelector('a');
        linkElement.href = newUrl;
        linkElement.innerHTML = `
            ${linkElement.innerHTML.split('>')[0]}>${escapeHtml(newTitle)}
        `;
    }
}

// 添加删除书签的函数
function deleteBookmark(bookmarkId) {
    if (confirm('Are you sure you want to delete this bookmark?')) {
        // 使用 Chrome bookmarks API 真正删除书签
        if (chrome?.bookmarks?.remove) {
            chrome.bookmarks.remove(bookmarkId, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error deleting bookmark:', chrome.runtime.lastError);
                    alert('Failed to delete bookmark: ' + chrome.runtime.lastError.message);
                } else {
                    // 从页面上移除书签
                    const bookmarkElement = document.querySelector(`.link[data-id="${bookmarkId}"]`);
                    if (bookmarkElement) {
                        bookmarkElement.remove();
                    }
                    // 更新书签计数
                    updateBookmarkCount();
                    // 更新localStorage中的书签数据
                    updateLocalStorageBookmarks();
                }
            });
        } else {
            // 如果没有 Chrome API 权限，只在页面上移除
            const bookmarkElement = document.querySelector(`.link[data-id="${bookmarkId}"]`);
            if (bookmarkElement) {
                bookmarkElement.remove();
            }
        }
    }
}

// 更新localStorage中的书签数据
function updateLocalStorageBookmarks() {
    if (chrome?.bookmarks?.getTree) {
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
            // 更新localStorage中的数据
            chrome.storage.local.set({ bookmarkTree: bookmarkTreeNodes }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Error updating localStorage:', chrome.runtime.lastError);
                }
            });
        });
    }
}

// 更新书签计数
function updateBookmarkCount() {
    if (chrome?.bookmarks?.getTree) {
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
            const totalBookmarks = countBookmarks(bookmarkTreeNodes);
            document.getElementById('bookmarkCount').innerText = `—— Total: ${totalBookmarks} ——`;
        });
    }
}
