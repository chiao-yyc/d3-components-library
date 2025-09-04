import React, { useMemo } from 'react'
import { 
  ChartCanvas, 
  LayerManager, 
  useScaleManager 
} from '../primitives'
import { 
  ChartSeriesProcessor, 
  type ComboChartSeries, 
  type EnhancedComboData 
} from './chart-series-processor'
import { ChartScaleFactory } from './chart-scale-factory'
import { ChartAxisRenderer, type AxisConfig } from './chart-axis-renderer'
import { ChartSeriesRenderer } from './chart-series-renderer'

// 主組件屬性接口
export interface EnhancedComboChartV2Props {
  data: EnhancedComboData[]
  series: ComboChartSeries[]
  
  // 維度和邊距
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  
  // 數據映射
  xKey: string
  
  // 軸線配置
  leftAxis?: AxisConfig
  rightAxis?: AxisConfig
  xAxis?: AxisConfig
  
  
  // 視覺配置
  colors?: string[]
  animate?: boolean
  animationDuration?: number
  
  // 交互配置
  interactive?: boolean
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
  
  className?: string
}

/**
 * 重構後的增強組合圖表組件
 * 
 * 主要改進：
 * 1. 拆解為多個專職模組
 * 2. 清晰的職責分離
 * 3. 更好的可測試性和可維護性
 */
export const EnhancedComboChartV2: React.FC<EnhancedComboChartV2Props> = ({
  data,
  series,
  width = 800,
  height = 400,
  margin = { top: 20, right: 60, bottom: 50, left: 60 },
  xKey,
  leftAxis = {},
  rightAxis = {},
  xAxis = {},
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  animate = true,
  animationDuration = 300,
  interactive = true,
  onSeriesClick,
  onSeriesHover,
  className = ''
}) => {
  // 驗證數據和系列配置
  if (!data?.length || !series?.length) {
    console.warn('EnhancedComboChartV2: Missing data or series', { 
      data: data?.length, 
      series: series?.length 
    })
    return (
      <div className={`enhanced-combo-chart-v2 ${className}`}>
        <div className="empty-state">
          No data or series configuration provided
        </div>
      </div>
    )
  }

  const contentArea = {
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom
  }

  // 使用 ChartSeriesProcessor 處理數據和計算域值
  const { xDomain, leftYDomain, rightYDomain, processedSeries } = useMemo(() => {
    return ChartSeriesProcessor.processSeries(data, series, xKey, colors)
  }, [data, series, xKey, colors])

  // 使用用戶提供的域值覆蓋自動計算的值
  const finalLeftYDomain = leftAxis.domain || leftYDomain
  const finalRightYDomain = rightAxis.domain || rightYDomain

  console.log('EnhancedComboChartV2: Rendering with processed data', { 
    dataLength: data.length, 
    seriesLength: processedSeries.length, 
    xKey,
    xDomain: xDomain.slice(0, 3), // 只顯示前3個值避免日誌過長
    leftYDomain: finalLeftYDomain,
    rightYDomain: finalRightYDomain
  })

  return (
    <div className={`enhanced-combo-chart-v2 ${className}`}>
      <ChartCanvas
        width={width}
        height={height}
        margin={margin}
        className="enhanced-combo-chart-v2-canvas"
      >
        <LayerManager>
          <EnhancedComboChartContent
            data={data}
            series={processedSeries}
            xKey={xKey}
            xDomain={xDomain}
            leftYDomain={finalLeftYDomain}
            rightYDomain={finalRightYDomain}
            contentArea={contentArea}
            leftAxis={leftAxis}
            rightAxis={rightAxis}
            xAxis={xAxis}
            animate={animate}
            animationDuration={animationDuration}
            interactive={interactive}
            onSeriesClick={onSeriesClick}
            onSeriesHover={onSeriesHover}
          />
        </LayerManager>
      </ChartCanvas>
    </div>
  )
}

// 內容渲染組件
interface EnhancedComboChartContentProps {
  data: EnhancedComboData[]
  series: (ComboChartSeries & { color: string })[]
  xKey: string
  xDomain: any[]
  leftYDomain: [number, number]
  rightYDomain: [number, number]
  contentArea: { width: number; height: number }
  leftAxis: AxisConfig
  rightAxis: AxisConfig
  xAxis: AxisConfig
  animate: boolean
  animationDuration: number
  interactive: boolean
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
}

const EnhancedComboChartContent: React.FC<EnhancedComboChartContentProps> = (props) => {
  const {
    data, series, xKey, xDomain, leftYDomain, rightYDomain, contentArea,
    leftAxis, rightAxis, xAxis, animate, animationDuration, interactive,
    onSeriesClick, onSeriesHover
  } = props
  
  const { registerExistingScale } = useScaleManager()

  // 使用 ChartScaleFactory 創建和註冊比例尺
  const { xScale, leftYScale, rightYScale } = useMemo(() => {
    console.log('📦 Creating and registering scales with ChartScaleFactory...')
    
    return ChartScaleFactory.registerScales(
      registerExistingScale,
      xDomain,
      leftYDomain,
      rightYDomain,
      contentArea,
      series
    )
  }, [xDomain, leftYDomain, rightYDomain, contentArea, series, registerExistingScale])

  console.log('✅ Scales created successfully:', {
    xScale: !!xScale,
    leftYScale: !!leftYScale,
    rightYScale: !!rightYScale
  })

  return (
    <>
      {/* 使用 ChartAxisRenderer 渲染軸線 */}
      <ChartAxisRenderer
        xScale={xScale}
        leftYScale={leftYScale}
        rightYScale={rightYScale}
        leftAxis={leftAxis}
        rightAxis={rightAxis}
        xAxis={xAxis}
        hasLeftSeries={series.some(s => s.yAxis === 'left')}
        hasRightSeries={series.some(s => s.yAxis === 'right')}
      />
      
      {/* 使用 ChartSeriesRenderer 渲染圖形 */}
      <ChartSeriesRenderer
        data={data}
        series={series}
        xKey={xKey}
        xScale={xScale}
        leftYScale={leftYScale}
        rightYScale={rightYScale}
        animate={animate}
        animationDuration={animationDuration}
        interactive={interactive}
        onSeriesClick={onSeriesClick}
        onSeriesHover={onSeriesHover}
      />
    </>
  )
}

// 重新導出相關類型
export type { ComboChartSeries, EnhancedComboData } from './chart-series-processor'
export type { AxisConfig } from './chart-axis-renderer'