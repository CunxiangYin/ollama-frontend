#!/bin/bash

echo "📦 推送 Ollama Frontend 到 GitHub"
echo "=================================="
echo ""
echo "请先在 GitHub 上创建一个新的仓库:"
echo "1. 访问 https://github.com/new"
echo "2. 仓库名称建议: ollama-frontend"
echo "3. 设置为 Public 或 Private"
echo "4. 不要初始化 README、.gitignore 或 License"
echo ""
echo "创建完成后，请输入您的 GitHub 用户名和仓库名:"
echo ""

read -p "GitHub 用户名: " username
read -p "仓库名称 (默认: ollama-frontend): " repo_name

# 如果没有输入仓库名，使用默认值
if [ -z "$repo_name" ]; then
    repo_name="ollama-frontend"
fi

# 构建远程仓库URL
REMOTE_URL="https://github.com/$username/$repo_name.git"

echo ""
echo "将添加远程仓库: $REMOTE_URL"
echo ""

# 检查是否已有远程仓库
if git remote | grep -q origin; then
    echo "⚠️  发现已存在的远程仓库配置:"
    git remote -v
    echo ""
    read -p "是否要替换现有的远程仓库? (y/n): " replace
    if [ "$replace" = "y" ]; then
        git remote remove origin
        git remote add origin $REMOTE_URL
        echo "✅ 远程仓库已更新"
    else
        echo "保持现有远程仓库配置"
    fi
else
    git remote add origin $REMOTE_URL
    echo "✅ 远程仓库已添加"
fi

echo ""
echo "推送代码到 GitHub..."
echo ""

# 推送到主分支
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 成功推送到 GitHub!"
    echo ""
    echo "仓库地址: https://github.com/$username/$repo_name"
    echo ""
    echo "您可以访问以下链接查看:"
    echo "- 仓库主页: https://github.com/$username/$repo_name"
    echo "- README: https://github.com/$username/$repo_name#readme"
    echo "- 代码: https://github.com/$username/$repo_name/tree/main/src"
    echo ""
    echo "克隆命令:"
    echo "git clone https://github.com/$username/$repo_name.git"
else
    echo ""
    echo "❌ 推送失败!"
    echo ""
    echo "可能的原因:"
    echo "1. 仓库不存在 - 请先在 GitHub 创建仓库"
    echo "2. 认证失败 - 请配置 GitHub 访问令牌"
    echo ""
    echo "配置 GitHub 访问令牌:"
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 生成新的个人访问令牌 (PAT)"
    echo "3. 使用令牌作为密码进行推送"
    echo ""
    echo "或者使用 SSH:"
    echo "git remote set-url origin git@github.com:$username/$repo_name.git"
fi