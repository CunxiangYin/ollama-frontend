#!/bin/bash

# 局域网访问启动脚本

echo "🌐 启动 Ollama Frontend (局域网访问模式)"
echo "========================================"

# 获取本机IP地址
LOCAL_IP=$(ifconfig | grep -E 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)

if [ -z "$LOCAL_IP" ]; then
    echo "❌ 无法获取本机IP地址"
    exit 1
fi

echo "📍 本机IP地址: $LOCAL_IP"
echo ""

# 检查 build 目录是否存在
if [ ! -d "build" ]; then
    echo "❌ build 目录不存在，正在构建..."
    npm run build
fi

# 创建临时代理服务器配置
cat > simple-proxy-lan.js << EOF
const express = require('express');
const path = require('path');
const axios = require('axios');
const os = require('os');

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0'; // 监听所有网络接口
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
  const url = \`\${OLLAMA_URL}\${req.path}\`;
  console.log(\`[Proxy] \${req.method} \${req.path} -> \${url}\`);
  
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

app.listen(PORT, HOST, () => {
  console.log(\`
  ╔════════════════════════════════════════════════╗
  ║                                                ║
  ║   🚀 Ollama 代理服务已启动!                   ║
  ║                                                ║
  ║   本地访问: http://localhost:\${PORT}           ║
  ║   局域网访问: http://$LOCAL_IP:\${PORT}        ║
  ║   转发到: \${OLLAMA_URL}                       ║
  ║                                                ║
  ╚════════════════════════════════════════════════╝
  \`);
});
EOF

# 启动代理服务器（后台运行）
echo "🔧 启动代理服务器..."
node simple-proxy-lan.js &
PROXY_PID=$!
echo "代理服务器 PID: $PROXY_PID"

# 等待代理服务器启动
sleep 2

# 启动前端服务，监听所有网络接口
echo "🌐 启动前端服务..."
echo ""
echo "════════════════════════════════════════════════"
echo "✅ 服务已启动!"
echo ""
echo "📱 局域网访问地址:"
echo "   http://$LOCAL_IP:3000"
echo ""
echo "💻 本地访问地址:"
echo "   http://localhost:3000"
echo ""
echo "🔗 其他设备访问说明:"
echo "   1. 确保设备在同一局域网内"
echo "   2. 在浏览器中输入: http://$LOCAL_IP:3000"
echo "   3. 如有防火墙，请允许端口 3000 和 3001"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "════════════════════════════════════════════════"
echo ""

# 使用 npx serve 启动前端，监听所有接口
npx serve -s build -l 3000 -n

# 清理：当脚本退出时终止代理服务器
trap "kill $PROXY_PID 2>/dev/null; rm -f simple-proxy-lan.js" EXIT