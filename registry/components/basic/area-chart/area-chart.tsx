
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { AreaChartProps } from './types';
import { D3AreaChart, AreaChartConfig } from './core';
import './area-chart.css';

export function AreaChart({
  data,
  xKey,
  yKey,
  categoryKey,
  xAccessor,
  yAccessor,
  categoryAccessor,
  mapping,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  curve = 'monotone',
  stackMode = 'none',
  fillOpacity = 0.7,
  strokeWidth = 2,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  colorScheme = 'custom',
  gradient = true,
  showXAxis = true,
  showYAxis = true,
  xAxisFormat,
  yAxisFormat,
  showGrid = true,
  showDots = false,
  dotRadius = 3,
  showLegend = true,
  legendPosition = 'top',
  interactive = true,
  animate = true,
  animationDuration = 750,
  showTooltip = true,
  tooltipFormat,
  onDataClick,
  onDataHover,
  className,
  style,
  ...props
}: AreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<D3AreaChart | null>(null);

  useEffect(() => {
    if (containerRef.current && data) {
      const config: AreaChartConfig = {
        data,
        xKey,
        yKey,
        categoryKey,
        xAccessor,
        yAccessor,
        categoryAccessor,
        mapping,
        width,
        height,
        margin,
        curve,
        stackMode,
        fillOpacity,
        strokeWidth,
        colors,
        colorScheme,
        gradient,
        showXAxis,
        showYAxis,
        xAxisFormat,
        yAxisFormat,
        showGrid,
        showDots,
        dotRadius,
        interactive,
        animate,
        animationDuration,
        showTooltip,
        tooltipFormat,
        onDataClick,
        onDataHover,
      };

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new D3AreaChart(containerRef.current, config);
      } else {
        chartInstanceRef.current.update(config);
      }
    }
  }, [data, xKey, yKey, categoryKey, xAccessor, yAccessor, categoryAccessor, mapping, width, height, margin, curve, stackMode, fillOpacity, strokeWidth, colors, colorScheme, gradient, showXAxis, showYAxis, xAxisFormat, yAxisFormat, showGrid, showDots, dotRadius, interactive, animate, animationDuration, showTooltip, tooltipFormat, onDataClick, onDataHover]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('area-chart-container', className)}
      style={{ width, height }}
      {...props}
    />
  );
}
