# Ollama Frontend

一个类似 Claude Desktop 的现代化前端界面，用于访问局域网内的 Ollama 服务。

![Ollama Frontend](https://img.shields.io/badge/Ollama-Frontend-da784d?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ 特性

- 🎨 **Claude 风格界面** - 简洁优雅的用户界面设计
- 💬 **实时对话** - 支持流式响应，实时显示 AI 回复
- 🌓 **深色模式** - 自动适应系统主题
- 📱 **响应式设计** - 支持桌面和移动设备
- 🔧 **灵活配置** - 可配置 Ollama 服务地址和模型参数
- 🌐 **局域网访问** - 支持局域网内多设备访问
- 💾 **本地存储** - 对话历史自动保存到本地

## 🚀 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn
- 局域网内运行的 Ollama 服务

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/ollama-frontend.git
cd ollama-frontend

# 安装依赖
npm install

# 构建项目
npm run build
```

### 运行

#### 1. 仅本地访问

```bash
./start-production.sh
```

访问: http://localhost:3000

#### 2. 局域网访问（推荐）

```bash
./start-lan.sh
```

- 本地访问: http://localhost:3000
- 局域网访问: http://你的IP:3000

#### 3. 使用部署脚本

```bash
./deploy.sh
```

选择部署方式：
- Serve - 简单快速
- PM2 - 生产环境推荐
- Docker - 容器化部署
- Nginx - 高性能部署

## 🔧 配置

### Ollama 服务配置

默认连接到 `192.168.1.86:11434`，可在设置中修改：

1. 点击侧边栏底部的"Settings"
2. 修改 Ollama 服务地址和端口
3. 选择模型和调整参数

### 代理服务器配置

编辑 `simple-proxy.js` 文件：

```javascript
const OLLAMA_URL = 'http://192.168.1.86:11434'; // 修改为你的 Ollama 地址
```

## 📦 项目结构

```
ollama-frontend/
├── public/              # 静态资源
├── src/                 # 源代码
│   ├── components/      # React 组件
│   ├── services/        # API 服务
│   ├── store/          # 状态管理
│   └── types/          # TypeScript 类型定义
├── build/              # 构建输出
├── simple-proxy.js     # CORS 代理服务器
├── start-production.sh # 生产环境启动脚本
├── start-lan.sh        # 局域网访问启动脚本
└── deploy.sh           # 部署脚本
```

## 🛠️ 开发

```bash
# 开发模式
npm start

# 运行测试
npm test

# 类型检查
npx tsc --noEmit

# 代码格式化
npm run lint
```

## 🎯 功能特性

### 核心功能
- **多会话管理** - 创建、切换、删除和重命名对话
- **流式响应** - 实时显示 AI 生成的内容
- **Markdown 渲染** - 支持富文本格式显示
- **代码高亮** - 自动识别并高亮代码块
- **消息编辑** - 编辑已发送的消息
- **重新生成** - 重新生成 AI 响应

### 模型参数配置
- **Temperature（温度）** - 控制输出的随机性（0-2）
- **Top P** - 核采样参数（0-1）
- **Top K** - 限制选择的词汇数量（1-100）
- **Repeat Penalty** - 避免重复内容（0-2）
- **Max Tokens** - 最大生成长度
- **System Prompt** - 自定义系统提示词

## 🤝 贡献

欢迎提交 Pull Request 或创建 Issue！

## 📄 许可证

MIT License

## 🙏 致谢

- [Ollama](https://ollama.ai/) - 本地大语言模型运行框架
- [Claude](https://claude.ai/) - UI 设计灵感来源
- [React](https://reactjs.org/) - 前端框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

## 📮 联系

如有问题或建议，请创建 [Issue](https://github.com/yourusername/ollama-frontend/issues)

---

Made with ❤️ for the Ollama community