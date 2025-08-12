
import React, { useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { BarChartProps } from './types';
import { D3BarChart, BarChartConfig } from './core';

export function BarChart({
  data,
  xKey,
  yKey,
  xAccessor,
  yAccessor,
  mapping,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  orientation = 'vertical',
  colors = ['#3b82f6'],
  animate = false,
  interactive = true,
  showTooltip = true,
  tooltipFormat,
  className,
  onDataClick,
  onHover,
  ...props
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<D3BarChart | null>(null);

  useEffect(() => {
    if (containerRef.current && data) {
      const config: BarChartConfig = {
        data,
        xKey,
        yKey,
        xAccessor,
        yAccessor,
        mapping,
        width,
        height,
        margin,
        orientation,
        colors,
        animate,
        interactive,
        showTooltip,
        tooltipFormat,
        onDataClick,
        onHover,
      };

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new D3BarChart(containerRef.current, config);
      } else {
        chartInstanceRef.current.update(config);
      }
    }
  }, [
    data, xKey, yKey, xAccessor, yAccessor, mapping, width, height, margin,
    orientation, colors, animate, interactive, showTooltip, tooltipFormat,
    onDataClick, onHover
  ]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  if (!data?.length) {
    return (
      <div className={cn('bar-chart-container', className)} {...props}>
        <div className="empty-state" style={{ width, height }}>
          <p>無資料可顯示</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('bar-chart-container', className)}
      style={{ width, height }}
      {...props}
    />
  );
}
