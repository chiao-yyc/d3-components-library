
import * as d3 from 'd3';
import { easeCubicOut } from 'd3';
import { FunnelChartConfig, ProcessedFunnelDataPoint, FunnelSegment } from './types';

const DEFAULT_COLORS = [
  '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554',
  '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'
];

export class D3FunnelChart {
  private container: HTMLElement;
  private config: Required<Omit<FunnelChartConfig, 'labelKey' | 'valueKey' | 'labelAccessor' | 'valueAccessor' | 'mapping' | 'tooltipFormat' | 'onSegmentClick' | 'onSegmentHover'> & FunnelChartConfig>;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private g: d3.Selection<SVGGElement, unknown, null, undefined>;
  private processedData: ProcessedFunnelDataPoint[] = [];
  private segments: FunnelSegment[] = [];
  private colorScale: d3.ScaleSequential<number, string> | d3.ScaleOrdinal<string, string> | null = null;

  constructor(container: HTMLElement, config: FunnelChartConfig) {
    this.container = container;
    const defaultConfig = {
      width: 400,
      height: 500,
      margin: { top: 20, right: 60, bottom: 20, left: 60 },
      direction: 'top' as const,
      shape: 'trapezoid' as const,
      gap: 4,
      cornerRadius: 0,
      proportionalMode: 'traditional' as const,
      shrinkageType: 'percentage' as const,
      shrinkageAmount: 0.1,
      minWidth: 50,
      colors: DEFAULT_COLORS,
      colorScheme: 'custom' as const,
      showLabels: true,
      showValues: true,
      showPercentages: true,
      showConversionRates: true,
      labelPosition: 'side' as const,
      fontSize: 12,
      fontFamily: 'sans-serif',
      animate: true,
      animationDuration: 800,
      animationDelay: 100,
      animationEasing: 'easeCubicOut',
      interactive: true,
      showTooltip: true,
    };

    this.config = { ...defaultConfig, ...config };
    this.svg = d3.select(this.container).append('svg');
    this.g = this.svg.append('g');
    this.update(this.config);
  }

  private processData() {
    const { data, mapping, labelAccessor, valueAccessor, labelKey, valueKey } = this.config;
    if (!data?.length) {
      this.processedData = [];
      return;
    }

    this.processedData = data.map((d, index) => {
      let label: string, value: number;

      if (mapping) {
        label = typeof mapping.label === 'function' ? mapping.label(d) : String(d[mapping.label]);
        value = typeof mapping.value === 'function' ? mapping.value(d) : Number(d[mapping.value]) || 0;
      } else if (labelAccessor && valueAccessor) {
        label = labelAccessor(d);
        value = valueAccessor(d);
      } else if (labelKey && valueKey) {
        label = String(d[labelKey]);
        value = Number(d[valueKey]) || 0;
      } else {
        const keys = Object.keys(d);
        label = String(d[keys[0]]);
        value = Number(d[keys[1]]) || 0;
      }

      return {
        label, value, percentage: 0, originalData: d, index
      } as ProcessedFunnelDataPoint;
    }).filter(d => d.value > 0);

    const maxValue = Math.max(...this.processedData.map(d => d.value));
    this.processedData.forEach((d, i) => {
      d.percentage = (d.value / maxValue) * 100;
      d.conversionRate = i === 0 ? 100 : (d.value / this.processedData[i - 1].value) * 100;
    });
  }

  private setupColorScale() {
    const { colors, colorScheme } = this.config;
    if (colorScheme !== 'custom') {
      const schemes = {
        blues: d3.interpolateBlues,
        greens: d3.interpolateGreens,
        oranges: d3.interpolateOranges,
        reds: d3.interpolateReds,
        purples: d3.interpolatePurples
      };
      this.colorScale = d3.scaleSequential(schemes[colorScheme]).domain([0, this.processedData.length - 1]);
    } else {
      this.colorScale = d3.scaleOrdinal(colors).domain(this.processedData.map((d, i) => i.toString()));
    }
  }

