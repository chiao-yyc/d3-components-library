# D3 Components CLI

基於 D3.js 的組件庫，遵循 shadcn/ui 理念的 Copy & Paste 透明化組件。

## 🚀 快速開始

### 安裝

```bash
# 全域安裝
npm install -g d3-components-cli

# 或使用 npx
npx d3-components --help
```

### 基本使用

```bash
# 初始化專案
npx d3-components init

# 添加組件
npx d3-components add bar-chart

# 列出所有可用組件
npx d3-components list

# 匯入數據
npx d3-components import --file data.csv
```

## 📋 所有命令

### `init`
初始化 D3 Components 專案

```bash
npx d3-components init

# 指定模板
npx d3-components init --template react

# 指定目錄
npx d3-components init --dir ./my-project
```

### `add <component>`
添加組件到專案中

```bash
# 添加組件
npx d3-components add bar-chart

# 指定變體
npx d3-components add bar-chart --variant simple

# 指定目標目錄
npx d3-components add bar-chart --dir ./components

# 預覽模式（不實際建立檔案）
npx d3-components add bar-chart --dry-run
```

### `update [component]`
更新組件到最新版本

```bash
# 更新特定組件
npx d3-components update bar-chart

# 更新所有已安裝的組件
npx d3-components update

# 更新前備份檔案
npx d3-components update bar-chart --backup

# 預覽更新但不實際執行
npx d3-components update bar-chart --dry-run
```

### `remove <component>`
移除已安裝的組件

```bash
# 移除組件
npx d3-components remove bar-chart

# 強制移除（跳過確認）
npx d3-components remove bar-chart --force

# 移除前備份檔案
npx d3-components remove bar-chart --backup

# 預覽移除但不實際執行
npx d3-components remove bar-chart --dry-run
```

### `config [action] [key] [value]`
管理專案配置

```bash
# 查看所有配置
npx d3-components config

# 獲取特定配置
npx d3-components config get paths.components

# 設置配置
npx d3-components config set paths.components ./src/ui

# 刪除配置
npx d3-components config unset paths.custom

# 以 JSON 格式輸出
npx d3-components config get --json
```

### `list`
列出所有可用組件

```bash
# 列出所有組件
npx d3-components list

# 過濾組件
npx d3-components list --filter chart

# 只顯示已安裝的組件
npx d3-components list --installed

# 顯示詳細資訊
npx d3-components list --verbose
```

### `import`
匯入數據並生成圖表

```bash
# 匯入 CSV 檔案
npx d3-components import data.csv

# 匯入 JSON 檔案
npx d3-components import data.json

# 指定圖表類型
npx d3-components import data.csv --chart bar-chart

# 自動偵測數據格式
npx d3-components import data.csv --auto-detect

# 互動式配置
npx d3-components import data.csv --interactive
```

## ⚙️ 配置檔案

### `d3-components.json`
專案配置檔案

```json
{
  "$schema": "https://raw.githubusercontent.com/yangyachiao/d3-components/main/registry/schema.json",
  "name": "my-project",
  "version": "1.0.0",
  "template": "react",
  "paths": {
    "components": "./src/components/ui",
    "utils": "./src/utils",
    "styles": "./src/styles"
  },
  "components": {
    "bar-chart": {
      "variant": "default",
      "version": "1.0.0",
      "path": "./src/components/ui/bar-chart",
      "installedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 🔧 進階使用

### 組件變體

每個組件都支援多種變體：

```bash
# 完整功能版本
npx d3-components add area-chart

# 簡化版本
npx d3-components add area-chart --variant simple

# 堆疊版本
npx d3-components add area-chart --variant stacked
```

### 備份和恢復

```bash
# 更新前自動備份
npx d3-components update --backup

# 移除前自動備份
npx d3-components remove bar-chart --backup

# 備份檔案位置
# ./.d3-components/backups/[component-name]/[timestamp]/
```

### 批量操作

```bash
# 更新所有組件
npx d3-components update

# 列出已安裝的組件
npx d3-components list --installed

# 查看組件詳細資訊
npx d3-components list --verbose
```

## 📖 更多資源

- [組件文檔](../docs/README.md)
- [API 參考](../docs/API_REFERENCE.md)
- [最佳實踐](../docs/BEST_PRACTICES.md)
- [常見問題](../docs/FAQ.md)

## 🆘 需要幫助？

如果遇到問題，請到 [GitHub Issues](https://github.com/yangyachiao/d3-components/issues) 回報。

## 📄 授權

MIT License