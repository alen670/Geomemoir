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
    <img src="https://img.shields.io/badge/Supabase-2.108-3ECF8E?logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor" alt="Capacitor 8" />
  </p>
</div>

---

## 📖 项目简介

Geomemoir 是一款**以地图为核心的私人旅行记忆管理应用**，支持 Web、Android、iOS 三端运行。它将你的旅行足迹、美食体验、文化见闻等以地理坐标记录，提供地图浏览、时间轴回顾、相册展示和云端同步等功能。

- 🔐 **真实用户认证**：邮箱注册/登录 + 手机 OTP 验证码登录
- ☁️ **云端同步**：基于 Supabase，登录后数据自动同步，换设备不丢失
- 📱 **跨平台**：一套 React 代码，通过 Capacitor 打包为 Android/iOS 原生应用

## ✨ 核心功能

| 模块 | 功能描述 |
|------|----------|
| 🗺️ **地图** | 基于 Leaflet 的交互式地图，标记记忆点，支持定位和搜索 |
| ⏱️ **时间轴** | 按时间线纵向浏览所有记忆，支持筛选和快速跳转 |
| 🖼️ **相册** | 网格画廊展示所有记忆照片，沉浸式浏览 |
| 👤 **个人中心** | 编辑头像昵称、数据备份恢复、隐私设置 |
| 🌓 **深色模式** | 浅色/深色主题切换，自动保存偏好 |
| ☁️ **云端同步** | Supabase 后端，注册登录后多设备同步 |

### 记忆记录维度

每条记忆支持记录：
- 📍 地理位置（经纬度 + 地名）· 📅 日期 · 🏷️ 分类 · ⭐ 评分
- 😊 心情 Emoji · 🌤️ 天气 Emoji · 🏷️ 自定义标签
- 🖼️ 多张图片（Base64 / URL）· 🔒 公开/私密切换

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| [React 19](https://react.dev) | UI 框架 |
| [TypeScript](https://www.typescriptlang.org) | 类型安全 |
| [Vite 6](https://vitejs.dev) | 构建工具 & 开发服务器 |
| [Tailwind CSS 4](https://tailwindcss.com) | 原子化 CSS |
| [Leaflet](https://leafletjs.com) | 交互式地图 |
| [Motion](https://motion.dev) | React 动画库 |
| [Lucide React](https://lucide.dev) | 图标库 |
| [Supabase](https://supabase.com) | 后端服务（认证 + 数据库 + 存储） |
| [Capacitor 8](https://capacitorjs.com) | 跨平台移动端打包 |
| [GitHub Actions](https://github.com/features/actions) | 自动构建 APK |

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/alen670/Traveling-record.git
cd Traveling-record

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 Supabase 配置：
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. 启动开发服务器
npm run dev
```

启动后访问 **http://localhost:3000**

### 常用命令

```bash
npm run dev           # 开发服务器
npm run build         # 生产构建
npm run lint          # TypeScript 类型检查
npm run mobile:sync   # 构建 Web + 同步到移动端
npm run mobile:android # 构建 + 打开 Android Studio
npm run mobile:ios    # 构建 + 打开 Xcode
```

## 📁 项目结构

```
geomemoir/
├── index.html              # 入口 HTML
├── package.json            # 项目配置与依赖
├── vite.config.ts          # Vite 构建配置
├── tsconfig.json           # TypeScript 配置
├── capacitor.config.ts     # Capacitor 移动端配置
├── assets/                 # 静态资源
├── scripts/                # 构建脚本
├── .github/workflows/      # CI/CD（自动打包 APK）
├── android/                # Android 原生项目
├── ios/                    # iOS 原生项目
└── src/
    ├── main.tsx            # React 入口
    ├── App.tsx             # 根组件
    ├── types.ts            # 类型定义
    ├── data.ts             # 分类与初始数据
    ├── index.css           # 全局样式
    ├── vite-env.d.ts       # 环境变量类型
    ├── lib/                # 工具库
    │   ├── supabase.ts     # Supabase 客户端
    │   ├── api.ts          # 数据访问层
    │   └── db.sql          # 数据库迁移脚本
    └── components/         # 组件
        ├── MapContainer.tsx    # 地图
        ├── TimelineView.tsx    # 时间轴
        ├── GalleryView.tsx     # 相册
        ├── MemoryForm.tsx      # 记忆编辑
        ├── BottomSheet.tsx     # 详情面板
        ├── MyProfileView.tsx   # 个人中心
        ├── LoginModal.tsx      # 登录/注册
        ├── EditProfileModal.tsx # 编辑资料
        ├── UserProfileCard.tsx  # 用户卡片
        └── useUserStore.ts     # 用户状态管理
```

## ☁️ 后端配置

### Supabase 建表

在 Supabase SQL Editor 中执行 `src/lib/db.sql`，创建以下表：

- `memory_points` — 记忆点（含 RLS 用户隔离）
- `user_settings` — 用户设置（含自动创建触发器）

### 存储桶

需手动创建 `avatars` 存储桶（公开读取，认证用户可上传）。

### 认证设置

在 Supabase Authentication → Providers 中确保 Email 已启用（建议关闭邮箱确认）。

## 📱 打包移动端

```bash
# 1. 构建 Web 并同步
npm run mobile:sync

# 2. Android
npm run mobile:android   # 打开 Android Studio → Build → Build APK

# 3. iOS（需 Mac + Xcode）
npm run mobile:ios       # 打开 Xcode → Product → Archive
```

或推送代码到 GitHub，GitHub Actions 自动构建 APK。

## 📝 数据存储

- **未登录**：数据存储在浏览器 localStorage（按设备隔离）
- **已登录**：数据通过 Supabase REST API 存储在云端，按用户隔离（RLS），支持多设备同步
- 可在个人中心导出/导入 JSON 格式完整备份

## 📄 许可证

Apache-2.0