  private calculateSegments() {
    const { width, height, margin, direction, shape, gap, cornerRadius, proportionalMode, shrinkageType, shrinkageAmount, minWidth } = this.config;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    let currentY = 0;
    const segmentWidths: number[] = [];

    if (proportionalMode === 'consistent') {
      const startWidth = chartWidth * 0.9;
      for (let i = 0; i < this.processedData.length; i++) {
        let topWidth: number;
        let bottomWidth: number;
        if (i === 0) {
          topWidth = startWidth;
        } else {
          topWidth = segmentWidths[(i - 1) * 2 + 1];
        }
        let shrinkage: number;
        if (shrinkageType === 'fixed') {
          shrinkage = shrinkageAmount;
        } else if (shrinkageType === 'percentage') {
          shrinkage = topWidth * shrinkageAmount;
        } else {
          if (i < this.processedData.length - 1) {
            const currentValue = this.processedData[i].value;
            const nextValue = this.processedData[i + 1].value;
            const shrinkageRatio = 1 - (nextValue / currentValue);
            shrinkage = topWidth * Math.max(0.05, Math.min(0.3, shrinkageRatio));
          } else {
            shrinkage = topWidth * 0.2;
          }
        }
        bottomWidth = Math.max(minWidth, topWidth - shrinkage);
        segmentWidths[i * 2] = topWidth;
        segmentWidths[i * 2 + 1] = bottomWidth;
      }
    }

    this.segments = this.processedData.map((d, i) => {
      let currentHeight: number;
      let segmentWidth: number;

      if (proportionalMode === 'traditional') {
        currentHeight = (chartHeight - gap * (this.processedData.length - 1)) / this.processedData.length;
        segmentWidth = (d.percentage / 100) * chartWidth;
      } else if (proportionalMode === 'height') {
        const totalHeight = chartHeight - gap * (this.processedData.length - 1);
        const totalValue = this.processedData.reduce((sum, d) => sum + d.value, 0);
        currentHeight = (d.value / totalValue) * totalHeight;
        const maxWidth = chartWidth * 0.9;
        const minWidth = chartWidth * 0.3;
        const widthRange = maxWidth - minWidth;
        segmentWidth = maxWidth - (i / (this.processedData.length - 1)) * widthRange;
      } else if (proportionalMode === 'consistent') {
        currentHeight = (chartHeight - gap * (this.processedData.length - 1)) / this.processedData.length;
        segmentWidth = segmentWidths[i * 2];
      } else {
        const totalHeight = chartHeight - gap * (this.processedData.length - 1);
        const totalValue = this.processedData.reduce((sum, d) => sum + d.value, 0);
        const targetAreaRatio = d.value / totalValue;
        const totalArea = chartWidth * totalHeight * 0.7;
        const targetArea = targetAreaRatio * totalArea;
        const maxWidth = chartWidth * 0.9;
        const minWidth = chartWidth * 0.3;
        const widthRange = maxWidth - minWidth;
        const topWidth = maxWidth - (i / (this.processedData.length - 1)) * widthRange;
        const bottomWidth = i < this.processedData.length - 1 ? maxWidth - ((i + 1) / (this.processedData.length - 1)) * widthRange : topWidth * 0.8;
        const avgWidth = (topWidth + bottomWidth) / 2;
        currentHeight = targetArea / avgWidth;
        segmentWidth = topWidth;
      }

      const baseX = (chartWidth - segmentWidth) / 2;
      const baseY = currentY;

      const transformed = this.transformCoordinates(baseX, baseY, segmentWidth, currentHeight, chartWidth, chartHeight);
      const x = transformed.x;
      const y = transformed.y;
      const finalWidth = transformed.width;
      const finalHeight = transformed.height;

      currentY += currentHeight + gap;

      let path = '';
      if (shape === 'trapezoid') {
        let nextWidth: number;
        if (proportionalMode === 'traditional') {
          nextWidth = i < this.processedData.length - 1 ? (this.processedData[i + 1].percentage / 100) * chartWidth : segmentWidth * 0.8;
        } else if (proportionalMode === 'consistent') {
          nextWidth = segmentWidths[i * 2 + 1];
        } else if (proportionalMode === 'height') {
          const maxWidth = chartWidth * 0.9;
          const minWidth = chartWidth * 0.3;
          const widthRange = maxWidth - minWidth;
          nextWidth = i < this.processedData.length - 1 ? maxWidth - ((i + 1) / (this.processedData.length - 1)) * widthRange : segmentWidth * 0.8;
        } else {
          const maxWidth = chartWidth * 0.9;
          const minWidth = chartWidth * 0.3;
          const widthRange = maxWidth - minWidth;
          nextWidth = i < this.processedData.length - 1 ? maxWidth - ((i + 1) / (this.processedData.length - 1)) * widthRange : segmentWidth * 0.8;
        }

        if (direction === 'top') {
          const x1 = x;
          const x2 = x + finalWidth;
          const x3 = x + (finalWidth - nextWidth) / 2 + nextWidth;
          const x4 = x + (finalWidth - nextWidth) / 2;
          const y1 = y;
          const y2 = y + finalHeight;
          if (cornerRadius > 0) {
            path = `M ${x1 + cornerRadius} ${y1} L ${x2 - cornerRadius} ${y1} Q ${x2} ${y1} ${x2} ${y1 + cornerRadius} L ${x3} ${y2 - cornerRadius} Q ${x3} ${y2} ${x3 - cornerRadius} ${y2} L ${x4 + cornerRadius} ${y2} Q ${x4} ${y2} ${x4} ${y2 - cornerRadius} L ${x1} ${y1 + cornerRadius} Q ${x1} ${y1} ${x1 + cornerRadius} ${y1} Z`;
          } else {
            path = `M ${x1} ${y1} L ${x2} ${y1} L ${x3} ${y2} L ${x4} ${y2} Z`;
          }
        } else if (direction === 'bottom') {
          const x1 = x + (finalWidth - nextWidth) / 2;
          const x2 = x + (finalWidth - nextWidth) / 2 + nextWidth;
          const x3 = x + finalWidth;
          const x4 = x;
          const y1 = y;
          const y2 = y + finalHeight;
          if (cornerRadius > 0) {
            path = `M ${x1 + cornerRadius} ${y1} L ${x2 - cornerRadius} ${y1} Q ${x2} ${y1} ${x2} ${y1 + cornerRadius} L ${x3} ${y2 - cornerRadius} Q ${x3} ${y2} ${x3 - cornerRadius} ${y2} L ${x4 + cornerRadius} ${y2} Q ${x4} ${y2} ${x4} ${y2 - cornerRadius} L ${x1} ${y1 + cornerRadius} Q ${x1} ${y1} ${x1 + cornerRadius} ${y1} Z`;
          } else {
            path = `M ${x1} ${y1} L ${x2} ${y1} L ${x3} ${y2} L ${x4} ${y2} Z`;
          }
        } else {
          if (cornerRadius > 0) {
            path = `M ${x + cornerRadius} ${y} L ${x + finalWidth - cornerRadius} ${y} Q ${x + finalWidth} ${y} ${x + finalWidth} ${y + cornerRadius} L ${x + finalWidth} ${y + finalHeight - cornerRadius} Q ${x + finalWidth} ${y + finalHeight} ${x + finalWidth - cornerRadius} ${y + finalHeight} L ${x + cornerRadius} ${y + finalHeight} Q ${x} ${y + finalHeight} ${x} ${y + finalHeight - cornerRadius} L ${x} ${y + cornerRadius} Q ${x} ${y} ${x + cornerRadius} ${y} Z`;
          } else {
            path = `M ${x} ${y} L ${x + finalWidth} ${y} L ${x + finalWidth} ${y + finalHeight} L ${x} ${y + finalHeight} Z`;
          }
        }
      } else if (shape === 'rectangle') {
        if (cornerRadius > 0) {
          path = `M ${x + cornerRadius} ${y} L ${x + finalWidth - cornerRadius} ${y} Q ${x + finalWidth} ${y} ${x + finalWidth} ${y + cornerRadius} L ${x + finalWidth} ${y + finalHeight - cornerRadius} Q ${x + finalWidth} ${y + finalHeight} ${x + finalWidth - cornerRadius} ${y + finalHeight} L ${x + cornerRadius} ${y + finalHeight} Q ${x} ${y + finalHeight} ${x} ${y + finalHeight - cornerRadius} L ${x} ${y + cornerRadius} Q ${x} ${y} ${x + cornerRadius} ${y} Z`;
        } else {
          path = `M ${x} ${y} L ${x + finalWidth} ${y} L ${x + finalWidth} ${y + finalHeight} L ${x} ${y + finalHeight} Z`;
        }
      } else if (shape === 'curved') {
        let nextWidth: number;
        if (proportionalMode === 'traditional') {
          nextWidth = i < this.processedData.length - 1 ? (this.processedData[i + 1].percentage / 100) * chartWidth : segmentWidth * 0.8;
        } else if (proportionalMode === 'consistent') {
          nextWidth = segmentWidths[i * 2 + 1];
        } else {
          const maxWidth = chartWidth * 0.9;
          const minWidth = chartWidth * 0.3;
          const widthRange = maxWidth - minWidth;
          nextWidth = i < this.processedData.length - 1 ? maxWidth - ((i + 1) / (this.processedData.length - 1)) * widthRange : segmentWidth * 0.8;
        }
        const x1 = (chartWidth - segmentWidth) / 2;
        const x2 = (chartWidth + segmentWidth) / 2;
        const x3 = (chartWidth + nextWidth) / 2;
        const x4 = (chartWidth - nextWidth) / 2;
        const y1 = y;
        const y2 = y + finalHeight;
        const midY = y + finalHeight / 2;
        path = `M ${x1} ${y1} L ${x2} ${y1} Q ${x2 + 10} ${midY} ${x3} ${y2} L ${x4} ${y2} Q ${x1 - 10} ${midY} ${x1} ${y1} Z`;
      }

      return {
        label: d.label,
        value: d.value,
        percentage: d.percentage,
        conversionRate: d.conversionRate || 100,
        color: this.colorScale ? (typeof this.colorScale === 'function' ? this.colorScale(i) : this.colorScale(i.toString())) : this.config.colors[i % this.config.colors.length],
        x,
        y,
        width: finalWidth,
        height: finalHeight,
        path,
        index: i
      } as FunnelSegment;
    });
  }

