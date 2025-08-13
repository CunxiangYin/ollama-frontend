# 解决Ollama CORS跨域问题

## 在Ollama服务器上执行以下操作：

### 方法1：设置环境变量（推荐）

```bash
# Linux/Mac
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0:11434"
ollama serve
```

### 方法2：使用systemd服务（Linux）

编辑 `/etc/systemd/system/ollama.service`:

```ini
[Service]
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

然后重启服务：
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### 方法3：Docker方式

```bash
docker run -d \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  -e OLLAMA_ORIGINS="*" \
  --name ollama \
  ollama/ollama
```

## 注意事项

- `OLLAMA_ORIGINS="*"` 允许所有来源访问（开发环境可用）
- 生产环境建议设置具体的域名，如：`OLLAMA_ORIGINS="http://localhost:3000,http://192.168.1.100:3000"`
- 确保防火墙允许11434端口访问