
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { GaugeChartProps } from './types';
import { D3GaugeChart, GaugeChartConfig } from './core';
import './gauge-chart.css';

export function GaugeChart({
  data,
  value,
  min = 0,
  max = 100,
  valueKey,
  labelKey,
  valueAccessor,
  labelAccessor,
  mapping,
  width = 300,
  height = 200,
  margin = { top: 30, right: 30, bottom: 50, left: 30 },
  innerRadius,
  outerRadius,
  startAngle = -90,
  endAngle = 90,
  cornerRadius = 0,
  backgroundColor = '#e5e7eb',
  foregroundColor = '#3b82f6',
  colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e'],
  zones,
  needleColor = '#374151',
  needleWidth = 3,
  centerCircleRadius = 8,
  centerCircleColor = '#374151',
  showValue = true,
  showLabel = true,
  showTicks = true,
  showMinMax = true,
  tickCount = 5,
  valueFormat,
  labelFormat,
  tickFormat,
  fontSize = 14,
  fontFamily = 'sans-serif',
  animate = true,
  animationDuration = 1000,
  animationEasing = 'easeElasticOut',
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  onValueChange,
  className,
  style,
  ...props
}: GaugeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<D3GaugeChart | null>(null);

  useEffect(() => {
    if (containerRef.current && data) {
      const config: GaugeChartConfig = {
        data,
        value,
        min,
        max,
        valueKey,
        labelKey,
        valueAccessor,
        labelAccessor,
        mapping,
        width,
        height,
        margin,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        cornerRadius,
        backgroundColor,
        foregroundColor,
        colors,
        zones,
        needleColor,
        needleWidth,
        centerCircleRadius,
        centerCircleColor,
        showValue,
        showLabel,
        showTicks,
        showMinMax,
        tickCount,
        valueFormat,
        labelFormat,
        tickFormat,
        fontSize,
        fontFamily,
        animate,
        animationDuration,
        animationEasing,
        interactive,
        showTooltip,
        tooltipFormat,
        onValueChange,
      };

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new D3GaugeChart(containerRef.current, config);
      } else {
        chartInstanceRef.current.update(config);
      }
    }
  }, [data, value, min, max, valueKey, labelKey, valueAccessor, labelAccessor, mapping, width, height, margin, innerRadius, outerRadius, startAngle, endAngle, cornerRadius, backgroundColor, foregroundColor, colors, zones, needleColor, needleWidth, centerCircleRadius, centerCircleColor, showValue, showLabel, showTicks, showMinMax, tickCount, valueFormat, labelFormat, tickFormat, fontSize, fontFamily, animate, animationDuration, animationEasing, interactive, showTooltip, tooltipFormat, onValueChange]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('gauge-chart-container', className)}
      style={{ width, height }}
      {...props}
    />
  );
}
