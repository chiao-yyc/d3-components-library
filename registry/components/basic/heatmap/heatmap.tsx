
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { HeatmapProps } from './types';
import { D3Heatmap, HeatmapConfig } from './core';
import './heatmap.css';

export function Heatmap({
  data,
  xKey,
  yKey,
  valueKey,
  xAccessor,
  yAccessor,
  valueAccessor,
  mapping,
  width = 600,
  height = 400,
  margin = { top: 20, right: 80, bottom: 60, left: 80 },
  cellPadding = 2,
  cellRadius = 0,
  colorScheme = 'blues',
  colors,
  domain,
  showXAxis = true,
  showYAxis = true,
  xAxisFormat,
  yAxisFormat,
  xAxisRotation = -45,
  yAxisRotation = 0,
  showLegend = true,
  legendPosition = 'right',
  legendTitle = '數值',
  legendFormat,
  showValues = false,
  valueFormat,
  textColor,
  interactive = true,
  animate = true,
  animationDuration = 750,
  showTooltip = true,
  tooltipFormat,
  onCellClick,
  onCellHover,
  className,
  style,
  ...props
}: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<D3Heatmap | null>(null);

  useEffect(() => {
    if (containerRef.current && data) {
      const config: HeatmapConfig = {
        data,
        xKey,
        yKey,
        valueKey,
        xAccessor,
        yAccessor,
        valueAccessor,
        mapping,
        width,
        height,
        margin,
        cellPadding,
        cellRadius,
        colorScheme,
        colors,
        domain,
        showXAxis,
        showYAxis,
        xAxisFormat,
        yAxisFormat,
        xAxisRotation,
        yAxisRotation,
        showLegend,
        legendPosition,
        legendTitle,
        legendFormat,
        showValues,
        valueFormat,
        textColor,
        interactive,
        animate,
        animationDuration,
        showTooltip,
        tooltipFormat,
        onCellClick,
        onCellHover,
      };

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new D3Heatmap(containerRef.current, config);
      } else {
        chartInstanceRef.current.update(config);
      }
    }
  }, [data, xKey, yKey, valueKey, xAccessor, yAccessor, valueAccessor, mapping, width, height, margin, cellPadding, cellRadius, colorScheme, colors, domain, showXAxis, showYAxis, xAxisFormat, yAxisFormat, xAxisRotation, yAxisRotation, showLegend, legendPosition, legendTitle, legendFormat, showValues, valueFormat, textColor, interactive, animate, animationDuration, showTooltip, tooltipFormat, onCellClick, onCellHover]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('heatmap-container', className)}
      style={{ width, height }}
      {...props}
    />
  );
}
