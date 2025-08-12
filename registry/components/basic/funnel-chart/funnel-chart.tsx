
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { FunnelChartProps } from './types';
import { D3FunnelChart, FunnelChartConfig } from './core';
import './funnel-chart.css';

export function FunnelChart({
  data,
  labelKey,
  valueKey,
  labelAccessor,
  valueAccessor,
  mapping,
  width = 400,
  height = 500,
  margin = { top: 20, right: 60, bottom: 20, left: 60 },
  direction = 'top',
  shape = 'trapezoid',
  gap = 4,
  cornerRadius = 0,
  proportionalMode = 'traditional',
  shrinkageType = 'percentage',
  shrinkageAmount = 0.1,
  minWidth = 50,
  colors = ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
  colorScheme = 'custom',
  showLabels = true,
  showValues = true,
  showPercentages = true,
  showConversionRates = true,
  labelPosition = 'side',
  valueFormat,
  percentageFormat,
  conversionRateFormat,
  fontSize = 12,
  fontFamily = 'sans-serif',
  animate = true,
  animationDuration = 800,
  animationDelay = 100,
  animationEasing = 'easeOutCubic',
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  onSegmentClick,
  onSegmentHover,
  className,
  style,
  ...props
}: FunnelChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<D3FunnelChart | null>(null);

  useEffect(() => {
    if (containerRef.current && data) {
      const config: FunnelChartConfig = {
        data,
        labelKey,
        valueKey,
        labelAccessor,
        valueAccessor,
        mapping,
        width,
        height,
        margin,
        direction,
        shape,
        gap,
        cornerRadius,
        proportionalMode,
        shrinkageType,
        shrinkageAmount,
        minWidth,
        colors,
        colorScheme,
        showLabels,
        showValues,
        showPercentages,
        showConversionRates,
        labelPosition,
        valueFormat,
        percentageFormat,
        conversionRateFormat,
        fontSize,
        fontFamily,
        animate,
        animationDuration,
        animationDelay,
        animationEasing,
        interactive,
        showTooltip,
        tooltipFormat,
        onSegmentClick,
        onSegmentHover,
      };

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new D3FunnelChart(containerRef.current, config);
      } else {
        chartInstanceRef.current.update(config);
      }
    }
  }, [data, labelKey, valueKey, labelAccessor, valueAccessor, mapping, width, height, margin, direction, shape, gap, cornerRadius, proportionalMode, shrinkageType, shrinkageAmount, minWidth, colors, colorScheme, showLabels, showValues, showPercentages, showConversionRates, labelPosition, valueFormat, percentageFormat, conversionRateFormat, fontSize, fontFamily, animate, animationDuration, animationDelay, animationEasing, interactive, showTooltip, tooltipFormat, onSegmentClick, onSegmentHover]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('funnel-chart-container', className)}
      style={{ width, height }}
      {...props}
    />
  );
}
