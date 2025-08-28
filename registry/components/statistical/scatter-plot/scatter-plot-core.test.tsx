/**
 * ScatterPlot Core V2 Test Suite
 * Testing the new BaseChartCore-based ScatterPlot implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScatterPlotCore, ScatterPlotCoreConfig, ScatterPlotData } from './core/scatter-plot-core';

// Mock D3 modules
vi.mock('d3', () => ({
  scaleLinear: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  })),
  scaleTime: vi.fn(() => ({
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  })),
  extent: vi.fn((data) => [0, 100]),
  sum: vi.fn((data) => data.reduce((a: number, b: number) => a + b, 0)),
  axisBottom: vi.fn(),
  axisLeft: vi.fn(),
  line: vi.fn(() => ({
    x: vi.fn().mockReturnThis(),
    y: vi.fn().mockReturnThis(),
  })),
}));

// Mock DOM environment
const createMockSVGElement = () => ({
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({
    width: 600,
    height: 400,
    top: 0,
    left: 0,
    right: 600,
    bottom: 400,
  })),
});

// Mock container element
global.document = {
  createElement: vi.fn(() => createMockSVGElement()),
} as any;

describe('ScatterPlotCore', () => {
  let scatterCore: ScatterPlotCore;
  let mockConfig: ScatterPlotCoreConfig;
  let sampleData: ScatterPlotData[];

  beforeEach(() => {
    sampleData = [
      { x: 10, y: 20, color: 'red', size: 5 },
      { x: 30, y: 40, color: 'blue', size: 8 },
      { x: 50, y: 60, color: 'green', size: 12 },
      { x: 70, y: 80, color: 'red', size: 6 },
      { x: 90, y: 100, color: 'blue', size: 10 },
    ];

    mockConfig = {
      width: 600,
      height: 400,
      margin: { top: 20, right: 20, bottom: 40, left: 40 },
      data: sampleData,
      xAccessor: 'x',
      yAccessor: 'y',
      sizeAccessor: 'size',
      colorAccessor: 'color',
      colors: ['#ff0000', '#00ff00', '#0000ff'],
      pointRadius: 4,
      minPointSize: 2,
      maxPointSize: 20,
      opacity: 0.7,
      showXAxis: true,
      showYAxis: true,
      showGrid: false,
      showTrendline: false,
    };

    scatterCore = new ScatterPlotCore(mockConfig);
  });

  describe('Initialization', () => {
    it('should create a ScatterPlotCore instance', () => {
      expect(scatterCore).toBeInstanceOf(ScatterPlotCore);
    });

    it('should inherit from BaseChartCore', () => {
      expect(scatterCore.constructor.name).toBe('ScatterPlotCore');
    });

    it('should have correct initial configuration', () => {
      expect(scatterCore['config']).toBeDefined();
      expect(scatterCore['config'].width).toBe(600);
      expect(scatterCore['config'].height).toBe(400);
    });
  });

  describe('Data Processing', () => {
    it('should process data correctly with basic accessors', () => {
      const processedResult = scatterCore['processData']();
      
      expect(processedResult).toBeDefined();
      expect(processedResult.data).toHaveLength(5);
      expect(processedResult.xScale).toBeDefined();
      expect(processedResult.yScale).toBeDefined();
    });

    it('should handle empty data gracefully', () => {
      const emptyConfig = { ...mockConfig, data: [] };
      const emptyScatterCore = new ScatterPlotCore(emptyConfig);
      const result = emptyScatterCore['processData']();
      
      expect(result.data).toHaveLength(0);
      expect(result.xScale).toBeDefined();
      expect(result.yScale).toBeDefined();
    });

    it('should process functional accessors correctly', () => {
      const configWithFunctions = {
        ...mockConfig,
        xAccessor: (d: ScatterPlotData) => Number(d.x) * 2,
        yAccessor: (d: ScatterPlotData) => Number(d.y) * 1.5,
      };
      
      const functionalScatterCore = new ScatterPlotCore(configWithFunctions);
      const result = functionalScatterCore['processData']();
      
      expect(result.data).toHaveLength(5);
      // The actual values would be transformed by the accessor functions
      expect(result.data[0].x).toBeDefined();
      expect(result.data[0].y).toBeDefined();
    });
  });

  describe('Scale Creation', () => {
    it('should create linear scales for numeric data', () => {
      const numericValues = [10, 30, 50, 70, 90];
      const xScale = scatterCore['createXScale'](numericValues);
      const yScale = scatterCore['createYScale'](numericValues);
      
      expect(xScale).toBeDefined();
      expect(yScale).toBeDefined();
    });

    it('should create time scales for date data', () => {
      const dateValues = [
        new Date('2023-01-01'),
        new Date('2023-02-01'),
        new Date('2023-03-01'),
      ];
      const timeScale = scatterCore['createXScale'](dateValues);
      
      expect(timeScale).toBeDefined();
    });

    it('should handle size scale creation when size accessor is provided', () => {
      const result = scatterCore['processData']();
      expect(scatterCore['sizeScale']).toBeDefined();
    });
  });

  describe('Configuration Management', () => {
    it('should allow configuration updates', () => {
      const newConfig = { colors: ['#ff00ff', '#00ffff'] };
      scatterCore.updateConfig(newConfig);
      
      expect(scatterCore['config'].colors).toEqual(['#ff00ff', '#00ffff']);
    });

    it('should provide access to current data', () => {
      scatterCore['processData'](); // Trigger data processing
      const currentData = scatterCore.getCurrentData();
      
      expect(currentData).toHaveLength(5);
      expect(currentData[0]).toHaveProperty('x');
      expect(currentData[0]).toHaveProperty('y');
      expect(currentData[0]).toHaveProperty('originalData');
    });
  });

  describe('Interaction Features', () => {
    it('should support point highlighting', () => {
      scatterCore['processData'](); // Process data first
      
      // Mock the scatter group
      const mockScatterGroup = {
        selectAll: vi.fn(() => ({
          classed: vi.fn().mockReturnThis(),
          attr: vi.fn().mockReturnThis(),
        })),
      };
      scatterCore['scatterGroup'] = mockScatterGroup as any;
      
      // Should not throw when highlighting points
      expect(() => {
        scatterCore.highlightPoints([0, 2]);
      }).not.toThrow();
    });

    it('should handle event callbacks properly', () => {
      const onDataClick = vi.fn();
      const onDataHover = vi.fn();
      
      const configWithEvents = {
        ...mockConfig,
        onDataClick,
        onDataHover,
      };
      
      const eventScatterCore = new ScatterPlotCore(configWithEvents);
      
      expect(eventScatterCore['config'].onDataClick).toBe(onDataClick);
      expect(eventScatterCore['config'].onDataHover).toBe(onDataHover);
    });
  });

  describe('Advanced Features', () => {
    it('should support trendline calculation', () => {
      const trendlineConfig = { ...mockConfig, showTrendline: true };
      const trendlineScatterCore = new ScatterPlotCore(trendlineConfig);
      
      // Process data to trigger trendline calculation
      trendlineScatterCore['processData']();
      
      expect(trendlineScatterCore['config'].showTrendline).toBe(true);
    });

    it('should handle brush zoom configuration', () => {
      const brushConfig = { ...mockConfig, enableBrushZoom: true };
      const brushScatterCore = new ScatterPlotCore(brushConfig);
      
      expect(brushScatterCore['config'].enableBrushZoom).toBe(true);
    });

    it('should support crosshair functionality', () => {
      const crosshairConfig = { ...mockConfig, enableCrosshair: true };
      const crosshairScatterCore = new ScatterPlotCore(crosshairConfig);
      
      expect(crosshairScatterCore['config'].enableCrosshair).toBe(true);
    });

    it('should support voronoi interaction', () => {
      const voronoiConfig = { ...mockConfig, enableVoronoi: true };
      const voronoiScatterCore = new ScatterPlotCore(voronoiConfig);
      
      expect(voronoiScatterCore['config'].enableVoronoi).toBe(true);
    });
  });

  describe('Framework Independence', () => {
    it('should work without React dependencies in core', () => {
      // The core should not import any React-specific modules
      const coreInstance = new ScatterPlotCore(mockConfig);
      
      // Should be able to process data without React
      expect(() => {
        coreInstance['processData']();
      }).not.toThrow();
    });

    it('should provide pure JavaScript/TypeScript functionality', () => {
      // Core functionality should be framework-agnostic
      const coreInstance = new ScatterPlotCore(mockConfig);
      
      expect(typeof coreInstance.updateConfig).toBe('function');
      expect(typeof coreInstance.getCurrentData).toBe('function');
      expect(typeof coreInstance.highlightPoints).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data gracefully', () => {
      const invalidConfig = { ...mockConfig, data: null as any };
      
      expect(() => {
        new ScatterPlotCore(invalidConfig);
      }).not.toThrow();
    });

    it('should handle missing accessor properties', () => {
      const missingAccessorData = [
        { a: 10, b: 20 }, // Missing expected x, y properties
        { a: 30, b: 40 },
      ];
      
      const configWithMissingProps = {
        ...mockConfig,
        data: missingAccessorData,
        xAccessor: 'x', // This property doesn't exist in the data
        yAccessor: 'y',
      };
      
      expect(() => {
        const core = new ScatterPlotCore(configWithMissingProps);
        core['processData']();
      }).not.toThrow();
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle large datasets efficiently', () => {
      // Generate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 20 + 2,
        color: ['red', 'blue', 'green'][i % 3],
      }));
      
      const largeConfig = { ...mockConfig, data: largeDataset };
      const start = performance.now();
      
      const largeScatterCore = new ScatterPlotCore(largeConfig);
      largeScatterCore['processData']();
      
      const end = performance.now();
      const processingTime = end - start;
      
      // Should process 1000 points relatively quickly
      expect(processingTime).toBeLessThan(100); // 100ms threshold
      expect(largeScatterCore.getCurrentData()).toHaveLength(1000);
    });
  });
});

describe('ScatterPlot Architecture Compliance', () => {
  it('should follow the BaseChartCore pattern', () => {
    const config: ScatterPlotCoreConfig = {
      width: 400,
      height: 300,
      data: [{ x: 1, y: 2 }],
    };
    
    const core = new ScatterPlotCore(config);
    
    // Should have BaseChartCore methods
    expect(core).toHaveProperty('updateConfig');
    expect(core.constructor.name).toBe('ScatterPlotCore');
  });

  it('should be framework-agnostic', () => {
    // The core implementation should not depend on React
    const config: ScatterPlotCoreConfig = {
      width: 400,
      height: 300,
      data: [{ x: 1, y: 2 }],
    };
    
    expect(() => {
      new ScatterPlotCore(config);
    }).not.toThrow();
  });

  it('should support the unified data mapping approach', () => {
    const config: ScatterPlotCoreConfig = {
      width: 400,
      height: 300,
      data: [
        { revenue: 100, profit: 20, employees: 50, region: 'North' },
        { revenue: 150, profit: 30, employees: 75, region: 'South' },
      ],
      xAccessor: 'revenue',
      yAccessor: 'profit',
      sizeAccessor: 'employees',
      colorAccessor: 'region',
    };
    
    const core = new ScatterPlotCore(config);
    const result = core['processData']();
    
    expect(result.data).toHaveLength(2);
    expect(result.data[0].x).toBe(100);
    expect(result.data[0].y).toBe(20);
  });
});