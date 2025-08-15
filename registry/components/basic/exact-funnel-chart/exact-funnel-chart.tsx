import React, { useRef, useEffect } from 'react';
import { ExactFunnelChart, ExactFunnelConfig, ExactFunnelData } from './exact-funnel';

interface ExactFunnelChartProps extends Omit<ExactFunnelConfig, 'data'> {
  data: ExactFunnelData[];
  className?: string;
  style?: React.CSSProperties;
}

export function ExactFunnelChartComponent({
  data,
  width = 600,
  height = 300,
  background = '#2a2a2a',
  gradient1 = '#FF6B6B',
  gradient2 = '#4ECDC4',
  values = '#ffffff',
  labels = '#cccccc',
  percentages = '#888888',
  className,
  style,
  ...props
}: ExactFunnelChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ExactFunnelChart | null>(null);

  useEffect(() => {
    if (containerRef.current && data) {
      const config: ExactFunnelConfig = {
        data,
        width,
        height,
        background,
        gradient1,
        gradient2,
        values,
        labels,
        percentages,
      };

      if (!chartInstanceRef.current) {
        chartInstanceRef.current = new ExactFunnelChart(containerRef.current, config);
      } else {
        chartInstanceRef.current.update(config);
      }
    }
  }, [data, width, height, background, gradient1, gradient2, values, labels, percentages]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ 
        width: width || '100%', 
        height: height || 300,
        ...style 
      }}
      {...props}
    />
  );
}