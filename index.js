document.addEventListener('DOMContentLoaded', () => {
  const bookmarkContent = localStorage.getItem('bookmarkHtml');
  if (bookmarkContent) {
    document.getElementById('bookmarkContent').innerHTML = bookmarkContent;
  } else {
    console.error('No bookmark HTML content found');
  }
});

// window.onload = function() {
//   // 获取所有<ul>元素
//   var uls = document.getElementsByTagName('ul');
//   for (var i = 0; i < uls.length; i++) {
//     var lis = uls[i].getElementsByTagName('li');
//     for (var j = 0; j < lis.length; j++) {
//       // 检查<li>元素的文本内容是否为空
//       if (!lis[j].textContent.trim()) {
//         // 如果为空，则添加一个类来隐藏这个<li>元素
//         lis[j].classList.add('hide');
//       }
//     }
//   }
// };

// // 定义CSS类来隐藏元素
// document.write('<style>.hide { display: none; }</style>');