#!/bin/bash

# Ollama Frontend 部署脚本

echo "🚀 Ollama Frontend 部署脚本"
echo "=========================="

# 检查是否已安装必要的工具
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装"
        return 1
    else
        echo "✅ $1 已安装"
        return 0
    fi
}

# 方式1: 使用 serve (简单部署)
deploy_with_serve() {
    echo ""
    echo "📦 使用 serve 部署..."
    
    # 安装 serve（如果未安装）
    if ! check_command serve; then
        echo "正在安装 serve..."
        npm install -g serve
    fi
    
    # 构建项目
    echo "🔨 构建项目..."
    npm run build
    
    # 启动服务
    echo "🚀 启动服务..."
    echo "服务将运行在: http://localhost:3000"
    serve -s build -l 3000
}

# 方式2: 使用 PM2 (生产环境推荐)
deploy_with_pm2() {
    echo ""
    echo "📦 使用 PM2 部署..."
    
    # 检查并安装 PM2
    if ! check_command pm2; then
        echo "正在安装 PM2..."
        npm install -g pm2
    fi
    
    # 构建项目
    echo "🔨 构建项目..."
    npm run build
    
    # 创建 PM2 配置文件
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ollama-frontend',
    script: 'npx',
    args: 'serve -s build -l 3000',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'ollama-proxy',
    script: 'simple-proxy.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF
    
    # 启动应用
    echo "🚀 启动应用..."
    pm2 start ecosystem.config.js
    
    echo ""
    echo "✅ 部署完成！"
    echo "前端服务: http://localhost:3000"
    echo "代理服务: http://localhost:3001"
    echo ""
    echo "PM2 管理命令:"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs"
    echo "  停止服务: pm2 stop all"
    echo "  重启服务: pm2 restart all"
    echo "  删除服务: pm2 delete all"
}

# 方式3: 使用 Docker 部署
deploy_with_docker() {
    echo ""
    echo "🐳 使用 Docker 部署..."
    
    # 创建 Dockerfile
    cat > Dockerfile << 'EOF'
# 构建阶段
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 运行阶段
FROM node:18-alpine
WORKDIR /app

# 安装 serve
RUN npm install -g serve

# 复制构建产物和代理服务器
COPY --from=builder /app/build ./build
COPY --from=builder /app/simple-proxy.js ./
COPY --from=builder /app/package*.json ./

# 安装运行时依赖
RUN npm ci --only=production

# 暴露端口
EXPOSE 3000 3001

# 创建启动脚本
RUN echo '#!/bin/sh' > start.sh && \
    echo 'node simple-proxy.js &' >> start.sh && \
    echo 'serve -s build -l 3000' >> start.sh && \
    chmod +x start.sh

# 启动服务
CMD ["./start.sh"]
EOF
    
    # 创建 .dockerignore
    cat > .dockerignore << 'EOF'
node_modules
.git
.gitignore
README.md
.env.local
.env
npm-debug.log
.DS_Store
*.log
EOF
    
    # 构建 Docker 镜像
    echo "🔨 构建 Docker 镜像..."
    docker build -t ollama-frontend .
    
    # 运行容器
    echo "🚀 启动 Docker 容器..."
    docker run -d \
        --name ollama-frontend \
        -p 3000:3000 \
        -p 3001:3001 \
        --restart unless-stopped \
        ollama-frontend
    
    echo ""
    echo "✅ Docker 部署完成！"
    echo "前端服务: http://localhost:3000"
    echo "代理服务: http://localhost:3001"
    echo ""
    echo "Docker 管理命令:"
    echo "  查看状态: docker ps"
    echo "  查看日志: docker logs ollama-frontend"
    echo "  停止容器: docker stop ollama-frontend"
    echo "  启动容器: docker start ollama-frontend"
    echo "  删除容器: docker rm -f ollama-frontend"
}

# 方式4: 使用 Nginx 部署
deploy_with_nginx() {
    echo ""
    echo "🌐 配置 Nginx 部署..."
    
    # 构建项目
    echo "🔨 构建项目..."
    npm run build
    
    # 创建 Nginx 配置
    cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
    
    echo "✅ Nginx 配置已生成: nginx.conf"
    echo ""
    echo "请按以下步骤部署:"
    echo "1. 复制 build 目录内容到 Nginx 静态目录 (通常是 /usr/share/nginx/html)"
    echo "2. 复制 nginx.conf 到 Nginx 配置目录"
    echo "3. 启动代理服务: node simple-proxy.js"
    echo "4. 重启 Nginx: nginx -s reload"
}

# 主菜单
echo ""
echo "请选择部署方式:"
echo "1) 使用 serve (简单快速)"
echo "2) 使用 PM2 (生产环境推荐)"
echo "3) 使用 Docker (容器化部署)"
echo "4) 使用 Nginx (高性能)"
echo "5) 退出"
echo ""
read -p "请输入选项 (1-5): " choice

case $choice in
    1)
        deploy_with_serve
        ;;
    2)
        deploy_with_pm2
        ;;
    3)
        deploy_with_docker
        ;;
    4)
        deploy_with_nginx
        ;;
    5)
        echo "退出部署脚本"
        exit 0
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac