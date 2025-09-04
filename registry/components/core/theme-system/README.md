# D3 Components Theme System

企業級主題管理系統，提供完整的設計令牌管理、主題切換、和無障礙支援。

## ✨ 核心特性

- **框架無關設計**：核心邏輯純 TypeScript，可適配多框架
- **企業級功能**：主題繼承、變體管理、CSS 變數生成
- **React 整合**：完整的 Context API 和 Hooks 支援
- **圖表特化**：針對 D3 圖表優化的顏色調色盤和主題配置
- **無障礙支援**：內建色彩對比度檢查和無障礙優化
- **高效能**：主題快取、事件系統、記憶體優化

## 🚀 快速開始

### 基本使用

```tsx
import React from 'react';
import { ThemeProvider, useTheme, defaultTheme, darkTheme } from '@/registry/components/core/theme-system';
import { BarChart } from '@/registry/components/basic/bar-chart';

// 1. 使用 ThemeProvider 包裹應用
function App() {
  return (
    <ThemeProvider 
      initialTheme="default"
      autoInjectCSS={true}
      onThemeChange={(event) => console.log('Theme changed:', event)}
    >
      <Dashboard />
    </ThemeProvider>
  );
}

// 2. 在組件中使用主題
function Dashboard() {
  const { 
    currentTheme, 
    switchTheme, 
    getChartColors, 
    getChartTheme 
  } = useTheme();

  const chartData = [
    { x: 'A', y: 10 },
    { x: 'B', y: 20 },
    { x: 'C', y: 15 }
  ];

  const chartTheme = getChartTheme();
  const chartColors = getChartColors();

  return (
    <div style={{ backgroundColor: chartTheme.background }}>
      <h1 style={{ color: chartTheme.text }}>儀表板</h1>
      
      {/* 主題切換器 */}
      <select onChange={(e) => switchTheme(e.target.value)}>
        <option value="default">預設主題</option>
        <option value="dark">深色主題</option>
        <option value="corporate">企業主題</option>
        <option value="minimal">極簡主題</option>
      </select>

      {/* 使用主題顏色的圖表 */}
      <BarChart
        data={chartData}
        colors={chartColors}
        width={600}
        height={400}
      />
    </div>
  );
}
```

### 進階使用

```tsx
import { 
  createChartTheme, 
  createCustomPalette, 
  generateColorVariants,
  registerPresetThemes 
} from '@/registry/components/core/theme-system';

// 創建自訂圖表主題
const customChartTheme = createChartTheme({
  name: 'financial-theme',
  displayName: '金融主題',
  baseTheme: 'light',
  colorScheme: 'custom',
  customColors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
  chartBackground: '#fafbfc',
  gridColor: '#e1e5e9',
  tooltipStyle: {
    background: '#ffffff',
    text: '#333333',
    border: '#cccccc'
  }
});

// 創建自訂調色盤
const brandPalette = createCustomPalette({
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  baseTheme: 'light',
  generateVariants: true
});

// 使用自訂主題
function AdvancedThemeDemo() {
  const { registerTheme, switchTheme } = useTheme();

  React.useEffect(() => {
    // 註冊自訂主題
    registerTheme(customChartTheme);
    
    // 切換到自訂主題
    switchTheme('financial-theme');
  }, []);

  return <div>進階主題示例</div>;
}
```

## 📚 API 參考

### ThemeProvider Props

```typescript
interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;          // 初始主題名稱
  initialVariant?: string;        // 初始變體名稱
  autoInjectCSS?: boolean;        // 自動注入 CSS 變數
  cssPrefix?: string;             // CSS 變數前綴
  onThemeChange?: (event: ThemeChangeEvent) => void;
}
```

### useTheme Hook

```typescript
interface ThemeContextValue {
  // 主題管理
  currentTheme: ThemeCore | null;
  themeName: string | null;
  switchTheme: (themeName: string) => void;
  
  // 變體管理
  currentVariant: string | null;
  switchVariant: (variantName: string | null) => void;
  availableVariants: string[];
  
  // 設計令牌訪問
  tokens: DesignTokens | null;
  getColor: (path: string) => string;
  getSpacing: (key: string) => string;
  getBorderRadius: (size: string) => string;
  getShadow: (level: string) => string;
  
  // 圖表專用
  getChartColors: () => string[];
  getChartTheme: () => ChartTheme;
  
  // 主題管理
  availableThemes: string[];
  registerTheme: (theme: ThemeCore) => void;
  createCustomTheme: (name: string, baseTheme: string, overrides: Partial<DesignTokens>) => void;
}
```

### 主題工具函數

