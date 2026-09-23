const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 600 });

app.use(cors());
app.use(express.json());

// デルタサイトのURL（ここに実際のサイトを入力）
const DELTA_SITE_URL = process.env.DELTA_URL || 'https://example-delta-site.com';

const deltaProxy = createProxyMiddleware({
  target: DELTA_SITE_URL,
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0');
  },
  onProxyRes: (proxyRes) => {
    proxyRes.headers['access-control-allow-origin'] = '*';
  }
});

app.use('/api', deltaProxy);

// 簡易ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Delta bypass server running on port ${PORT}`);
});
