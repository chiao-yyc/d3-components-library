/**
 * FunnelChartCore 測試
 * 測試漏斗圖核心邏輯和功能
 */

import { FunnelChartCore, FunnelChartCoreConfig, FunnelChartData } from './funnel-chart-core';
import { ChartStateCallbacks } from '../../../core/types';
import { 
  setupChartTest,
  TestAssertions,
  TestEventUtils,
  TestAsyncUtils 
} from '../../../core/test-utils';

describe('FunnelChartCore', () => {
  let testSetup: ReturnType<typeof setupChartTest>;
  let mockCallbacks: jest.Mocked<ChartStateCallbacks>;
  let testData: FunnelChartData[];
  let config: FunnelChartCoreConfig;

  beforeEach(() => {
    testSetup = setupChartTest();
    
    mockCallbacks = {
      onError: jest.fn(),
      onLoadingChange: jest.fn(),
      onTooltipShow: jest.fn(),
      onTooltipHide: jest.fn()
    };

    testData = [
      { label: 'Visitors', value: 1000 },
      { label: 'Sign-ups', value: 800 },
      { label: 'Purchases', value: 600 },
      { label: 'Repeat Customers', value: 400 }
    ];

    config = {
      data: testData,
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 50 },
      labelKey: 'label',
      valueKey: 'value',
      direction: 'top',
      shape: 'trapezoid',
      gap: 4,
      showLabels: true,
      showValues: true,
      animate: true,
      interactive: true
    };
  });

  afterEach(() => {
    testSetup.cleanup();
  });

  describe('基礎功能測試', () => {
    it('應該正確初始化漏斗圖核心', () => {
      const funnelCore = new FunnelChartCore(config, mockCallbacks);
      
      expect(funnelCore).toBeInstanceOf(FunnelChartCore);
      expect(funnelCore.getChartType()).toBe('funnel-chart');
    });

    it('應該正確處理數據', () => {
      const funnelCore = new FunnelChartCore(config, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const processedData = funnelCore.getFunnelDataPoints();
      
      expect(processedData).toHaveLength(4);
      expect(processedData[0]).toEqual(
        expect.objectContaining({
          label: 'Visitors',
          value: 1000,
          percentage: 25, // 1000 / 4000 * 100
        })
      );
    });

    it('應該正確計算百分比', () => {
      const funnelCore = new FunnelChartCore(config, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const processedData = funnelCore.getFunnelDataPoints();
      const totalValue = testData.reduce((sum, d) => sum + d.value, 0);
      
      processedData.forEach((dataPoint, index) => {
        const expectedPercentage = (testData[index].value / totalValue) * 100;
        expect(dataPoint.percentage).toBeCloseTo(expectedPercentage, 1);
      });
    });

    it('應該正確計算轉換率', () => {
      const funnelCore = new FunnelChartCore(config, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const processedData = funnelCore.getFunnelDataPoints();
      
      // 第一個項目沒有轉換率
      expect(processedData[0].conversionRate).toBe(0);
      
      // 其他項目應該有正確的轉換率
      expect(processedData[1].conversionRate).toBeCloseTo(80, 1); // 800/1000 * 100
      expect(processedData[2].conversionRate).toBeCloseTo(75, 1); // 600/800 * 100
      expect(processedData[3].conversionRate).toBeCloseTo(66.67, 1); // 400/600 * 100
    });
  });

  describe('渲染測試', () => {
    it('應該正確渲染漏斗段', () => {
      const funnelCore = new FunnelChartCore(config, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      TestAssertions.expectDataPointCount(testSetup.svg, '.funnel-segment', 4);
      
      const segments = testSetup.svg.querySelectorAll('.funnel-segment');
      segments.forEach(segment => {
        TestAssertions.expectSVGAttribute(segment as SVGElement, 'd'); // 路徑屬性
        TestAssertions.expectSVGAttribute(segment as SVGElement, 'fill');
      });
    });

    it('應該正確渲染標籤', () => {
      const funnelCore = new FunnelChartCore({
        ...config,
        showLabels: true
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const labels = testSetup.svg.querySelectorAll('.funnel-labels text');
      expect(labels.length).toBeGreaterThan(0);
      
      // 驗證標籤文字
      const firstLabel = labels[0] as SVGTextElement;
      expect(firstLabel.textContent).toBe('Visitors');
    });

    it('應該根據配置隱藏標籤', () => {
      const funnelCore = new FunnelChartCore({
        ...config,
        showLabels: false
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const labelsGroup = testSetup.svg.querySelector('.funnel-labels');
      expect(labelsGroup).not.toBeInTheDocument();
    });

    it('應該正確設置顏色', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
      const funnelCore = new FunnelChartCore({
        ...config,
        colors: customColors
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const segments = testSetup.svg.querySelectorAll('.funnel-segment');
      segments.forEach((segment, index) => {
        TestAssertions.expectSVGAttribute(segment as SVGElement, 'fill', customColors[index]);
      });
    });
  });

  describe('形狀和配置測試', () => {
    it('應該支持矩形形狀', () => {
      const funnelCore = new FunnelChartCore({
        ...config,
        shape: 'rectangle'
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const segments = testSetup.svg.querySelectorAll('.funnel-segment');
      segments.forEach(segment => {
        const pathData = segment.getAttribute('d');
        expect(pathData).toBeDefined();
        // 矩形路徑應該包含直角
        expect(pathData).toMatch(/L.*L.*L.*Z/);
      });
    });

    it('應該支持梯形形狀', () => {
      const funnelCore = new FunnelChartCore({
        ...config,
        shape: 'trapezoid'
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const segments = testSetup.svg.querySelectorAll('.funnel-segment');
      expect(segments).toHaveLength(4);
      
      // 梯形應該有不同的頂部和底部寬度
      const segmentsData = funnelCore.getSegments();
      segmentsData.forEach(segment => {
        if (segment.index < segmentsData.length - 1) {
          expect(segment.topWidth).not.toBe(segment.bottomWidth);
        }
      });
    });

    it('應該支持不同的比例模式', () => {
      const equalModeFunnel = new FunnelChartCore({
        ...config,
        proportionalMode: 'equal'
      }, mockCallbacks);
      equalModeFunnel.initialize(testSetup.container, testSetup.svg);
      
      const equalModeSegments = equalModeFunnel.getSegments();
      
      // equal 模式下，所有段的頂部寬度應該相同
      const firstTopWidth = equalModeSegments[0].topWidth;
      equalModeSegments.forEach(segment => {
        expect(segment.topWidth).toBe(firstTopWidth);
      });
    });

    it('應該支持自定義間隙', () => {
      const customGap = 10;
      const funnelCore = new FunnelChartCore({
        ...config,
        gap: customGap
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const segments = funnelCore.getSegments();
      
      // 驗證段之間的間隙
      for (let i = 1; i < segments.length; i++) {
        const prevSegmentBottom = segments[i - 1].y + segments[i - 1].height;
        const currentSegmentTop = segments[i].y;
        expect(currentSegmentTop - prevSegmentBottom).toBe(customGap);
      }
    });
  });

  describe('數據存取器測試', () => {
    it('應該支持函數式數據存取器', () => {
      const funnelCore = new FunnelChartCore({
        ...config,
        labelKey: (d) => d.label?.toUpperCase() || 'UNKNOWN',
        valueKey: (d) => (d.value || 0) * 2
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const processedData = funnelCore.getFunnelDataPoints();
      
      expect(processedData[0].label).toBe('VISITORS');
      expect(processedData[0].value).toBe(2000); // 1000 * 2
    });

    it('應該處理缺失的數據鍵', () => {
      const incompleteData = [
        { label: 'A' }, // 沒有 value
        { value: 100 }, // 沒有 label
        {} // 空對象
      ];

      const funnelCore = new FunnelChartCore({
        ...config,
        data: incompleteData
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const processedData = funnelCore.getFunnelDataPoints();
      
      expect(processedData[0].label).toBe('A');
      expect(processedData[0].value).toBe(0); // 預設值
      
      expect(processedData[1].label).toBe('Item 2'); // 自動生成的標籤
      expect(processedData[1].value).toBe(100);
      
      expect(processedData[2].label).toBe('Item 3');
      expect(processedData[2].value).toBe(0);
    });
  });

  describe('交互功能測試', () => {
    it('應該響應點擊事件', () => {
      const onSegmentClick = jest.fn();
      const funnelCore = new FunnelChartCore({
        ...config,
        onSegmentClick
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const firstSegment = testSetup.svg.querySelector('.funnel-segment') as SVGElement;
      const clickEvent = TestEventUtils.createMouseEvent('click', {
        clientX: 100,
        clientY: 100
      });
      
      firstSegment.dispatchEvent(clickEvent);
      
      expect(onSegmentClick).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Visitors',
          value: 1000
        }),
        expect.any(MouseEvent)
      );
    });

    it('應該響應滑鼠懸停事件', () => {
      const onSegmentHover = jest.fn();
      const funnelCore = new FunnelChartCore({
        ...config,
        onSegmentHover
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const firstSegment = testSetup.svg.querySelector('.funnel-segment') as SVGElement;
      const hoverEvent = TestEventUtils.createMouseEvent('mouseover', {
        clientX: 100,
        clientY: 100
      });
      
      firstSegment.dispatchEvent(hoverEvent);
      
      expect(onSegmentHover).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Visitors',
          value: 1000
        }),
        expect.any(MouseEvent)
      );
      
      expect(mockCallbacks.onTooltipShow).toHaveBeenCalled();
    });

    it('應該在滑鼠離開時隱藏工具提示', () => {
      const onSegmentHover = jest.fn();
      const funnelCore = new FunnelChartCore({
        ...config,
        onSegmentHover
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const firstSegment = testSetup.svg.querySelector('.funnel-segment') as SVGElement;
      const mouseOutEvent = TestEventUtils.createMouseEvent('mouseout');
      
      firstSegment.dispatchEvent(mouseOutEvent);
      
      expect(onSegmentHover).toHaveBeenCalledWith(null, expect.any(MouseEvent));
      expect(mockCallbacks.onTooltipHide).toHaveBeenCalled();
    });

    it('應該在非交互模式下禁用事件', () => {
      const onSegmentClick = jest.fn();
      const funnelCore = new FunnelChartCore({
        ...config,
        interactive: false,
        onSegmentClick
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const segments = testSetup.svg.querySelectorAll('.funnel-segment');
      segments.forEach(segment => {
        expect(segment).toHaveStyle('cursor: default');
      });
    });
  });

  describe('動畫測試', () => {
    it('應該支持動畫', async () => {
      const funnelCore = new FunnelChartCore({
        ...config,
        animate: true,
        animationDuration: 100
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const segments = testSetup.svg.querySelectorAll('.funnel-segment');
      
      // 初始狀態應該是透明的
      segments.forEach(segment => {
        const opacity = segment.getAttribute('opacity');
        expect(opacity).toBe('0');
      });
      
      // 等待動畫完成
      await TestAsyncUtils.waitForAnimation(150);
      
      // 動畫完成後應該是不透明的
      segments.forEach(segment => {
        const opacity = segment.getAttribute('opacity');
        expect(opacity).toBe('1');
      });
    });

    it('應該支持禁用動畫', () => {
      const funnelCore = new FunnelChartCore({
        ...config,
        animate: false
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const segments = testSetup.svg.querySelectorAll('.funnel-segment');
      
      // 沒有動畫時，透明度應該直接是 1
      segments.forEach(segment => {
        const opacity = segment.getAttribute('opacity');
        expect(opacity).toBe(null); // 沒有設置 opacity 屬性
      });
    });
  });

  describe('格式化功能測試', () => {
    it('應該支持自定義數值格式化', () => {
      const valueFormat = (value: number) => `$${value.toLocaleString()}`;
      
      const funnelCore = new FunnelChartCore({
        ...config,
        valueFormat,
        showValues: true
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      // 觸發工具提示來測試格式化
      const firstSegment = testSetup.svg.querySelector('.funnel-segment') as SVGElement;
      const hoverEvent = TestEventUtils.createMouseEvent('mouseover', {
        pageX: 100,
        pageY: 100
      });
      
      firstSegment.dispatchEvent(hoverEvent);
      
      expect(mockCallbacks.onTooltipShow).toHaveBeenCalledWith(
        100, 100, 'Visitors: $1,000'
      );
    });

    it('應該支持自定義百分比格式化', () => {
      const percentageFormat = (percentage: number) => `${percentage.toFixed(2)}%`;
      
      const funnelCore = new FunnelChartCore({
        ...config,
        percentageFormat,
        showPercentages: true
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const labels = testSetup.svg.querySelectorAll('.funnel-labels text');
      
      // 檢查是否有格式化的百分比文字
      let foundPercentageLabel = false;
      labels.forEach(label => {
        if (label.textContent?.includes('.00%')) {
          foundPercentageLabel = true;
        }
      });
      
      expect(foundPercentageLabel).toBe(true);
    });
  });

  describe('錯誤處理測試', () => {
    it('應該處理空數據', () => {
      const funnelCore = new FunnelChartCore({
        ...config,
        data: []
      }, mockCallbacks);
      
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      expect(mockCallbacks.onError).toHaveBeenCalled();
      expect(funnelCore.getFunnelDataPoints()).toHaveLength(0);
      expect(funnelCore.getSegments()).toHaveLength(0);
    });

    it('應該處理無效數值', () => {
      const invalidData = [
        { label: 'A', value: 'invalid' as any },
        { label: 'B', value: null as any },
        { label: 'C', value: undefined as any }
      ];
      
      const funnelCore = new FunnelChartCore({
        ...config,
        data: invalidData
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const processedData = funnelCore.getFunnelDataPoints();
      
      // 無效值應該被轉換為 0
      expect(processedData[0].value).toBe(0);
      expect(processedData[1].value).toBe(0);
      expect(processedData[2].value).toBe(0);
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理單個數據項', () => {
      const funnelCore = new FunnelChartCore({
        ...config,
        data: [{ label: 'Single', value: 100 }]
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      TestAssertions.expectDataPointCount(testSetup.svg, '.funnel-segment', 1);
      
      const processedData = funnelCore.getFunnelDataPoints();
      expect(processedData[0].percentage).toBe(100);
      expect(processedData[0].conversionRate).toBe(0);
    });

    it('應該處理相同數值', () => {
      const equalValueData = [
        { label: 'A', value: 50 },
        { label: 'B', value: 50 },
        { label: 'C', value: 50 }
      ];
      
      const funnelCore = new FunnelChartCore({
        ...config,
        data: equalValueData
      }, mockCallbacks);
      funnelCore.initialize(testSetup.container, testSetup.svg);
      
      const processedData = funnelCore.getFunnelDataPoints();
      
      processedData.forEach(dataPoint => {
        expect(dataPoint.percentage).toBeCloseTo(33.33, 1);
      });
      
      expect(processedData[1].conversionRate).toBe(100);
      expect(processedData[2].conversionRate).toBe(100);
    });
  });
});