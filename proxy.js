const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// 代理Ollama API请求
app.use('/api', createProxyMiddleware({
  target: 'http://192.168.1.86:11434',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // 添加CORS头
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error]', err.message);
    res.status(500).json({ error: 'Proxy error' });
  }
}));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'build')));

// 所有其他路由返回index.html（支持React Router）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════╗
  ║                                                ║
  ║   🚀 Ollama Chat 已启动!                      ║
  ║                                                ║
  ║   访问: http://localhost:${PORT}                   ║
  ║   代理: http://192.168.1.86:11434             ║
  ║                                                ║
  ╚════════════════════════════════════════════════╝
  `);
});