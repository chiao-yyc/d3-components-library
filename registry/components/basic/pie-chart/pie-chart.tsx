
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { PieChartProps } from './types';
import { D3PieChart, PieChartConfig } from './core';
import './pie-chart.css';

export function PieChart({
  data,
  labelKey,
  valueKey,
  colorKey,
  labelAccessor,
  valueAccessor,
  colorAccessor,
  mapping,
  width = 400,
  height = 400,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  innerRadius = 0,
  outerRadius,
  cornerRadius = 0,
  padAngle = 0,
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  colorScheme = 'custom',
  showLabels = true,
  showPercentages = true,
  labelThreshold = 5,
  labelFormat,
  showLegend = true,
  legendPosition = 'right',
  legendFormat,
  interactive = true,
  animate = true,
  animationDuration = 750,
  showCenterText = true,
  centerTextFormat,
  animationType = 'sweep',
  hoverEffect = 'lift',
  showTooltip = true,
  tooltipFormat,
  onSliceClick,
  onSliceHover,
  className,
  style,
  ...props
}: PieChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<D3PieChart | null>(null);

  useEffect(() => {
    if (containerRef.current && data) {
      const config: PieChartConfig = {
        data,
        labelKey,
        valueKey,
        colorKey,
        labelAccessor,
        valueAccessor,
        colorAccessor,
        mapping,
        width,
        height,
        margin,
        innerRadius,
        outerRadius,
        cornerRadius,
        padAngle,
        colors,
        colorScheme,
        showLabels,
        showPercentages,
        labelThreshold,
        labelFormat,
        showLegend,
        legendPosition,
        legendFormat,
        interactive,
        animate,
        animationDuration,
        showCenterText,
        centerTextFormat,
        animationType,
        hoverEffect,
        showTooltip,
        tooltipFormat,
        onSliceClick,
        onSliceHover,
      };

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new D3PieChart(containerRef.current, config);
      } else {
        chartInstanceRef.current.update(config);
      }
    }
  }, [data, labelKey, valueKey, colorKey, labelAccessor, valueAccessor, colorAccessor, mapping, width, height, margin, innerRadius, outerRadius, cornerRadius, padAngle, colors, colorScheme, showLabels, showPercentages, labelThreshold, labelFormat, showLegend, legendPosition, legendFormat, interactive, animate, animationDuration, showCenterText, centerTextFormat, animationType, hoverEffect, showTooltip, tooltipFormat, onSliceClick, onSliceHover]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('pie-chart-container', className)}
      style={{ width, height }}
      {...props}
    />
  );
}
