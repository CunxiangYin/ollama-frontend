#!/bin/bash

# 生产环境启动脚本

echo "🚀 启动 Ollama Frontend 生产环境"
echo "================================"

# 检查 build 目录是否存在
if [ ! -d "build" ]; then
    echo "❌ build 目录不存在，正在构建..."
    npm run build
fi

# 启动代理服务器（后台运行）
echo "🔧 启动代理服务器..."
node simple-proxy.js &
PROXY_PID=$!
echo "代理服务器 PID: $PROXY_PID"

# 等待代理服务器启动
sleep 2

# 启动前端服务
echo "🌐 启动前端服务..."
echo "服务地址: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 使用 npx serve 启动前端
npx serve -s build -l 3000

# 清理：当脚本退出时终止代理服务器
trap "kill $PROXY_PID 2>/dev/null" EXIT