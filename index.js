document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginBut').addEventListener('click', function () {
        document.getElementById('loginModal').style.display = "block";
    });
    document.getElementById('registerBut').addEventListener('click', function () {
        document.getElementById('registerModal').style.display = "block";
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

    document.getElementById('loginModal').addEventListener('submit', function (event) {
        event.preventDefault();
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        fetch('http://127.0.0.1:30001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, email })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('登录成功！');
                    document.getElementById('loginModal').style.display = "none";
                } else {
                    alert('登录失败：' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('登录失败，请稍后再试。');
            });
    });
    document.getElementById('registerForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        fetch('http://127.0.0.1:30001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, password, email })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
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

    chrome.storage.local.get('bookmarkTree', (result) => {
        if (result.bookmarkTree) {
            const bookmarkTreeNodes = result.bookmarkTree;
            const sidebarHtml = generateSidebarHtml(bookmarkTreeNodes);
            document.getElementById('bookmarkMenu').innerHTML = sidebarHtml;

            const contentHtml = generateBookmarkContentHtml(bookmarkTreeNodes);
            document.getElementById('bookmarkContent').innerHTML = contentHtml;

            setupSidebarClickHandlers();
        }
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

