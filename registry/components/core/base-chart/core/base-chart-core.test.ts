/**
 * BaseChartCore 核心測試
 * 測試框架無關的圖表核心邏輯
 */

import { BaseChartCore } from './base-chart-core';
import { 
  BaseChartCoreConfig, 
  ChartStateCallbacks, 
  ChartData, 
  BaseChartData 
} from '../../types';
import { 
  TestDataGenerator, 
  MockDOMUtils, 
  setupChartTest,
  TestAssertions,
  TestAsyncUtils
} from '../../test-utils';

// === 測試用的具體實現 ===

interface TestChartData extends BaseChartData {
  value: number;
  label: string;
}

class TestChartCore extends BaseChartCore<TestChartData> {
  private testScales: any = {};
  
  public getChartType(): string {
    return 'test-chart';
  }

  protected processData(): ChartData<TestChartData>[] {
    if (!this.validateData()) {
      return [];
    }
    
    // 簡單的數據處理：確保所有項目都有 value 和 label
    return this.config.data.map((item, index) => ({
      ...item,
      value: typeof item.value === 'number' ? item.value : 0,
      label: item.label || `Item ${index + 1}`
    }));
  }

  protected createScales(): Record<string, any> {
    // 創建測試用比例尺
    this.testScales = {
      x: { domain: [0, 10], range: [0, 100] },
      y: { domain: [0, 100], range: [100, 0] }
    };
    
    return this.testScales;
  }

  protected renderChart(): void {
    const svg = this.createSVGContainer();
    const processedData = this.getProcessedData();
    
    if (!processedData || processedData.length === 0) {
      return;
    }

    // 渲染測試矩形
    svg.selectAll('.test-rect')
      .data(processedData)
      .enter()
      .append('rect')
      .attr('class', 'test-rect')
      .attr('data-testid', (d, i) => `test-rect-${i}`)
      .attr('x', (d, i) => i * 50)
      .attr('y', d => 100 - d.value)
      .attr('width', 40)
      .attr('height', d => d.value)
      .attr('fill', '#3b82f6');
  }

  // 公開測試方法
  public getTestScales() {
    return this.testScales;
  }
}

// === 測試套件 ===

