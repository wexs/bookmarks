document.addEventListener('DOMContentLoaded', () => {
  const bookmarkContent = localStorage.getItem('bookmarkHtml');
  if (bookmarkContent) {
    document.getElementById('bookmarkContent').innerHTML = bookmarkContent;
  } else {
    console.error('No bookmark HTML content found');
  }
});