const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;
const OLLAMA_URL = 'http://192.168.1.86:11434';

// 允许CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 解析JSON body
app.use(express.json());

// 代理 /api 请求到 Ollama
app.all('/api/*', async (req, res) => {
  const url = `${OLLAMA_URL}${req.path}`;
  console.log(`[Proxy] ${req.method} ${req.path} -> ${url}`);
  
  try {
    if (req.path === '/api/chat' && req.body.stream === true) {
      // 处理流式响应
      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        responseType: 'stream',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      response.data.pipe(res);
    } else {
      // 处理普通请求
      const response = await axios({
        method: req.method,
        url: url,
        data: req.body,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      res.json(response.data);
    }
  } catch (error) {
    console.error('[Proxy Error]', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message
    });
  }
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'build')));

// React路由支持
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
  ║   代理: ${OLLAMA_URL}             ║
  ║                                                ║
  ╚════════════════════════════════════════════════╝
  `);
});