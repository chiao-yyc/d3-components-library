/**
 * MultiSeriesComboChartV2 - 基於 primitives 架構的組合圖表組件
 * 使用 ChartCanvas 進行統一的容器管理
 */

import React, { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartCanvas, useChartCanvas } from '../primitives/canvas/chart-canvas';
import { XAxis, YAxis, DualAxis } from '../primitives/axis';

// 系列配置接口
export interface ComboSeries {
  name: string;
  type: 'bar' | 'line' | 'area' | 'scatter';
  yKey: string;
  yAxis: 'left' | 'right';
  color?: string;
  visible?: boolean;
  opacity?: number;
  strokeWidth?: number;
  pointRadius?: number;
}

// 軸線配置接口
export interface AxisConfig {
  label?: string;
  tickCount?: number;
  tickFormat?: (d: any) => string;
  domain?: [number, number];
}

// 組件 props 接口
export interface MultiSeriesComboChartV2Props {
  data: any[];
  series: ComboSeries[];
  xAccessor: string;
  
  // 畫布配置
  width?: number;
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  
  // 軸線配置
  leftAxisConfig?: AxisConfig;
  rightAxisConfig?: AxisConfig;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGrid?: boolean;
  
  // 視覺配置
  colors?: string[];
  barWidth?: number;
  animate?: boolean;
  interactive?: boolean;
  
  // 事件處理
  onDataClick?: (data: any, event: Event) => void;
  onDataHover?: (data: any, event: Event) => void;
  
  // 樣式
  className?: string;
}

// 默認配置
export const defaultMultiSeriesComboChartV2Props: Partial<MultiSeriesComboChartV2Props> = {
  width: 800,
  height: 400,
  margin: { top: 20, right: 60, bottom: 50, left: 60 },
  
  // 軸線默認配置
  showXAxis: true,
  showYAxis: true,
  showGrid: false,
  leftAxisConfig: {
    label: 'Left Axis',
    tickCount: 5
  },
  rightAxisConfig: {
    label: 'Right Axis',
    tickCount: 5
  },
  
  // 視覺默認配置
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
  barWidth: 0.6,
  animate: true,
  interactive: true,
};

