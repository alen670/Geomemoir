<div align="center">
  <h1>🗺️ Geomemoir · 个人数字足迹地图日记</h1>
  <p>
    <strong>记录每日生活足迹、心情与天气，用地图和时间轴还原最温暖的私人记忆。</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet" alt="Leaflet" />
  </p>
</div>

---

## 📖 项目简介

Geomemoir 是一款**以地图为核心的私人旅行记忆管理应用**。它将你的旅行足迹、美食体验、文化见闻等以地理坐标的方式记录下来，提供地图浏览、时间轴回顾、相册展示和个人档案管理等功能。所有数据存储在浏览器本地，保护你的隐私。

## ✨ 核心功能

| 模块 | 功能描述 |
|------|----------|
| 🗺️ **地图** | 基于 Leaflet 的交互式地图，在地图上标记每一个记忆点，支持定位和搜索 |
| ⏱️ **时间轴** | 按时间线纵向浏览所有记忆，支持筛选和快速跳转 |
| 🖼️ **相册** | 以网格画廊形式展示所有记忆的照片，沉浸式浏览 |
| 👤 **个人中心** | 管理个人信息、查看旅行统计、数据备份与恢复 |
| 🌓 **深色模式** | 支持浅色/深色主题切换，自动保存用户偏好 |
| ✨ **AI 增强** | 集成 Gemini API，智能辅助记忆记录与内容生成 |

### 记忆记录维度

每条记忆支持记录以下信息：
- 📍 **地理位置**：经纬度 + 地点名称
- 📅 **日期**：旅行/事件发生的日期
- 🏷️ **分类**：日常琐碎 / 吃喝记录 / 文化体验 / 自然风光 / 酒店住宿 / 交通出行 / 其他
- ⭐ **评分**：1~5 星评价
- 😊 **心情**：Emoji 表情记录当时心情
- 🌤️ **天气**：Emoji 记录当时天气
- 🏷️ **标签**：自定义标签，方便检索
- 🖼️ **图片**：支持多张图片（Base64 / URL）
- 🔒 **隐私**：支持公开/私密两种状态

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| [React 19](https://react.dev) | UI 框架 |
| [TypeScript](https://www.typescriptlang.org) | 类型安全 |
| [Vite 6](https://vitejs.dev) | 构建工具 & 开发服务器 |
| [Tailwind CSS 4](https://tailwindcss.com) | 原子化 CSS 样式 |
| [Leaflet](https://leafletjs.com) | 开源交互式地图 |
| [Motion](https://motion.dev) | React 动画库 |
| [Lucide React](https://lucide.dev) | 图标库 |
| [Gemini API](https://ai.google.dev) | AI 能力增强 |

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18

### 安装与运行

```bash
# 1. 进入项目目录
cd geomemoir

# 2. 安装依赖
npm install

# 3. 配置 Gemini API Key（可选，AI 功能需要）
cp .env.example .env.local
# 编辑 .env.local，填入你的 GEMINI_API_KEY

# 4. 启动开发服务器
npm run dev
```

启动后访问 **http://localhost:3000** 即可使用。

### 其他命令

```bash
npm run build      # 生产构建，输出到 dist/
npm run preview    # 预览生产构建
npm run lint       # TypeScript 类型检查
npm run clean      # 清理构建产物
```

## 📁 项目结构

```
geomemoir/
├── index.html              # 入口 HTML
├── package.json            # 项目配置与依赖
├── vite.config.ts          # Vite 构建配置
├── tsconfig.json           # TypeScript 配置
├── metadata.json           # 应用元信息
├── assets/                 # 静态资源
└── src/
    ├── main.tsx            # React 应用入口
    ├── App.tsx             # 根组件（路由、状态管理）
    ├── types.ts            # TypeScript 类型定义
    ├── data.ts             # 初始数据与分类配置
    ├── index.css           # 全局样式
    └── components/         # 组件目录
        ├── MapContainer.tsx    # 地图容器组件
        ├── TimelineView.tsx    # 时间轴视图
        ├── GalleryView.tsx     # 相册视图
        ├── MemoryForm.tsx      # 记忆编辑表单
        ├── BottomSheet.tsx     # 底部弹出详情面板
        ├── MyProfileView.tsx   # 个人中心视图
        └── StatisticsView.tsx  # 统计视图
```

## 📝 数据存储

所有记忆数据通过 `localStorage` 存储在浏览器本地，键名为 `FOOTPRINT_MARKERS_DB_V2`。用户可以通过个人中心导出/导入 JSON 格式的完整备份。

## 📄 许可证

Apache-2.0
