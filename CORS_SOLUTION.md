# 解决Ollama CORS跨域问题

您遇到的"Connection failed"错误是因为浏览器的CORS（跨域资源共享）安全策略阻止了前端应用访问Ollama服务。

## 解决方案

### 在Ollama服务器上（192.168.1.86）执行以下步骤：

#### 方法1：临时运行（测试用）

停止当前的Ollama服务，然后使用环境变量重新启动：

```bash
# 先停止当前服务
killall ollama

# 设置CORS允许所有来源，然后启动
OLLAMA_ORIGINS="*" OLLAMA_HOST="0.0.0.0:11434" ollama serve
```

#### 方法2：永久配置（推荐）

如果Ollama作为系统服务运行：

1. 编辑Ollama服务配置文件：
```bash
sudo nano /etc/systemd/system/ollama.service
```

2. 在 `[Service]` 部分添加：
```ini
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

3. 重新加载并重启服务：
```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

#### 方法3：使用Docker运行

如果使用Docker：

```bash
docker run -d \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  -e OLLAMA_ORIGINS="*" \
  -e OLLAMA_HOST="0.0.0.0:11434" \
  --name ollama \
  ollama/ollama
```

## 验证配置

配置完成后，可以通过以下命令验证CORS是否正确设置：

```bash
curl -I http://192.168.1.86:11434/api/tags
```

应该能看到类似以下的响应头：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

## 安全注意事项

- `OLLAMA_ORIGINS="*"` 允许所有来源访问，仅建议在开发环境使用
- 生产环境建议设置具体的域名：
  ```bash
  OLLAMA_ORIGINS="http://localhost:3000,http://192.168.1.100:3000"
  ```

## 完成后

1. 刷新浏览器页面（http://localhost:3000）
2. 打开设置，点击"Test Connection"
3. 应该显示"Connection successful!"
4. 开始使用！

如果仍有问题，请检查：
- 防火墙是否允许11434端口
- Ollama服务是否正在运行：`systemctl status ollama`
- 网络连接是否正常：`ping 192.168.1.86`