// 圖形渲染組件
const SeriesRenderer: React.FC<{
  series: ComboSeries[];
  data: any[];
  xAccessor: string;
  xScale: any;
  leftYScale: any;
  rightYScale: any;
  colors: string[];
  barWidth: number;
  animate: boolean;
  onDataClick?: (data: any, event: Event) => void;
  onDataHover?: (data: any, event: Event) => void;
}> = ({ 
  series, data, xAccessor, xScale, leftYScale, rightYScale, 
  colors, barWidth, animate, onDataClick, onDataHover 
}) => {
  const groupRef = useRef<SVGGElement>(null);
  
  useEffect(() => {
    if (!groupRef.current || !data.length || !series.length) return;
    
    const svg = d3.select(groupRef.current);
    svg.selectAll('*').remove();
    
    // 按類型分組處理
    const visibleSeries = series.filter(s => s.visible !== false);
    
    // 渲染面積圖 (最底層)
    const areaSeries = visibleSeries.filter(s => s.type === 'area');
    areaSeries.forEach((s, index) => {
      const color = s.color || colors[index % colors.length];
      const yScale = s.yAxis === 'left' ? leftYScale : rightYScale;
      
      const area = d3.area<any>()
        .x(d => xScale(d[xAccessor])! + xScale.bandwidth() / 2)
        .y0(yScale(0))
        .y1(d => yScale(Number(d[s.yKey]) || 0))
        .curve(d3.curveMonotoneX);
      
      svg.append('path')
        .datum(data)
        .attr('class', `area-series area-${s.name}`)
        .attr('fill', color)
        .attr('opacity', s.opacity || 0.6)
        .attr('d', area);
    });
    
    // 渲染條形圖
    const barSeries = visibleSeries.filter(s => s.type === 'bar');
    barSeries.forEach((s, seriesIndex) => {
      const color = s.color || colors[seriesIndex % colors.length];
      const yScale = s.yAxis === 'left' ? leftYScale : rightYScale;
      const barCount = barSeries.length;
      const barWidthAdjusted = xScale.bandwidth() * barWidth / barCount;
      const barOffset = seriesIndex * barWidthAdjusted - (barCount - 1) * barWidthAdjusted / 2;
      
      const bars = svg.selectAll(`.bar-series-${seriesIndex}`)
        .data(data)
        .enter()
        .append('rect')
        .attr('class', `bar-series bar-${s.name}`)
        .attr('x', d => xScale(d[xAccessor])! + xScale.bandwidth() / 2 + barOffset - barWidthAdjusted / 2)
        .attr('width', barWidthAdjusted)
        .attr('fill', color)
        .attr('opacity', s.opacity || 0.8);
      
      if (animate) {
        bars
          .attr('y', yScale(0))
          .attr('height', 0)
          .transition()
          .duration(750)
          .attr('y', d => {
            const value = Number(d[s.yKey]) || 0;
            return value >= 0 ? yScale(value) : yScale(0);
          })
          .attr('height', d => {
            const value = Number(d[s.yKey]) || 0;
            return Math.abs(yScale(0) - yScale(value));
          });
      } else {
        bars
          .attr('y', d => {
            const value = Number(d[s.yKey]) || 0;
            return value >= 0 ? yScale(value) : yScale(0);
          })
          .attr('height', d => {
            const value = Number(d[s.yKey]) || 0;
            return Math.abs(yScale(0) - yScale(value));
          });
      }
      
      if (onDataClick) {
        bars.on('click', onDataClick);
      }
      if (onDataHover) {
        bars.on('mouseenter', onDataHover);
      }
    });
    
    // 渲染線圖
    const lineSeries = visibleSeries.filter(s => s.type === 'line');
    lineSeries.forEach((s, index) => {
      const color = s.color || colors[index % colors.length];
      const yScale = s.yAxis === 'left' ? leftYScale : rightYScale;
      
      const line = d3.line<any>()
        .x(d => xScale(d[xAccessor])! + xScale.bandwidth() / 2)
        .y(d => yScale(Number(d[s.yKey]) || 0))
        .curve(d3.curveMonotoneX);
      
      const path = svg.append('path')
        .datum(data)
        .attr('class', `line-series line-${s.name}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', s.strokeWidth || 2)
        .attr('opacity', s.opacity || 1)
        .attr('d', line);
      
      if (animate) {
        const totalLength = path.node()?.getTotalLength() || 0;
        path
          .attr('stroke-dasharray', totalLength + ' ' + totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(1000)
          .attr('stroke-dashoffset', 0);
      }
      
      // 添加數據點
      svg.selectAll(`.line-points-${index}`)
        .data(data)
        .enter()
        .append('circle')
        .attr('class', `line-points line-points-${s.name}`)
        .attr('cx', d => xScale(d[xAccessor])! + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(Number(d[s.yKey]) || 0))
        .attr('r', s.pointRadius || 3)
        .attr('fill', color)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .attr('opacity', s.opacity || 1);
    });
    
    // 渲染散點圖
    const scatterSeries = visibleSeries.filter(s => s.type === 'scatter');
    scatterSeries.forEach((s, index) => {
      const color = s.color || colors[index % colors.length];
      const yScale = s.yAxis === 'left' ? leftYScale : rightYScale;
      
      const circles = svg.selectAll(`.scatter-series-${index}`)
        .data(data)
        .enter()
        .append('circle')
        .attr('class', `scatter-series scatter-${s.name}`)
        .attr('cx', d => xScale(d[xAccessor])! + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(Number(d[s.yKey]) || 0))
        .attr('fill', color)
        .attr('opacity', s.opacity || 0.7)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1);
      
      if (animate) {
        circles
          .attr('r', 0)
          .transition()
          .duration(500)
          .delay((d, i) => i * 50)
          .attr('r', s.pointRadius || 4);
      } else {
        circles.attr('r', s.pointRadius || 4);
      }
      
      if (onDataClick) {
        circles.on('click', onDataClick);
      }
      if (onDataHover) {
        circles.on('mouseenter', onDataHover);
      }
    });
    
  }, [series, data, xAccessor, xScale, leftYScale, rightYScale, colors, barWidth, animate, onDataClick, onDataHover]);
  
  return <g ref={groupRef} className="series-renderer" />;
};

// 主組件
export const MultiSeriesComboChartV2: React.FC<MultiSeriesComboChartV2Props> = (props) => {
  const {
    data = [],
    series = [],
    xAccessor,
    width = 800,
    height = 400,
    margin = {},
    leftAxisConfig = {},
    rightAxisConfig = {},
    showXAxis = true,
    showYAxis = true,
    showGrid = false,
    colors = defaultMultiSeriesComboChartV2Props.colors!,
    barWidth = 0.6,
    animate = true,
    interactive = true,
    onDataClick,
    onDataHover,
    className = ''
  } = props;

  // 合併默認 margin
  const finalMargin = {
    top: 20,
    right: 60,
    bottom: 50,
    left: 60,
    ...margin
  };

  // 計算比例尺
  const scales = useMemo(() => {
    if (!data.length || !series.length) {
      return null;
    }

    // X 軸比例尺
    const xDomain = data.map(d => d[xAccessor]);
    const xScale = d3.scaleBand()
      .domain(xDomain)
      .range([0, width - finalMargin.left - finalMargin.right])
      .paddingInner(0.1);

    // 左軸數據範圍
    const leftSeries = series.filter(s => s.visible !== false && s.yAxis === 'left');
    const leftValues = leftSeries.length ? data.flatMap(d => 
      leftSeries.map(s => +d[s.yKey]).filter(v => !isNaN(v))
    ) : [];
    
    const leftYDomain = leftValues.length ? 
      d3.extent(leftValues).map((v, i) => i === 0 ? Math.min(0, v!) : Math.max(0, v!)) as [number, number] :
      [0, 1];

    const leftYScale = d3.scaleLinear()
      .domain(leftAxisConfig.domain || leftYDomain)
      .range([height - finalMargin.top - finalMargin.bottom, 0]);

    // 右軸數據範圍
    const rightSeries = series.filter(s => s.visible !== false && s.yAxis === 'right');
    const rightValues = rightSeries.length ? data.flatMap(d => 
      rightSeries.map(s => +d[s.yKey]).filter(v => !isNaN(v))
    ) : [];
    
    const rightYDomain = rightValues.length ? 
      d3.extent(rightValues).map((v, i) => i === 0 ? Math.min(0, v!) : Math.max(0, v!)) as [number, number] :
      [0, 1];

    const rightYScale = d3.scaleLinear()
      .domain(rightAxisConfig.domain || rightYDomain)
      .range([height - finalMargin.top - finalMargin.bottom, 0]);

    return {
      xScale,
      leftYScale,
      rightYScale,
      hasLeftAxis: leftSeries.length > 0,
      hasRightAxis: rightSeries.length > 0
    };
  }, [data, series, xAccessor, width, height, finalMargin, leftAxisConfig.domain, rightAxisConfig.domain]);

  if (!scales) {
    return <div className="loading">Loading chart...</div>;
  }

  return (
    <div className={`multi-series-combo-chart-v2 ${className}`}>
      <ChartCanvas
        width={width}
        height={height}
        margin={finalMargin}
      >
        {/* 背景網格 */}
        {showGrid && (
          <g className="grid-layer" style={{ opacity: 0.1 }}>
            {/* Y 軸網格線 */}
            {scales.leftYScale.ticks(leftAxisConfig.tickCount || 5).map(tick => (
              <line
                key={`grid-y-${tick}`}
                x1={0}
                x2={width - finalMargin.left - finalMargin.right}
                y1={scales.leftYScale(tick)}
                y2={scales.leftYScale(tick)}
                stroke="currentColor"
              />
            ))}
          </g>
        )}

        {/* 圖形系列 */}
        <SeriesRenderer
          series={series}
          data={data}
          xAccessor={xAccessor}
          xScale={scales.xScale}
          leftYScale={scales.leftYScale}
          rightYScale={scales.rightYScale}
          colors={colors}
          barWidth={barWidth}
          animate={animate}
          onDataClick={onDataClick}
          onDataHover={onDataHover}
        />

        {/* X 軸 */}
        {showXAxis && (
          <XAxis
            scale={scales.xScale}
            position="bottom"
            label="X Axis"
          />
        )}

        {/* Y 軸 */}
        {showYAxis && scales.hasLeftAxis && scales.hasRightAxis && (
          <DualAxis
            leftAxis={{
              scale: scales.leftYScale,
              position: "left",
              tickCount: leftAxisConfig.tickCount || 5,
              tickFormat: leftAxisConfig.tickFormat,
              label: leftAxisConfig.label || 'Left Axis'
            }}
            rightAxis={{
              scale: scales.rightYScale,
              position: "right",
              tickCount: rightAxisConfig.tickCount || 5,
              tickFormat: rightAxisConfig.tickFormat,
              label: rightAxisConfig.label || 'Right Axis'
            }}
          />
        )}

        {showYAxis && scales.hasLeftAxis && !scales.hasRightAxis && (
          <YAxis
            scale={scales.leftYScale}
            position="left"
            tickCount={leftAxisConfig.tickCount || 5}
            tickFormat={leftAxisConfig.tickFormat}
            label={leftAxisConfig.label || 'Left Axis'}
          />
        )}

        {showYAxis && !scales.hasLeftAxis && scales.hasRightAxis && (
          <YAxis
            scale={scales.rightYScale}
            position="right"
            tickCount={rightAxisConfig.tickCount || 5}
            tickFormat={rightAxisConfig.tickFormat}
            label={rightAxisConfig.label || 'Right Axis'}
          />
        )}
      </ChartCanvas>
    </div>
  );
};

// 別名組件，向下兼容
export const MultiSeriesComboChart = MultiSeriesComboChartV2;

// 專用變體組件
// 專用的 bar 系列接口
interface BarSeriesConfig extends Omit<ComboSeries, 'type'> {
  barOpacity?: number;
  cornerRadius?: number;
}

export const BarLineComboChart: React.FC<Omit<MultiSeriesComboChartV2Props, 'series'> & {
  barSeries: BarSeriesConfig[];
  lineSeries: LineSeriesConfig[];
}> = ({ barSeries, lineSeries, ...props }) => {
  const series: ComboSeries[] = [
    ...barSeries.map(s => ({ 
      ...s, 
      type: 'bar' as const,
      opacity: s.barOpacity || s.opacity
    })),
    ...lineSeries.map(s => ({ 
      ...s, 
      type: 'line' as const
    }))
  ];
  
  return <MultiSeriesComboChartV2 {...props} series={series} />;
};

// 專用的 area 和 line 系列接口，支持更多專用屬性
interface AreaSeriesConfig extends Omit<ComboSeries, 'type'> {
  areaOpacity?: number;
  curve?: string;
}

interface LineSeriesConfig extends Omit<ComboSeries, 'type'> {
  showPoints?: boolean;
  curve?: string;
}

export const AreaLineComboChart: React.FC<Omit<MultiSeriesComboChartV2Props, 'series'> & {
  areaSeries: AreaSeriesConfig[];
  lineSeries: LineSeriesConfig[];
}> = ({ areaSeries, lineSeries, ...props }) => {
  const series: ComboSeries[] = [
    ...areaSeries.map(s => ({ 
      ...s, 
      type: 'area' as const,
      opacity: s.areaOpacity || s.opacity
    })),
    ...lineSeries.map(s => ({ 
      ...s, 
      type: 'line' as const
    }))
  ];
  
  return <MultiSeriesComboChartV2 {...props} series={series} />;
};