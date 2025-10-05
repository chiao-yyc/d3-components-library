/**
 * 標準化的測試工具和 Fixtures
 * 統一測試模式，提供 mock 數據和測試輔助工具
 */

import { ChartData, BaseChartData } from '../../types';

// === 測試數據生成器 ===

/**
 * 生成基礎測試數據
 */
export interface TestDataConfig {
  count?: number;
  startDate?: Date;
  minValue?: number;
  maxValue?: number;
  categories?: string[];
  includeNulls?: boolean;
  includeDuplicates?: boolean;
}

export class TestDataGenerator {
  /**
   * 生成數值數據
   */
  static generateNumericData(config: TestDataConfig = {}): ChartData<BaseChartData>[] {
    const {
      count = 10,
      minValue = 0,
      maxValue = 100,
      includeNulls = false
    } = config;

    return Array.from({ length: count }, (_, i) => {
      let value: number | null = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
      
      if (includeNulls && Math.random() < 0.1) {
        value = null;
      }

      return {
        id: i,
        value,
        label: `Item ${i + 1}`,
        index: i
      } as ChartData<BaseChartData>;
    });
  }

  /**
   * 生成時間序列數據
   */
  static generateTimeSeriesData(config: TestDataConfig = {}): ChartData<BaseChartData>[] {
    const {
      count = 10,
      startDate = new Date('2023-01-01'),
      minValue = 0,
      maxValue = 100
    } = config;

    return Array.from({ length: count }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

      return {
        id: i,
        date,
        value,
        timestamp: date.getTime(),
        label: `Day ${i + 1}`
      } as ChartData<BaseChartData>;
    });
  }

  /**
   * 生成分類數據
   */
  static generateCategoricalData(config: TestDataConfig = {}): ChartData<BaseChartData>[] {
    const {
      categories = ['Category A', 'Category B', 'Category C'],
      minValue = 0,
      maxValue = 100
    } = config;

    return categories.map((category, i) => {
      const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
      
      return {
        id: i,
        category,
        value,
        label: category,
        color: `hsl(${(i * 60) % 360}, 70%, 50%)`
      } as ChartData<BaseChartData>;
    });
  }

  /**
   * 生成多維數據
   */
  static generateMultiDimensionalData(config: TestDataConfig = {}): ChartData<BaseChartData>[] {
    const {
      count = 20,
      categories = ['Series A', 'Series B', 'Series C'],
      minValue = 0,
      maxValue = 100
    } = config;

    const data: ChartData<BaseChartData>[] = [];

    for (let i = 0; i < count; i++) {
      categories.forEach((series, seriesIndex) => {
        data.push({
          id: `${i}-${seriesIndex}`,
          x: i,
          y: Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue,
          series,
          seriesIndex,
          category: series,
          label: `${series} - Point ${i + 1}`
        } as ChartData<BaseChartData>);
      });
    }

    return data;
  }

  /**
   * 生成層次數據（樹狀）
   */
  static generateHierarchicalData(): ChartData<BaseChartData>[] {
    return [
      {
        name: 'Root',
        value: 100,
        children: [
          {
            name: 'Branch A',
            value: 60,
            children: [
              { name: 'Leaf A1', value: 35 },
              { name: 'Leaf A2', value: 25 }
            ]
          },
          {
            name: 'Branch B',
            value: 40,
            children: [
              { name: 'Leaf B1', value: 20 },
              { name: 'Leaf B2', value: 20 }
            ]
          }
        ]
      }
    ] as any;
  }
}

// === Mock DOM 環境 ===

export class MockDOMUtils {
  /**
   * 創建 Mock SVG 元素
   */
  static createMockSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '800');
    svg.setAttribute('height', '400');
    return svg;
  }

  /**
   * 創建 Mock 容器元素
   */
  static createMockContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '400px';
    return container;
  }

  /**
   * 模擬 getBoundingClientRect
   */
  static mockBoundingClientRect(element: Element, rect: Partial<DOMRect>): void {
    const defaultRect = {
      x: 0,
      y: 0,
      width: 800,
      height: 400,
      top: 0,
      right: 800,
      bottom: 400,
      left: 0
    };

    Object.defineProperty(element, 'getBoundingClientRect', {
      value: () => ({ ...defaultRect, ...rect })
    });
  }
}

// === 測試斷言工具 ===

export class TestAssertions {
  /**
   * 驗證 SVG 元素存在
   */
  static expectSVGElement(container: Element, selector: string): SVGElement {
    const element = container.querySelector(selector) as SVGElement;
    expect(element).toBeInTheDocument();
    return element;
  }

  /**
   * 驗證 SVG 屬性
   */
  static expectSVGAttribute(element: SVGElement, attribute: string, expectedValue?: string): void {
    expect(element).toHaveAttribute(attribute);
    if (expectedValue !== undefined) {
      expect(element.getAttribute(attribute)).toBe(expectedValue);
    }
  }

  /**
   * 驗證數據點數量
   */
  static expectDataPointCount(container: Element, selector: string, expectedCount: number): void {
    const elements = container.querySelectorAll(selector);
    expect(elements).toHaveLength(expectedCount);
  }

