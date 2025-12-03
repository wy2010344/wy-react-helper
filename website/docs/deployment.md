---
title: 部署指南
sidebar_position: 5
---

# 部署指南

本指南将帮助您将 wy-react-helper 文档网站部署到 GitHub Pages。

## 准备工作

在部署前，请确保已完成以下准备：

1. 确保 `docusaurus.config.ts` 中的部署配置正确设置：

```typescript
// docusaurus.config.ts
deployConfig: {
  branch: 'gh-pages', // 部署到 gh-pages 分支
  orgName: 'wy2010344',
  projectName: 'wy-react-helper',
},
url: 'https://wy2010344.github.io',
baseUrl: '/wy-react-helper/',
```

2. 确保您的 GitHub 账户具有该仓库的推送权限。

3. 在本地配置好 Git，并且已登录 GitHub。

## 本地构建测试

在部署前，建议先在本地构建并测试网站：

```bash
# 进入 website 目录
cd website

# 安装依赖
npm install

# 构建网站
npm run build

# 本地预览构建结果
npm run serve
```

打开浏览器访问 http://localhost:3000/wy-react-helper/ 检查网站是否正常。

## 部署到 GitHub Pages

### 方法一：使用脚本部署（推荐）

```bash
# 使用专门的部署脚本
npm run deploy:github
```

该命令会自动：
1. 构建网站
2. 创建一个临时的 Git 仓库
3. 提交构建后的文件
4. 推送到 GitHub 的 gh-pages 分支

### 方法二：使用标准命令部署

```bash
# 使用标准的 Docusaurus 部署命令
GIT_USER=wy2010344 CURRENT_BRANCH=main USE_SSH=false npm run deploy
```

## 自定义部署配置

如果需要自定义部署配置，可以修改 package.json 中的 `deploy:github` 脚本：

```json
"deploy:github": "GIT_USER=wy2010344 CURRENT_BRANCH=main USE_SSH=false docusaurus deploy"
```

参数说明：
- `GIT_USER`: GitHub 用户名
- `CURRENT_BRANCH`: 源代码所在分支
- `USE_SSH`: 是否使用 SSH 连接（true 或 false）

## 部署后验证

部署完成后，可以通过以下步骤验证部署是否成功：

1. 访问 https://wy2010344.github.io/wy-react-helper/
2. 检查页面是否正确加载
3. 测试各个文档链接是否正常工作

## 常见问题排查

### 部署失败

如果部署失败，请检查：

1. GitHub 用户名和仓库名是否正确
2. 是否有足够的权限推送到仓库
3. 网络连接是否正常
4. 构建过程中是否有错误

### 页面加载错误

如果页面加载但显示错误，请检查：

1. `baseUrl` 设置是否与 GitHub 仓库名一致
2. 静态资源路径是否正确
3. 浏览器控制台是否有错误信息

### 404 错误

如果出现 404 错误，请检查：

1. 确保 gh-pages 分支已成功创建
2. GitHub Pages 已启用（在仓库的 Settings -> Pages 中检查）
3. 等待几分钟，GitHub Pages 可能需要时间更新