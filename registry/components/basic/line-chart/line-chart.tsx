
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { LineChartProps } from './types';
import { D3LineChart, LineChartConfig } from './core';
import './line-chart.css';

export function LineChart({
  data,
  xKey,
  yKey,
  seriesKey,
  xAccessor,
  yAccessor,
  mapping,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  strokeWidth = 2,
  curve = 'monotone',
  showDots = false,
  dotRadius = 4,
  showArea = false,
  areaOpacity = 0.1,
  showGrid = true,
  gridOpacity = 0.2,
  showTooltip = true,
  tooltipFormat,
  animate = false,
  interactive = true,
  className,
  onDataClick,
  onHover,
  ...props
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<D3LineChart | null>(null);

  useEffect(() => {
    if (containerRef.current && data) {
      const config: LineChartConfig = {
        data,
        xKey,
        yKey,
        seriesKey,
        xAccessor,
        yAccessor,
        mapping,
        width,
        height,
        margin,
        colors,
        strokeWidth,
        curve,
        showDots,
        dotRadius,
        showArea,
        areaOpacity,
        showGrid,
        gridOpacity,
        showTooltip,
        tooltipFormat,
        animate,
        interactive,
        onDataClick,
        onHover,
      };

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new D3LineChart(containerRef.current, config);
      } else {
        chartInstanceRef.current.update(config);
      }
    }
  }, [data, xKey, yKey, seriesKey, xAccessor, yAccessor, mapping, width, height, margin, colors, strokeWidth, curve, showDots, dotRadius, showArea, areaOpacity, showGrid, gridOpacity, showTooltip, tooltipFormat, animate, interactive, onDataClick, onHover]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('line-chart-container', className)}
      style={{ width, height }}
      {...props}
    />
  );
}
