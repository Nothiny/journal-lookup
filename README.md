# 论文期刊查询网站

一个简洁美观的静态网站，用于查询论文发表的期刊或会议信息。特别适用于查找从arXiv下载的论文的正式发表位置。

## 功能特点

- 🔍 **模糊搜索**：支持输入论文标题的任意部分进行搜索
- 📚 **多源数据**：使用 Semantic Scholar API 提供准确的论文信息
- 🎨 **简洁美观**：现代化的UI设计，响应式布局
- ⚡ **实时搜索**：输入时自动搜索（防抖优化）
- 📱 **移动友好**：完美适配手机和平板设备

## 使用方法

1. 在搜索框中输入论文标题（支持部分关键词）
2. 点击"搜索"按钮或按回车键
3. 查看搜索结果，包括：
   - 论文标题
   - 发表期刊/会议
   - 发表年份
   - 作者信息
   - 引用数
   - arXiv ID（如有）
   - DOI（如有）

## 部署到 GitHub Pages

### 方法一：直接部署

1. 将项目文件上传到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支（main/master）作为源
4. 访问 `https://你的用户名.github.io/journal-lookup/`

### 方法二：使用 GitHub Actions（推荐）

1. 创建 `.github/workflows/deploy.yml` 文件（可选，GitHub Pages会自动部署静态文件）

## 技术栈

- **HTML5**：页面结构
- **CSS3**：现代化样式设计
- **JavaScript (ES6+)**：搜索功能和API集成
- **Semantic Scholar API**：论文数据源

## API说明

本项目使用 [Semantic Scholar API](https://www.semanticscholar.org/product/api) 作为数据源。该API：
- 免费使用
- 无需API密钥
- 提供丰富的论文元数据
- 支持模糊搜索

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

## 注意事项

- 搜索功能依赖 Semantic Scholar API，需要网络连接
- API有速率限制，请合理使用
- 某些论文可能没有期刊信息（如仅发表在arXiv）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

