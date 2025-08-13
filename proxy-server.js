const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;
const OLLAMA_URL = 'http://192.168.1.86:11434';

// 启用CORS
app.use(cors());

// 代理所有/api请求到Ollama
app.use('/api', createProxyMiddleware({
  target: OLLAMA_URL,
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.url} -> ${OLLAMA_URL}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // 添加CORS头
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error]', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ollama: OLLAMA_URL });
});

app.listen(PORT, () => {
  console.log(`🚀 Ollama代理服务器运行在: http://localhost:${PORT}`);
  console.log(`📡 代理到Ollama服务: ${OLLAMA_URL}`);
  console.log('\n在应用中使用以下配置:');
  console.log(`- Base URL: http://localhost`);
  console.log(`- Port: ${PORT}`);
});