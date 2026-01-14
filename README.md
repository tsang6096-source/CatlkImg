## 介绍

CATLK - 智能图片压缩 - 一个专业的在线图片压缩处理平台，支持无损压缩和格式转换功能，帮助用户快速优化图片文件大小，提升传输和存储效率。

**🌍 多语言支持**：完整的中英文双语界面，自动检测浏览器语言，支持手动切换。

### 核心功能

- 📤 **图片上传**：支持拖拽和点击选择，可批量上传多张图片（单次最多20张）
- 🔄 **格式转换**：支持 PNG、JPG、JPEG、GIF、BMP、WebP 等主流格式互转
- 🗜️ **智能压缩**：可调节压缩质量（1%-100%，默认92%），支持1%精度调节，在保持画质的同时减小文件体积
- 👀 **实时预览**：并排对比原图和处理后的图片效果
- 📊 **数据统计**：显示文件大小变化和压缩率
- 💾 **便捷下载**：支持单个下载或批量下载所有处理完成的图片
- 🔄 **增量处理**：开始处理按钮只处理未处理的图片，避免重复处理
- 🔁 **重新生成**：修改参数后可重新处理所有图片
- 🔒 **隐私保护**：所有图片处理均在浏览器本地完成，不上传到服务器
- 🌐 **国际化**：完整的中英文双语支持，SEO 优化
- 🔍 **SEO 优化**：完整的 meta 标签、结构化数据、sitemap 和 robots.txt

### 使用方法

1. **上传图片**：点击或拖拽图片到上传区域（单次最多20张）
2. **配置参数**：
   - 选择目标格式（或保持原格式）
   - 调节压缩质量滑块（1%-100%，默认92%）
   - 可直接在输入框中输入精确数值
3. **处理图片**：
   - **开始处理**：只处理未处理的图片
   - **重新生成**：按新的设置重新处理所有图片
4. **下载图片**：处理完成后可单个下载或批量下载

### 功能说明

- **智能批量处理**：为保证浏览器处理质量，单次最多支持20张图片
- **灵活的质量控制**：支持1%精度调节，可通过滑块或直接输入数值
- **增量处理**："开始处理"按钮只处理新上传的图片，已处理的图片不会重复处理
- **重新生成**：修改参数后，可使用"重新生成"按钮按新设置重新处理所有图片

### 技术特点

- ✅ 纯前端实现，无需后端服务器
- ✅ 使用 browser-image-compression 库进行高效压缩
- ✅ 基于 Canvas API 实现格式转换
- ✅ 响应式设计，支持桌面和移动设备
- ✅ 科技蓝主题，界面简洁美观
- ✅ 生产环境代码混淆和压缩，保护核心逻辑
- ✅ 版权保护和完整性检查
- ✅ 开发者工具友好提示
- ✅ 完整的国际化支持（i18next）
- ✅ SEO 优化（meta 标签、结构化数据、sitemap）

### 国际化（i18n）

本应用使用 i18next 和 react-i18next 实现完整的国际化支持：

**支持语言**：
- 🇺🇸 English（英语）- 默认语言
- 🇨🇳 中文（简体中文）

**功能特性**：
- 自动检测浏览器语言
- 手动切换语言（右上角地球图标）
- 语言偏好保存在 localStorage
- 所有 UI 文本、提示信息、SEO 内容完全翻译
- URL 使用英文路径（SEO 友好）

**翻译文件位置**：
- 英文：`src/i18n/locales/en.json`
- 中文：`src/i18n/locales/zh.json`

### SEO 优化

本应用实施了全面的 SEO 优化策略：

**1. Meta 标签优化**
- 完整的 title、description、keywords
- Open Graph 标签（社交媒体分享）
- Twitter Card 标签
- 多语言 hreflang 标签

**2. 结构化数据**
- Schema.org WebApplication 标记
- 应用功能和特性描述
- 价格信息（免费）

**3. Sitemap 和 Robots**
- `public/sitemap.xml`：搜索引擎索引地图
- `public/robots.txt`：爬虫访问规则
- 支持多语言 URL

**4. 内容优化**
- 语义化 HTML 标签
- 清晰的标题层级
- 描述性的 alt 文本
- FAQ 部分（常见问题）
- 特性展示区域

**5. 性能优化**
- 代码分割和懒加载
- 图片优化
- 快速加载时间

### 安全防护

