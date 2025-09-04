# D3 Components 統一軸線配置系統

## 🎯 設計理念

本文檔定義了 D3 Components 圖表套件的統一軸線配置系統，旨在為所有 Cartesian coordinate 圖表提供一致、靈活且易用的軸線控制方式。

### 核心原則
- **約定優於配置**: 提供合理的默認值，減少必要配置
- **向下兼容**: 不破壞現有 API，平滑遷移
- **類型安全**: 完整的 TypeScript 支援
- **統一性**: 所有圖表使用相同的軸線配置概念

## 📋 類型定義

### AxisConfig 接口

```typescript
/**
 * 軸線配置接口
 * 適用於所有 Cartesian coordinate 圖表的 X 和 Y 軸
 */
interface AxisConfig {
  /** 是否包含原點 (適合散點圖等需要 (0,0) 參考的圖表) */
  includeOrigin?: boolean;
  
  /** 是否從零開始 (適合柱狀圖等需要零基準的圖表) */
  beginAtZero?: boolean;
  
  /** 域值控制 */
  domain?: 'auto' | [number, number] | ((data: any[]) => [number, number]);
  
  /** 是否使用 D3 nice() 產生友好的刻度值 */
  nice?: boolean;
  
  /** 域值邊距百分比 (預留空間避免數據點貼邊) */
  padding?: number;
}
```

### BaseChartCoreConfig 更新

```typescript
interface BaseChartCoreConfig {
  // 現有配置保持不變...
  width?: number;
  height?: number;
  margin?: Margin;
  data: any[];
  
  // === 新增：軸線配置系統 ===
  
  /** X 軸配置 */
  xAxis?: AxisConfig;
  
  /** Y 軸配置 */
  yAxis?: AxisConfig;
  
  // === 快捷配置（語法糖，向下兼容）===
  
  /** 快捷配置：是否包含原點 (同時影響 X 和 Y 軸) */
  includeOrigin?: boolean;
  
  /** 快捷配置：是否從零開始 (同時影響 X 和 Y 軸) */
  beginAtZero?: boolean;
}
```

## 🎨 圖表類型分類與默認值

### Cartesian 圖表 (適用統一軸線配置)

| 圖表類型 | 默認 X 軸 | 默認 Y 軸 | 說明 |
|---------|----------|----------|------|
| **ScatterPlot** | `includeOrigin: false` | `includeOrigin: false` | 關注數據相關性，不需強制原點 |
| **LineChart** | `beginAtZero: false` | `beginAtZero: false` | 重點在趨勢變化 |
| **AreaChart** | `beginAtZero: false` | `beginAtZero: false` | 同 LineChart |
| **BarChart** | `domain: 'auto'` | `beginAtZero: true` | 柱狀圖需要零基準線 |

### 特殊圖表 (不適用或特殊處理)

- **PieChart**: 無軸線概念，不使用軸線配置
- **RadarChart**: 極坐標系，使用專門的 `RadarAxisConfig`
- **GaugeChart**: 固定角度範圍，使用專門配置
- **HeatMap**: 使用 band scale，特殊處理

## 🔧 使用模式

### Level 1: 簡單模式 (90% 用戶)

適用於大多數常見需求，使用快捷配置：

```typescript
// 散點圖包含原點
<ScatterPlot data={data} includeOrigin={true} />

// 柱狀圖不從零開始 (特殊需求)
<BarChart data={data} beginAtZero={false} />

// 線圖從零開始
<LineChart data={data} beginAtZero={true} />
```

### Level 2: 標準模式 (8% 用戶)

需要 X 和 Y 軸不同配置：

```typescript
// X 軸自動範圍，Y 軸包含原點
<ScatterPlot 
  data={data}
  xAxis={{ domain: 'auto' }}
  yAxis={{ includeOrigin: true }}
/>

// X 軸類別，Y 軸從零開始
<BarChart 
  data={data}
  xAxis={{ domain: 'auto' }}  // 類別軸
  yAxis={{ beginAtZero: true, nice: true }}
/>
```

### Level 3: 進階模式 (2% 用戶)

完全自定義域值範圍：

```typescript
// 固定範圍
<ScatterPlot 
  data={data}
  xAxis={{ domain: [0, 100] }}
  yAxis={{ domain: [-50, 50] }}
/>

// 自定義邏輯
<LineChart 
  data={data}
  yAxis={{
    domain: (data) => {
      const values = data.map(d => d.y);
      const extent = d3.extent(values);
      return [extent[0] * 0.9, extent[1] * 1.1]; // 10% 緩衝
    }
  }}
/>
```

