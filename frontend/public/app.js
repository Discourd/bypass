document.addEventListener('DOMContentLoaded', () => {
  const contentDiv = document.getElementById('content');
  
  // プロキシ経由でコンテンツを取得
  fetch('/api/delta-content')
    .then(response => response.text())
    .then(html => {
      contentDiv.innerHTML = html;
      
      // 取得したコンテンツ内のリンクを書き換え
      const links = contentDiv.querySelectorAll('a');
      links.forEach(link => {
        const originalHref = link.getAttribute('href');
        if (originalHref && originalHref.startsWith('/')) {
          link.setAttribute('href', `/api${originalHref}`);
        }
      });
    })
    .catch(error => {
      console.error('コンテンツ取得エラー:', error);
      contentDiv.innerHTML = '<p>コンテンツを取得できませんでした。後でもう一度お試しください。</p>';
    });
});