describe('BaseChartCore', () => {
  let testSetup: ReturnType<typeof setupChartTest>;
  let mockCallbacks: jest.Mocked<ChartStateCallbacks>;
  let testData: ChartData<TestChartData>[];
  let config: BaseChartCoreConfig<TestChartData>;

  beforeEach(() => {
    testSetup = setupChartTest();
    
    mockCallbacks = {
      onError: jest.fn(),
      onLoadingChange: jest.fn(),
      onTooltipShow: jest.fn(),
      onTooltipHide: jest.fn()
    };

    testData = TestDataGenerator.generateNumericData({ 
      count: 5,
      minValue: 10,
      maxValue: 90 
    }).map(item => ({
      ...item,
      value: item.value as number,
      label: item.label as string
    }));

    config = {
      data: testData,
      width: 800,
      height: 400,
      margin: { top: 20, right: 30, bottom: 40, left: 50 },
      animate: true,
      animationDuration: 300,
      interactive: true
    };
  });

  afterEach(() => {
    testSetup.cleanup();
  });

  describe('基礎功能測試', () => {
    it('應該正確初始化圖表核心', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      
      expect(chartCore).toBeInstanceOf(BaseChartCore);
      expect(chartCore.getChartType()).toBe('test-chart');
    });

    it('應該正確設置配置', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      const retrievedConfig = chartCore.getConfig();
      
      expect(retrievedConfig.width).toBe(800);
      expect(retrievedConfig.height).toBe(400);
      expect(retrievedConfig.data).toEqual(testData);
      expect(retrievedConfig.animate).toBe(true);
    });

    it('應該正確計算圖表尺寸', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      const dimensions = (chartCore as any).getChartDimensions();
      
      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(400);
      expect(dimensions.chartWidth).toBe(720); // 800 - 50 - 30
      expect(dimensions.chartHeight).toBe(340); // 400 - 20 - 40
    });
  });

  describe('生命周期方法測試', () => {
    it('應該正確執行初始化流程', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      // 驗證載入狀態回調
      expect(mockCallbacks.onLoadingChange).toHaveBeenCalledWith(true);
      expect(mockCallbacks.onLoadingChange).toHaveBeenCalledWith(false);
      
      // 驗證 SVG 結構
      const chartArea = testSetup.svg.querySelector('.test-chart-chart');
      expect(chartArea).toBeInTheDocument();
      
      // 驗證 transform 屬性
      expect(chartArea).toHaveAttribute('transform', 'translate(50,20)');
    });

    it('應該正確處理配置更新', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      // 重置 mock
      mockCallbacks.onLoadingChange.mockClear();
      
      // 更新配置
      const newConfig = { ...config, width: 1000 };
      chartCore.updateConfig(newConfig);
      
      // 驗證更新流程
      expect(mockCallbacks.onLoadingChange).toHaveBeenCalledWith(true);
      expect(mockCallbacks.onLoadingChange).toHaveBeenCalledWith(false);
      
      // 驗證配置已更新
      expect(chartCore.getConfig().width).toBe(1000);
    });

    it('應該正確執行銷毀流程', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      // 確認圖表元素存在
      expect(testSetup.svg.querySelector('.test-chart-chart')).toBeInTheDocument();
      
      // 執行銷毀
      chartCore.destroy();
      
      // 驗證元素已清除
      expect(testSetup.svg.querySelector('.test-chart-chart')).not.toBeInTheDocument();
    });
  });

  describe('數據驗證測試', () => {
    it('應該拒絕空數據', () => {
      const emptyConfig = { ...config, data: [] };
      const chartCore = new TestChartCore(emptyConfig, mockCallbacks);
      
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid or empty data provided'
        })
      );
    });

    it('應該拒絕無效數據', () => {
      const invalidConfig = { 
        ...config, 
        data: [null, undefined, 'invalid'] as any 
      };
      const chartCore = new TestChartCore(invalidConfig, mockCallbacks);
      
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Data contains invalid items'
        })
      );
    });

    it('應該接受有效數據', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      expect(mockCallbacks.onError).not.toHaveBeenCalled();
      
      const processedData = chartCore.getProcessedData();
      expect(processedData).toHaveLength(5);
      expect(processedData![0]).toHaveProperty('value');
      expect(processedData![0]).toHaveProperty('label');
    });
  });

  describe('渲染測試', () => {
    it('應該正確渲染圖表元素', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      // 驗證測試矩形已渲染
      TestAssertions.expectDataPointCount(testSetup.svg, '.test-rect', 5);
      
      // 驗證每個矩形的屬性
      const rects = testSetup.svg.querySelectorAll('.test-rect');
      rects.forEach((rect, index) => {
        TestAssertions.expectSVGAttribute(rect as SVGElement, 'data-testid', `test-rect-${index}`);
        TestAssertions.expectSVGAttribute(rect as SVGElement, 'fill', '#3b82f6');
      });
    });

    it('應該正確設置測試 ID', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      TestAssertions.expectSVGAttribute(testSetup.svg, 'data-testid', 'chart-area');
    });
  });

  describe('錯誤處理測試', () => {
    it('應該處理初始化錯誤', () => {
      // 創建會在 processData 中拋出錯誤的配置
      const faultyConfig = {
        ...config,
        data: testData.map(item => ({ ...item, value: 'invalid' as any }))
      };

      const chartCore = new TestChartCore(faultyConfig, mockCallbacks);
      
      // 模擬初始化錯誤 - 覆蓋 processData 方法
      jest.spyOn(chartCore as any, 'processData').mockImplementation(() => {
        throw new Error('Processing error');
      });
      
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Processing error'
        })
      );
    });

    it('應該處理更新配置時的錯誤', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      // 重置 mock
      mockCallbacks.onError.mockClear();
      
      // 模擬更新時的錯誤
      jest.spyOn(chartCore as any, 'renderChart').mockImplementation(() => {
        throw new Error('Render error');
      });
      
      chartCore.updateConfig({ ...config, width: 1200 });
      
      expect(mockCallbacks.onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Render error'
        })
      );
    });
  });

  describe('回調函數測試', () => {
    it('應該正確觸發工具提示回調', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      // 手動觸發工具提示
      (chartCore as any).showTooltip(100, 200, 'Test tooltip');
      
      expect(mockCallbacks.onTooltipShow).toHaveBeenCalledWith(100, 200, 'Test tooltip');
    });

    it('應該正確觸發隱藏工具提示回調', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      // 手動隱藏工具提示
      (chartCore as any).hideTooltip();
      
      expect(mockCallbacks.onTooltipHide).toHaveBeenCalled();
    });
  });

  describe('比例尺測試', () => {
    it('應該正確創建比例尺', () => {
      const chartCore = new TestChartCore(config, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      const scales = (chartCore as TestChartCore).getTestScales();
      
      expect(scales).toHaveProperty('x');
      expect(scales).toHaveProperty('y');
      expect(scales.x.domain).toEqual([0, 10]);
      expect(scales.x.range).toEqual([0, 100]);
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理最小尺寸', () => {
      const smallConfig = {
        ...config,
        width: 100,
        height: 100,
        margin: { top: 10, right: 10, bottom: 10, left: 10 }
      };
      
      const chartCore = new TestChartCore(smallConfig, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      const dimensions = (chartCore as any).getChartDimensions();
      expect(dimensions.chartWidth).toBe(70); // 100 - 10 - 20
      expect(dimensions.chartHeight).toBe(80); // 100 - 10 - 10
    });

    it('應該處理單個數據點', () => {
      const singleDataConfig = {
        ...config,
        data: [{ value: 50, label: 'Single Item' }]
      };
      
      const chartCore = new TestChartCore(singleDataConfig, mockCallbacks);
      chartCore.initialize(testSetup.container, testSetup.svg);
      
      TestAssertions.expectDataPointCount(testSetup.svg, '.test-rect', 1);
    });
  });

  describe('性能測試', () => {
    it('應該在合理時間內處理大量數據', async () => {
      const largeData = TestDataGenerator.generateNumericData({ count: 1000 });
      const largeConfig = {
        ...config,
        data: largeData.map(item => ({
          ...item,
          value: item.value as number,
          label: item.label as string
        }))
      };
      
      const chartCore = new TestChartCore(largeConfig, mockCallbacks);
      
      const startTime = performance.now();
      chartCore.initialize(testSetup.container, testSetup.svg);
      const endTime = performance.now();
      
      // 初始化應該在 100ms 內完成
      expect(endTime - startTime).toBeLessThan(100);
      
      TestAssertions.expectDataPointCount(testSetup.svg, '.test-rect', 1000);
    });
  });
});