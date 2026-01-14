# 部署说明

## 部署前准备

### 1. 更新网站 URL

在以下文件中将 `https://yourwebsite.com` 替换为您的实际域名：

- `public/sitemap.xml`
- `public/robots.txt`
- `src/components/SEO.tsx`

### 2. 配置环境变量（可选）

如果需要自定义配置，可以创建 `.env` 文件：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件中的配置项。

### 3. 构建生产版本

```bash
npm run build
```

构建完成后，生产文件将在 `dist` 目录中。

## 部署到不同平台

### Vercel

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录并部署：
```bash
vercel
```

3. 按照提示完成部署

### Netlify

1. 安装 Netlify CLI：
```bash
npm i -g netlify-cli
```

2. 登录并部署：
```bash
netlify deploy --prod
```

3. 选择 `dist` 目录作为发布目录

### GitHub Pages

1. 安装 gh-pages：
```bash
npm i -D gh-pages
```

2. 在 `package.json` 中添加：
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. 部署：
```bash
npm run deploy
```

### 静态服务器

将 `dist` 目录的内容上传到任何静态文件服务器即可。

## 部署后检查

### 1. 功能测试
- ✅ 上传图片
- ✅ 压缩和转换
- ✅ 下载功能
- ✅ 语言切换
- ✅ 响应式布局

### 2. SEO 检查
- ✅ 访问 `https://yourwebsite.com/sitemap.xml`
- ✅ 访问 `https://yourwebsite.com/robots.txt`
- ✅ 检查页面 meta 标签
- ✅ 使用 Google Search Console 提交 sitemap

### 3. 性能测试
- ✅ 使用 Google PageSpeed Insights 测试
- ✅ 使用 Lighthouse 测试
- ✅ 检查加载速度

### 4. 浏览器兼容性
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## SEO 优化建议

### 1. 提交到搜索引擎

**Google Search Console**
1. 访问 https://search.google.com/search-console
2. 添加您的网站
3. 提交 sitemap：`https://yourwebsite.com/sitemap.xml`

**Bing Webmaster Tools**
1. 访问 https://www.bing.com/webmasters
2. 添加您的网站
3. 提交 sitemap

### 2. 社交媒体优化

确保 Open Graph 标签正确设置，以便在社交媒体分享时显示正确的信息。

### 3. 性能优化

- 启用 CDN
- 启用 Gzip/Brotli 压缩
- 配置缓存策略
- 使用 HTTP/2

### 4. 监控和分析

可选添加：
- Google Analytics
- Google Tag Manager
- 其他分析工具

## 故障排除

### 问题：语言切换不工作

**解决方案**：
- 检查浏览器 localStorage 是否启用
- 清除浏览器缓存
- 检查 i18n 配置

### 问题：图片处理失败

**解决方案**：
- 检查浏览器是否支持 Canvas API
- 检查图片格式是否支持
- 检查图片大小是否过大

### 问题：SEO 标签不显示

**解决方案**：
- 检查 react-helmet-async 是否正确配置
- 检查 SEO 组件是否正确导入
- 使用浏览器开发者工具查看 HTML 源码

## 维护建议

### 定期更新

1. 更新依赖包：
```bash
npm update
```

2. 检查安全漏洞：
```bash
npm audit
```

3. 修复安全问题：
```bash
npm audit fix
```

### 监控

- 定期检查网站可用性
- 监控错误日志
- 分析用户反馈

### 备份

- 定期备份源代码
- 备份配置文件
- 记录重要变更

## 联系支持

如有问题，请查看：
- README.md
- SECURITY.md
- GitHub Issues（如果开源）
