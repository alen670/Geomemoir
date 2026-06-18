#!/bin/bash
# ============================================
#  GeoMemoir APK 一键打包脚本
#  前提：已安装 Android Studio + Java 17+
# ============================================
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📦 GeoMemoir APK 打包开始..."
echo ""

# 1. 构建 Web 资源
echo "🔨 Step 1/3: 构建 Web 应用..."
npm run build

# 2. 同步到 Android 项目
echo "📲 Step 2/3: 同步到 Android 原生项目..."
npx cap sync android

# 3. 构建 APK
echo "🤖 Step 3/3: 编译 Android APK..."
cd android
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home 2>/dev/null)}"

if [ ! -d "$ANDROID_HOME" ]; then
  echo "⚠️  未找到 Android SDK。请安装 Android Studio："
  echo "   https://developer.android.com/studio"
  echo ""
  echo "   安装后在 Android Studio 中打开此目录："
  echo "   $PROJECT_DIR/android"
  echo "   然后点击 Build → Build Bundle(s) / APK(s) → Build APK(s)"
  exit 1
fi

./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  cp "$APK_PATH" "$PROJECT_DIR/GeoMemoir-debug.apk"
  echo ""
  echo "✅ 打包完成！"
  echo "📱 APK 文件: $PROJECT_DIR/GeoMemoir-debug.apk"
  echo "📏 文件大小: $(du -h "$PROJECT_DIR/GeoMemoir-debug.apk" | cut -f1)"
  echo ""
  echo "将 APK 传输到手机安装即可"
else
  echo "❌ 构建失败，请检查错误信息"
  exit 1
fi