## 🏗️ 實現架構

### BaseChartCore 核心邏輯

```typescript
abstract class BaseChartCore<T extends BaseChartData> {
  /**
   * 計算軸線域值
   * @param values 數據值陣列
   * @param axisConfig 軸線配置
   * @param chartDefaults 圖表類型默認值
   */
  protected calculateAxisDomain(
    values: number[],
    axisConfig?: AxisConfig,
    chartDefaults?: AxisConfig
  ): [number, number] {
    // 配置優先級：傳入配置 > 快捷配置 > 圖表默認值
    const config = { 
      ...this.getChartAxisDefaults(), 
      ...chartDefaults, 
      ...axisConfig 
    };
    
    // 處理自定義 domain
    if (config.domain) {
      if (typeof config.domain === 'function') {
        return config.domain(values);
      }
      if (Array.isArray(config.domain)) {
        return config.domain as [number, number];
      }
    }
    
    // 計算數據範圍
    const extent = d3.extent(values) as [number, number];
    
    // 應用配置邏輯
    if (config.includeOrigin) {
      return [Math.min(0, extent[0]), Math.max(0, extent[1])];
    }
    
    if (config.beginAtZero) {
      return [0, Math.max(0, extent[1])];
    }
    
    // 應用邊距
    if (config.padding) {
      const range = extent[1] - extent[0];
      const paddingValue = range * config.padding;
      return [extent[0] - paddingValue, extent[1] + paddingValue];
    }
    
    return extent;
  }
  
  /**
   * 獲取圖表類型默認軸線配置
   */
  protected abstract getChartAxisDefaults(): {
    xAxis?: AxisConfig;
    yAxis?: AxisConfig;
  };
}
```

### 圖表實現示例

```typescript
export class ScatterPlotCore extends BaseChartCore<ScatterPlotData> {
  protected getChartAxisDefaults() {
    return {
      xAxis: { includeOrigin: false, nice: true },
      yAxis: { includeOrigin: false, nice: true }
    };
  }
  
  private createXScale(values: number[]): d3.ScaleLinear<number, number> {
    const config = this.config as ScatterPlotCoreConfig;
    
    // 使用新的域值計算系統
    const domain = this.calculateAxisDomain(
      values, 
      config.xAxis,           // 傳入的 X 軸配置
      { includeOrigin: config.includeOrigin }  // 快捷配置轉換
    );
    
    return d3.scaleLinear()
      .domain(domain)
      .range([0, this.chartWidth]);
  }
}
```

## 🔄 遷移指南

### 從舊配置遷移

**舊方式 (仍然支援):**
```typescript
<ScatterPlot data={data} />  // 使用默認行為
```

**新方式 (推薦):**
```typescript
<ScatterPlot 
  data={data} 
  includeOrigin={false}  // 明確指定行為
/>
```

### 配置優先級

1. **明確的軸線配置** (`xAxis`, `yAxis`)
2. **快捷配置** (`includeOrigin`, `beginAtZero`)
3. **圖表類型默認值**
4. **系統默認值** (`domain: 'auto'`)

## 📚 最佳實踐

### 何時使用不同配置

**使用 `includeOrigin: true`:**
- 散點圖需要顯示 (0,0) 原點參考
- 需要觀察數據相對於原點的分布

**使用 `beginAtZero: true`:**
- 柱狀圖 (幾乎總是需要)
- 面積圖需要顯示絕對數值
- 任何需要零基準線的場景

**使用 `domain: [min, max]`:**
- 需要固定範圍的儀表板
- 多個圖表需要統一尺度
- 已知合理的數據邊界

### 性能考量

- 域值計算在數據變更時才重新計算
- 使用 `nice: true` 會略微影響性能但提供更好的刻度
- 自定義 `domain` 函數應避免複雜計算

## 🧪 測試策略

### 單元測試覆蓋

1. **域值計算邏輯**
   - 各種配置組合的正確性
   - 邊界條件 (空數據、單一數據點等)
   
2. **配置優先級**
   - 確保配置覆蓋順序正確
   
3. **圖表類型默認值**
   - 每種圖表的默認行為驗證

### 整合測試

- 不同配置在實際圖表中的視覺效果
- 響應式行為 (數據更新時的域值變化)
- 向下兼容性驗證

---

*本文檔版本: 1.0*  
*最後更新: 2025年1月*