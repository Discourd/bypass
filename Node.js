// backend/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// プロキシ設定
const deltaProxy = createProxyMiddleware({
  target: 'https://example-delta-site.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // /apiを削除してターゲットに転送
  },
  onProxyReq: (proxyReq, req, res) => {
    // 必要に応じてヘッダーを追加
    proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');
  },
  onProxyRes: (proxyRes, req, res) => {
    // レスポンスヘッダー処理
    proxyRes.headers['access-control-allow-origin'] = '*';
  }
});

app.use('/api', deltaProxy);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で実行中`);
});
