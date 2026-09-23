const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const NodeCache = require('node-cache');
const axios = require('axios');

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // 10分キャッシュ

app.use(cors());
app.use(express.json());

// デルタサイトのURL（実際のサイトに合わせて変更）
const DELTA_SITE_URL = 'https://example-delta-site.com';

// プロキシ設定
const deltaProxy = createProxyMiddleware({
  target: DELTA_SITE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader('X-Requested-With', 'XMLHttpRequest');
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['access-control-allow-origin'] = '*';
  }
});

app.use('/api', deltaProxy);

// 動的コンテンツ処理エンドポイント
app.get('/api/dynamic-content', async (req, res) => {
  try {
    const cacheKey = `delta-${req.url}`;
    let cachedContent = cache.get(cacheKey);
    
    if (cachedContent) {
      return res.send(cachedContent);
    }
    
    const response = await axios.get(`${DELTA_SITE_URL}${req.path}`);
    const modifiedContent = processDeltaContent(response.data);
    cache.set(cacheKey, modifiedContent);
    res.send(modifiedContent);
  } catch (error) {
    console.error('コンテンツ処理エラー:', error);
    res.status(500).send('コンテンツ取得エラー');
  }
});

// コンテンツ処理関数
function processDeltaContent(content) {
  // デルタサイトのURLを書き換え
  return content.replace(/https:\/\/example-delta-site\.com/g, window.location.origin);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で実行中`);
});