本应用采取了多重安全防护措施：

1. **代码保护**
   - 生产环境使用 Terser 进行代码混淆和压缩
   - 变量名混淆，增加代码阅读难度
   - 自动删除调试代码和注释
   - 文件名哈希化，防止直接访问

2. **版权保护**
   - 控制台显示版权声明和使用警告
   - 页面底部显示版权信息
   - 完整的许可证文件（LICENSE.md）
   - 开发者工具检测和友好提示

3. **完整性检查**
   - 运行时环境完整性验证
   - 关键对象篡改检测
   - 异常环境警告

4. **隐私保护**
   - 所有图片处理在浏览器本地完成
   - 不上传任何数据到服务器
   - 不收集用户信息

**注意**：由于Web应用的特性，前端代码本质上是公开的。上述措施可以增加代码复制的难度，但无法完全阻止。如需更强的保护，建议将核心算法移至后端服务。

## 目录结构

```
├── README.md # 说明文档
├── components.json # 组件库配置
├── index.html # 入口文件
├── package.json # 包管理
├── postcss.config.js # postcss 配置
├── public # 静态资源目录
│   ├── favicon.png # 图标
│   └── images # 图片资源
├── src # 源码目录
│   ├── App.tsx # 入口文件
│   ├── components # 组件目录
│   ├── contexts # 上下文目录
│   ├── db # 数据库配置目录
│   ├── hooks # 通用钩子函数目录
│   ├── index.css # 全局样式
│   ├── layout # 布局目录
│   ├── lib # 工具库目录
│   ├── main.tsx # 入口文件
│   ├── routes.tsx # 路由配置
│   ├── pages # 页面目录
│   ├── services  # 数据库交互目录
│   ├── types   # 类型定义目录
├── tsconfig.app.json  # ts 前端配置文件
├── tsconfig.json # ts 配置文件
├── tsconfig.node.json # ts node端配置文件
└── vite.config.ts # vite 配置文件
```

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **UI 组件**：shadcn/ui + Tailwind CSS
- **图片处理**：browser-image-compression
- **路由管理**：React Router
- **状态管理**：React Hooks
- **国际化**：i18next + react-i18next
- **SEO**：react-helmet-async
- **代码质量**：Biome（格式化和检查）

## 本地开发

### 如何在本地编辑代码？

您可以选择 [VSCode](https://code.visualstudio.com/Download) 或者您常用的任何 IDE 编辑器，唯一的要求是安装 Node.js 和 npm.

### 环境要求

```
# Node.js ≥ 20
# npm ≥ 10
例如：
# node -v   # v20.18.3
# npm -v    # 10.8.2
```

具体安装步骤如下：

### 在 Windows 上安装 Node.js

```
# Step 1: 访问Node.js官网：https://nodejs.org/，点击下载后，会根据你的系统自动选择合适的版本（32位或64位）。
# Step 2: 运行安装程序：下载完成后，双击运行安装程序。
# Step 3: 完成安装：按照安装向导完成安装过程。
# Step 4: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 在 macOS 上安装 Node.js

```
# Step 1: 使用Homebrew安装（推荐方法）：打开终端。输入命令brew install node并回车。如果尚未安装Homebrew，需要先安装Homebrew，
可以通过在终端中运行如下命令来安装：
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
或者使用官网安装程序：访问Node.js官网。下载macOS的.pkg安装包。打开下载的.pkg文件，按照提示完成安装。
# Step 2: 验证安装：在命令提示符（cmd）或IDE终端（terminal）中输入 node -v 和 npm -v 来检查 Node.js 和 npm 是否正确安装。
```

### 安装完后按照如下步骤操作：

```
# Step 1: 下载代码包
# Step 2: 解压代码包
# Step 3: 用IDE打开代码包，进入代码目录
# Step 4: IDE终端输入命令行，安装依赖：npm i
# Step 5: IDE终端输入命令行，启动开发服务器：npm run dev -- --host 127.0.0.1
```

### 如何开发后端服务？

配置环境变量，安装相关依赖
如需使用数据库，请使用 supabase 官方版本或自行部署开源版本的 Supabase

### 如何配置应用中的三方 API？

具体三方 API 调用方法，请参考帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。

## 了解更多

您也可以查看帮助文档：[源码导出](https://cloud.baidu.com/doc/MIAODA/s/Xmewgmsq7)，了解更多详细内容。
