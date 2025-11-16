# GitHub Pages 部署指南

## 快速部署步骤

### 方法一：使用 GitHub 网页界面

1. **创建新仓库**
   - 登录 GitHub
   - 点击右上角 "+" → "New repository"
   - 输入仓库名称（如 `journal-lookup`）
   - 选择 Public（GitHub Pages 免费版需要公开仓库）
   - 点击 "Create repository"

2. **上传文件**
   - 在仓库页面点击 "uploading an existing file"
   - 将以下文件拖拽上传：
     - `index.html`
     - `styles.css`
     - `script.js`
     - `README.md`
   - 点击 "Commit changes"

3. **启用 GitHub Pages**
   - 进入仓库 Settings
   - 左侧菜单找到 "Pages"
   - Source 选择 "Deploy from a branch"
   - Branch 选择 `main` 或 `master`，文件夹选择 `/ (root)`
   - 点击 Save

4. **访问网站**
   - 等待几分钟后，访问：`https://你的用户名.github.io/journal-lookup/`

### 方法二：使用 Git 命令行

```bash
# 1. 初始化 Git 仓库
git init

# 2. 添加所有文件
git add .

# 3. 提交
git commit -m "Initial commit: Paper Journal Finder"

# 4. 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/仓库名.git

# 5. 推送到 GitHub
git branch -M main
git push -u origin main
```

然后按照方法一的第3步启用 GitHub Pages。

### 方法三：使用 GitHub Actions（已配置）

如果你使用 GitHub Actions 工作流（`.github/workflows/deploy.yml` 已包含）：

1. 按照方法二推送代码到 GitHub
2. 在仓库 Settings → Pages 中：
   - Source 选择 "GitHub Actions"
3. 工作流会自动部署

## 自定义域名（可选）

1. 在仓库根目录创建 `CNAME` 文件
2. 写入你的域名，如：`paper.example.com`
3. 在域名 DNS 设置中添加 CNAME 记录指向 `你的用户名.github.io`

## 故障排除

- **页面显示 404**：等待 5-10 分钟，GitHub Pages 需要时间构建
- **样式不显示**：检查文件路径是否正确，确保所有文件都在根目录
- **搜索不工作**：检查浏览器控制台，可能是 CORS 问题或 API 限制

## 更新网站

每次推送新代码到 GitHub，网站会自动更新（可能需要几分钟）。

```bash
git add .
git commit -m "更新描述"
git push
```

