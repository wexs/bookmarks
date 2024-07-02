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

    document.getElementById('loginBut').addEventListener('click', function () {
        document.getElementById('loginModal').style.display = "block";
    });
    document.getElementById('registerBut').addEventListener('click', function () {
        document.getElementById('registerModal').style.display = "block";
    });

    document.getElementById('logout').addEventListener('click', function () {
        document.getElementById('loginBut').style.display = "block";
        document.getElementById('registerBut').style.display = "block";
        document.getElementById('logout').style.display = "none";
        document.getElementById('userName').style.display = "none";
    });

    document.getElementsByClassName('close')[0].addEventListener('click', function () {
        document.getElementById('loginModal').style.display = "none";
        document.getElementById('registerModal').style.display = "none";
    });

    window.addEventListener('click', function (event) {
        if (event.target == document.getElementById('myModal')) {
            document.getElementById('myModal').style.display = "none";
        }
    });


    document.getElementById('shareLink').addEventListener('click', function () {
        
        fetch('http://yd.3702740.xyz:30001/api/temp/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: bookmarkTreeNodes })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    window.open(`http://yd.3702740.xyz:800/?code=${data.data.code}`, "_blank",);
                } else {
                    alert('分享失败，请稍后再试！' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('分享失败，请稍后再试！');
            });

    });

    document.getElementById('loginModal').addEventListener('submit', function (event) {
        event.preventDefault();
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        fetch('http://yd.3702740.xyz:30001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, email })
        })
            .then(response => response.json())
            .then(res => {
                if (res.status) {
                    document.getElementById("userName").innerHTML = `${res.data.user.name} 欢迎您！`
                    document.getElementById('loginModal').style.display = "none";
                    document.getElementById('loginBut').style.display = "none";
                    document.getElementById('registerBut').style.display = "none";
                    document.getElementById('logout').style.display = "block";
                    document.getElementById('userName').style.display = "block";
                } else {
                    alert('登录失败：' + res.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // alert('登录失败，请稍后再试。');
            });
    });
    document.getElementById('registerForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        fetch('http://yd.3702740.xyz:30001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, password, email })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    alert('注册成功！');
                    document.getElementById('myModal').style.display = "none";
                } else {
                    alert('注册失败：' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('注册失败，请稍后再试。');
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

  // 导出 HTML 功能
  document.getElementById('exportHtml').addEventListener('click', function () {
    // 获取 CSS 和 JS 文件的内容
    fetch('style.css')
        .then(response => response.text())
        .then(styleCss => {
            fetch('index.css')
                .then(response => response.text())
                .then(indexCss => {
                    fetch('index.js')
                        .then(response => response.text())
                        .then(indexJs => {
                            // 获取整个 HTML 页面内容
                            var htmlContent = document.documentElement.outerHTML;

                            // 创建内联 CSS 和 JS 的 HTML 字符串
                            var newHtmlContent = htmlContent.replace('</head>', `
                                <style>${styleCss}</style>
                                <style>${indexCss}</style>
                                </head>
                                `).replace('</body>', `
                                <script>${indexJs}</script>
                                </body>
                                `);
                            console.log("newHtmlContent:", newHtmlContent)

                            // 创建一个 Blob 对象
                            var blob = new Blob([newHtmlContent], { type: 'text/html' });

                            // 创建一个 URL 对象
                            var url = URL.createObjectURL(blob);

                            // 创建一个 <a> 元素
                            var a = document.createElement('a');
                            a.href = url;
                            a.download = 'bookmarks.html';

                            // 模拟点击 <a> 元素以触发下载
                            a.click();

                            // 释放 URL 对象
                            URL.revokeObjectURL(url);
                        });
                });
        });
});