#!/bin/bash
# setup.sh

echo "🚀 設定 D3 Components 開發環境..."

# 1. 建立目錄結構（如果不存在）
mkdir -p cli/src/{commands,utils,types}
mkdir -p cli/templates
mkdir -p registry/{components,utils,types}
mkdir -p docs examples scripts tests

# 2. 安裝根目錄依賴
echo "📦 安裝根目錄依賴..."
npm install

# 3. 設定 CLI 套件
cd cli
echo "📦 安裝 CLI 依賴..."
npm install

# 4. 建立符號連結（用於本地測試）
npm link

# 5. 回到根目錄
cd ..

# 6. 驗證 Registry 結構
echo "🔍 驗證 Registry 結構..."
npm run registry:validate

echo "✅ 設定完成！"
echo "🔧 開始開發："
echo "  npm run dev     # 啟動開發模式"
echo "  npm test        # 執行測試"
echo "  d3-components --help  # 測試 CLI（已連結）"
echo "  npm run registry:validate  # 驗證 Registry"