```typescript
// 圖表主題創建
const chartTheme = createChartTheme({
  name: 'my-chart-theme',
  displayName: '我的圖表主題',
  baseTheme: 'light',
  colorScheme: 'category',
  customColors: ['#ff6b6b', '#4ecdc4', '#45b7d1']
});

// 顏色變體生成
const colorVariants = generateColorVariants('#3b82f6');
// 結果: { light: '#93c5fd', main: '#3b82f6', dark: '#1d4ed8' }

// 和諧色生成
const harmoniousColors = generateHarmoniousColors('#3b82f6', 5);

// 無障礙文字顏色
const textColor = getAccessibleTextColor('#3b82f6'); // 返回 '#ffffff' 或 '#000000'
```

## 🎨 預設主題

系統提供四種預設主題：

### 1. Default Theme (預設主題)
- 現代化設計
- 高對比度
- 適合大部分應用場景

### 2. Dark Theme (深色主題)
- 深色背景
- 護眼設計
- 適合低光環境

### 3. Corporate Theme (企業主題)
- 專業商務風格
- 保守色彩搭配
- 適合企業應用

### 4. Minimal Theme (極簡主題)
- 最少視覺元素
- 專注內容
- 適合數據展示

## 🔧 進階功能

### 主題變體

```typescript
// 為主題添加變體
defaultTheme.addVariant({
  name: 'high-contrast',
  overrides: {
    colors: {
      text: { primary: '#000000', secondary: '#333333' },
      divider: '#000000'
    }
  }
});

// 切換變體
switchVariant('high-contrast');
```

### 主題事件

```typescript
import { useThemeChange } from '@/registry/components/core/theme-system';

function ThemeEventDemo() {
  useThemeChange((event) => {
    if (event.type === 'theme-change') {
      console.log(`主題從 ${event.oldTheme} 切換到 ${event.newTheme}`);
    }
  });

  return <div>主題事件示例</div>;
}
```

### 響應式主題

```typescript
const responsiveTheme = createResponsiveTheme(defaultTheme, {
  'md': {
    spacing: { md: '1.5rem', lg: '2rem' }
  },
  'lg': {
    typography: { fontSize: { base: '1.125rem' } }
  }
});
```

### 主題持久化

```typescript
import { saveThemePreference, loadThemePreference } from '@/registry/components/core/theme-system';

// 保存主題偏好
saveThemePreference('dark', 'high-contrast');

// 載入主題偏好
const { theme, variant } = loadThemePreference();
```

## 🎯 最佳實踐

### 1. 主題命名規範

```typescript
// ✅ 良好的命名
'corporate-blue'
'dashboard-dark'
'chart-minimal'

// ❌ 避免的命名
'theme1'
'myTheme'
'blue'
```

### 2. 顏色使用

```typescript
// ✅ 使用語義化顏色
const theme = useTheme();
<div style={{ color: theme.getColor('text.primary') }}>

// ❌ 避免硬編碼顏色
<div style={{ color: '#333333' }}>
```

### 3. 效能優化

```typescript
// ✅ 快取主題對象
const chartTheme = useMemo(() => getChartTheme(), [currentTheme]);

// ✅ 批量更新
const cssVariables = useMemo(() => 
  currentTheme?.generateCSSVariables(), [currentTheme]
);
```

### 4. 無障礙考量

```typescript
// 檢查主題無障礙性
const accessibilityReport = checkThemeAccessibility(currentTheme);
if (!accessibilityReport.passed) {
  console.warn('主題無障礙問題:', accessibilityReport.issues);
}
```

## 🔍 故障排除

### 常見問題

1. **主題不生效**
   - 確認 `ThemeProvider` 正確包裝應用
   - 檢查 `autoInjectCSS` 是否啟用
   - 驗證主題是否正確註冊

2. **CSS 變數未生成**
   - 確認主題已載入
   - 檢查瀏覽器控制台中的 CSS
   - 驗證變數命名格式

3. **顏色對比度問題**
   - 使用 `checkThemeAccessibility` 檢查
   - 調整顏色配置
   - 添加高對比度變體

### 除錯工具

```typescript
// 分析主題效能
const performance = analyzeThemePerformance(currentTheme);
console.log('主題效能分析:', performance);

// 驗證主題配置
const validation = validateTheme(currentTheme);
if (!validation.valid) {
  console.error('主題驗證失敗:', validation.errors);
}
```

## 📈 版本更新

### v1.0.0
- 初始版本發布
- 基本主題功能
- React Provider 整合

### v1.1.0 (計劃中)
- 動畫主題切換
- 更多預設主題
- 效能優化

---

更多資訊請參考 [D3 Components 官方文檔](https://github.com/your-repo/d3-components)