  /**
   * 驗證顏色值
   */
  static expectValidColor(color: string): void {
    const colorRegex = /^(#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\()/i;
    expect(color).toMatch(colorRegex);
  }

  /**
   * 驗證數值範圍
   */
  static expectValueInRange(value: number, min: number, max: number): void {
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  }

  /**
   * 驗證動畫屬性
   */
  static expectAnimationAttribute(element: Element, duration?: number): void {
    // 這裡可以檢查 CSS transition 或其他動畫相關屬性
    const computedStyle = window.getComputedStyle(element);
    if (duration !== undefined) {
      expect(computedStyle.transitionDuration).toBeTruthy();
    }
  }
}

// === 事件模擬工具 ===

export class TestEventUtils {
  /**
   * 模擬滑鼠事件
   */
  static createMouseEvent(
    type: 'click' | 'mouseover' | 'mouseout' | 'mousemove',
    options: {
      clientX?: number;
      clientY?: number;
      pageX?: number;
      pageY?: number;
      bubbles?: boolean;
    } = {}
  ): MouseEvent {
    return new MouseEvent(type, {
      bubbles: true,
      clientX: 100,
      clientY: 100,
      pageX: 100,
      pageY: 100,
      ...options
    });
  }

  /**
   * 模擬觸摸事件
   */
  static createTouchEvent(
    type: 'touchstart' | 'touchmove' | 'touchend',
    touches: Array<{ clientX: number; clientY: number }> = [{ clientX: 100, clientY: 100 }]
  ): TouchEvent {
    const touchList = touches.map(touch => ({
      clientX: touch.clientX,
      clientY: touch.clientY,
      identifier: 0,
      pageX: touch.clientX,
      pageY: touch.clientY,
      screenX: touch.clientX,
      screenY: touch.clientY,
      target: document.body
    }));

    return new TouchEvent(type, {
      bubbles: true,
      touches: touchList as any,
      targetTouches: touchList as any,
      changedTouches: touchList as any
    });
  }

  /**
   * 模擬鍵盤事件
   */
  static createKeyboardEvent(
    type: 'keydown' | 'keyup' | 'keypress',
    key: string,
    options: {
      ctrlKey?: boolean;
      shiftKey?: boolean;
      altKey?: boolean;
      metaKey?: boolean;
    } = {}
  ): KeyboardEvent {
    return new KeyboardEvent(type, {
      key,
      bubbles: true,
      ...options
    });
  }
}

// === 非同步測試工具 ===

export class TestAsyncUtils {
  /**
   * 等待動畫完成
   */
  static async waitForAnimation(duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, duration + 50); // 稍微多等一點時間確保動畫完成
    });
  }

  /**
   * 等待 DOM 更新
   */
  static async waitForDOM(): Promise<void> {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve as any);
      });
    });
  }

  /**
   * 等待條件滿足
   */
  static async waitForCondition(
    condition: () => boolean,
    timeout: number = 5000
  ): Promise<void> {
    const start = Date.now();
    
    return new Promise((resolve, reject) => {
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  }
}

// === 模擬狀態管理 ===

export class TestStateManager {
  private state: Map<string, any> = new Map();
  private callbacks: Map<string, Function[]> = new Map();

  /**
   * 設置狀態
   */
  setState<T>(key: string, value: T): void {
    this.state.set(key, value);
    this.triggerCallbacks(key, value);
  }

  /**
   * 獲取狀態
   */
  getState<T>(key: string): T | undefined {
    return this.state.get(key);
  }

  /**
   * 監聽狀態變化
   */
  onStateChange<T>(key: string, callback: (value: T) => void): () => void {
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }
    this.callbacks.get(key)!.push(callback);

    // 返回取消監聽的函數
    return () => {
      const cbs = this.callbacks.get(key);
      if (cbs) {
        const index = cbs.indexOf(callback);
        if (index > -1) {
          cbs.splice(index, 1);
        }
      }
    };
  }

  private triggerCallbacks<T>(key: string, value: T): void {
    const callbacks = this.callbacks.get(key);
    if (callbacks) {
      callbacks.forEach(callback => callback(value));
    }
  }

  /**
   * 重置所有狀態
   */
  reset(): void {
    this.state.clear();
    this.callbacks.clear();
  }
}

// === 便利的測試設置函數 ===

/**
 * 通用的圖表測試設置
 */
export function setupChartTest(): {
  container: HTMLDivElement;
  svg: SVGSVGElement;
  cleanup: () => void;
} {
  const container = MockDOMUtils.createMockContainer();
  const svg = MockDOMUtils.createMockSVG();
  
  container.appendChild(svg);
  document.body.appendChild(container);

  MockDOMUtils.mockBoundingClientRect(container, {
    width: 800,
    height: 400
  });

  return {
    container,
    svg,
    cleanup: () => {
      document.body.removeChild(container);
    }
  };
}

/**
 * 批量測試用例生成器
 */
export function generateTestCases<T>(
  testName: string,
  configs: T[],
  testFn: (config: T, index: number) => void | Promise<void>
): void {
  configs.forEach((config, index) => {
    it(`${testName} - case ${index + 1}`, async () => {
      await testFn(config, index);
    });
  });
}