  private transformCoordinates(x: number, y: number, width: number, height: number, chartWidth: number, chartHeight: number) {
    const { direction } = this.config;
    switch (direction) {
      case 'top':
        return { x, y, width, height };
      case 'bottom':
        return { x, y: chartHeight - y - height, width, height };
      case 'left':
        return { x: y, y: chartWidth - x - width, width: height, height: width };
      case 'right':
        return { x: chartHeight - y - height, y: x, width: height, height: width };
      default:
        return { x, y, width, height };
    }
  }

  public render() {
    const { width, height, margin, animate, animationDuration, animationDelay, animationEasing, interactive, showLabels, showValues, showPercentages, showConversionRates, labelPosition, fontSize, fontFamily } = this.config;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    this.svg.attr('width', width).attr('height', height);
    this.g.attr('transform', `translate(${margin.left}, ${margin.top})`);
    this.g.selectAll('*').remove();

    const segmentGroups = this.g.selectAll('.funnel-segment').data(this.segments).enter().append('g')
      .attr('class', 'funnel-segment');

    const paths = segmentGroups.append('path')
      .attr('d', d => d.path)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    if (animate) {
      paths.style('opacity', 0).attr('transform', 'scale(0.8)').transition().duration(animationDuration).delay((d, i) => i * animationDelay).ease(easeCubicOut).style('opacity', 1).attr('transform', 'scale(1)');
    }

    if (interactive) {
      segmentGroups.style('cursor', 'pointer')
        .on('click', (event, d) => this.config.onSegmentClick?.(d))
        .on('mouseenter', (event, d) => this.config.onSegmentHover?.(d))
        .on('mouseleave', (event, d) => this.config.onSegmentHover?.(null));
    }

    if (showLabels || showValues || showPercentages || showConversionRates) {
      this.segments.forEach((segment, i) => {
        const labelGroup = this.g.append('g').attr('class', 'segment-labels');

        let textX = 0;
        let textY = segment.y + segment.height / 2;
        let anchor = 'middle';

        if (labelPosition === 'side') {
          if (this.config.direction === 'top' || this.config.direction === 'bottom') {
            textX = chartWidth + 10;
            textY = segment.y + segment.height / 2;
            anchor = 'start';
          } else {
            textX = chartWidth + 10;
            textY = 50 + (i * 80);
            anchor = 'start';
          }
        } else if (labelPosition === 'outside') {
          if (this.config.direction === 'top') {
            textX = segment.x + segment.width / 2;
            textY = segment.y - 10;
            anchor = 'middle';
          } else if (this.config.direction === 'bottom') {
            textX = segment.x + segment.width / 2;
            textY = segment.y + segment.height + 20;
            anchor = 'middle';
          } else if (this.config.direction === 'left') {
            textX = segment.x - 10;
            textY = segment.y + segment.height / 2;
            anchor = 'end';
          } else {
            textX = segment.x + segment.width + 10;
            textY = segment.y + segment.height / 2;
            anchor = 'start';
          }
        } else if (labelPosition === 'inside') {
          textX = segment.x + segment.width / 2;
          textY = segment.y + segment.height / 2;
          anchor = 'middle';
        }

        let yOffset = 0;
        const isHorizontal = this.config.direction === 'left' || this.config.direction === 'right';

        if (showLabels) {
          labelGroup.append('text').attr('x', textX).attr('y', textY + yOffset).attr('text-anchor', anchor).attr('dominant-baseline', 'central').style('font-size', `${fontSize}px`).style('font-family', fontFamily).style('font-weight', 'bold').style('fill', labelPosition === 'inside' ? '#fff' : '#374151').text(segment.label);
          yOffset += fontSize + 2;
        }

        if (showValues) {
          labelGroup.append('text').attr('x', textX).attr('y', textY + yOffset).attr('text-anchor', anchor).attr('dominant-baseline', 'central').style('font-size', `${fontSize - 1}px`).style('font-family', fontFamily).style('fill', labelPosition === 'inside' ? '#fff' : '#6b7280').text(this.config.valueFormat ? this.config.valueFormat(segment.value) : segment.value.toLocaleString());
          yOffset += fontSize + 1;
        }

        if (showPercentages) {
          labelGroup.append('text').attr('x', textX).attr('y', textY + yOffset).attr('text-anchor', anchor).attr('dominant-baseline', 'central').style('font-size', `${fontSize - 1}px`).style('font-family', fontFamily).style('fill', labelPosition === 'inside' ? '#fff' : '#6b7280').text(this.config.percentageFormat ? this.config.percentageFormat(segment.percentage) : `${segment.percentage.toFixed(1)}%`);
          yOffset += fontSize + 1;
        }

        if (showConversionRates && i > 0) {
          labelGroup.append('text').attr('x', textX).attr('y', textY + yOffset).attr('text-anchor', anchor).attr('dominant-baseline', 'central').style('font-size', `${fontSize - 2}px`).style('font-family', fontFamily).style('fill', labelPosition === 'inside' ? '#fff' : '#9ca3af').text(this.config.conversionRateFormat ? this.config.conversionRateFormat(segment.conversionRate) : `${segment.conversionRate.toFixed(1)}%`);
        }
      });
    }
  }

  public update(newConfig: Partial<FunnelChartConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.processData();
    this.setupColorScale();
    this.calculateSegments();
    this.render();
  }

  public destroy() {
    d3.select(this.container).select('svg').remove();
  }
}
