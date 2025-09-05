# D3 Components ESLint 分層策略

## 核心理念

基於 D3 Components 作為**圖表套件系統**的定位，採用**分層 ESLint 策略**確保核心品質同時不阻礙開發效率。

## 三層架構策略

### 1. Registry Layer (核心組件庫) - 🔴 嚴格模式

**定位：** 對外發布的核心套件，品質要求最高

```typescript
// 配置檔案: /registry/eslint.config.js
export default [{
  files: ['**/*.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',    // 禁止 any
    '@typescript-eslint/no-unused-vars': 'error',     // 禁止未使用變數
    '@typescript-eslint/explicit-function-return-type': 'warn', // 建議明確回傳型別
    'prefer-const': 'error',                          // 強制使用 const
    // ... 更嚴格的規則
  }
}]
```

**檢查重點：**
- ✅ 嚴格 TypeScript 規則，禁用 `any` 類型
- ✅ 強制型別註解和 JSDoc 文檔  
- ✅ 性能和記憶體使用最佳化檢查
- ✅ 完整的錯誤處理和邊界情況
- ✅ 發布前必須通過所有檢查

### 2. CLI Layer (開發工具) - 🟡 中等模式

**定位：** 開發者工具，穩定但允許適度彈性

```typescript
// 配置檔案: /eslint.config.js (已存在)
export default [{
  files: ['src/**/*.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',     // 警告但不阻止
    '@typescript-eslint/no-unused-vars': 'error',     // 仍然禁止未使用變數
    'prefer-const': 'error',                          // 基本最佳實踐
    // ... 平衡的規則配置
  }
}]
```

**檢查重點：**
- ⚡ 基本 TypeScript 規則，允許部分 `any` 使用 (warn 級別)
- ⚡ 重點關注邏輯正確性和基本型別安全
- ⚡ 不阻礙快速迭代和原型開發
- ⚡ 穩定性優於嚴格性

### 3. Demo Layer (展示環境) - 🟢 寬鬆模式

**定位：** 實驗和展示環境，重功能展示輕程式碼約束

```typescript
// 配置檔案: /demo/eslint.config.js (需調整)
export default [{
  files: ['src/**/*.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',      // 允許 any 使用
    '@typescript-eslint/no-unused-vars': 'warn',      // 警告但不錯誤
    'prefer-const': 'warn',                           // 建議但不強制
    
    // 保留重要的架構合規性檢查
    'demo-compliance/require-demo-page-template': 'error',
    'demo-compliance/require-standard-grid-layout': 'warn',
  }
}]
```

**檢查重點：**
- 🔄 寬鬆型別檢查，允許實驗性程式碼
- 🔄 重點檢查**架構合規性**（DemoPageTemplate 使用）
- 🔄 不因型別問題阻止開發流程
- 🔄 快速迭代優先，品質漸進提升

## 實作策略

### 配置檔案結構
```
d3-components/
├── eslint.config.js              # CLI 中等模式 (已存在)
├── registry/
│   └── eslint.config.js         # Registry 嚴格模式 (新建)
└── demo/
    └── eslint.config.js         # Demo 寬鬆模式 (調整現有)
```

### Pre-commit Hook 策略

```bash
# .husky/pre-commit
#!/bin/sh

# 檢查異動檔案類型
if git diff --cached --name-only | grep -q "^registry/"; then
  echo "🔴 Registry 異動偵測，執行嚴格檢查..."
  cd registry && npm run lint:strict
  if [ $? -ne 0 ]; then
    echo "❌ Registry 程式碼必須通過嚴格檢查"
    exit 1
  fi
fi

if git diff --cached --name-only | grep -q "^demo/"; then
  echo "🟢 Demo 異動偵測，執行架構合規性檢查..."
  cd demo && npm run lint:compliance-only
fi

if git diff --cached --name-only | grep -q "^cli/"; then
  echo "🟡 CLI 異動偵測，執行基本檢查..."
  cd cli && npm run lint
fi
```

### 漸進式品質提升路徑

#### 第一階段：基礎設定 (立即執行)
1. 為 Registry 建立嚴格 ESLint 配置
2. 調整 Demo ESLint 為寬鬆模式
3. 重新設計 pre-commit hooks

#### 第二階段：Registry 品質強化 (未來 2-4 週)
1. Registry 所有組件通過嚴格檢查
2. 建立自動化品質監控
3. 完善型別定義和文檔

#### 第三階段：整體系統優化 (未來 1-2 月)
1. Demo 層漸進提升程式碼品質
2. CLI 工具穩定性增強
3. 建立完整的 CI/CD 品質流程

## 工具和指令

### Registry 專用指令
```json
{
  "scripts": {
    "lint:strict": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit --strict"
  }
}
```

### Demo 專用指令  
```json
{
  "scripts": {
    "lint:flexible": "eslint . --max-warnings 50",
    "lint:compliance-only": "eslint . --rule '{\"@typescript-eslint/no-explicit-any\": \"off\"}'",
    "lint:architecture": "eslint . --rule '{\"demo-compliance/*\": \"error\"}'"
  }
}
```

### CLI 專用指令
```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 10",
    "lint:fix": "eslint . --fix"
  }
}
```

## 效益評估

### 品質保證
- **Registry**: 100% 型別安全，零 `any` 使用
- **CLI**: 95% 型別覆蓋，控制在 10 個警告內  
- **Demo**: 重點架構合規性，允許實驗性程式碼

### 開發效率
- **不阻礙快速原型開發** (Demo 層寬鬆)
- **確保核心品質** (Registry 層嚴格)
- **平衡工具穩定性** (CLI 層適中)

### 維護成本
- **分層管理降低複雜度**
- **漸進式品質提升**
- **清晰的責任邊界**

---

**最後更新：** 2025-09-05  
**版本：** v1.0  
**作者：** D3 Components Team