
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { ScatterPlotProps } from './types';
import { D3ScatterPlot, ScatterPlotConfig } from './core';
import './scatter-plot.css';

export function ScatterPlot({
  data,
  xKey,
  yKey,
  xAccessor,
  yAccessor,
  mapping,
  sizeKey,
  sizeAccessor,
  colorKey,
  colorAccessor,
  groupKey,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  radius = 4,
  minRadius = 3,
  maxRadius = 12,
  sizeRange = [3, 12],
  opacity = 0.7,
  strokeWidth = 1,
  strokeColor = 'white',
  showTrendline = false,
  trendlineColor = '#ef4444',
  trendlineWidth = 2,
  showTooltip = true,
  tooltipFormat,
  enableZoom = false,
  animate = false,
  interactive = true,
  className,
  onDataClick,
  onHover,
  ...props
}: ScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<D3ScatterPlot | null>(null);

  useEffect(() => {
    if (containerRef.current && data) {
      const config: ScatterPlotConfig = {
        data,
        xKey,
        yKey,
        xAccessor,
        yAccessor,
        mapping,
        sizeKey,
        sizeAccessor,
        colorKey,
        colorAccessor,
        width,
        height,
        margin,
        colors,
        radius,
        minRadius,
        maxRadius,
        sizeRange,
        opacity,
        strokeWidth,
        strokeColor,
        showTrendline,
        trendlineColor,
        trendlineWidth,
        showTooltip,
        tooltipFormat,
        animate,
        interactive,
        onDataClick,
        onHover,
      };

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new D3ScatterPlot(containerRef.current, config);
      } else {
        chartInstanceRef.current.update(config);
      }
    }
  }, [data, xKey, yKey, xAccessor, yAccessor, mapping, sizeKey, sizeAccessor, colorKey, colorAccessor, groupKey, width, height, margin, colors, radius, minRadius, maxRadius, sizeRange, opacity, strokeWidth, strokeColor, showTrendline, trendlineColor, trendlineWidth, showTooltip, tooltipFormat, enableZoom, animate, interactive, onDataClick, onHover]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('scatter-plot-container', className)}
      style={{ width, height }}
      {...props}
    />
  );
}
