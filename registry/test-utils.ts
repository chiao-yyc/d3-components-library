/**
 * 測試工具函數
 * 提供統一的 DOM mocking、React render wrapper 和數據生成器
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';
import { act } from 'react';

// 創建標準的 DOM mock
export const createMockElement = () => {
  const element = {
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(),
    innerHTML: '',
    textContent: '',
    style: {},
    nodeType: 1, // Element node
    nodeName: 'DIV',
    getBoundingClientRect: vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
    })),
    getBBox: vi.fn(() => ({
      width: 100,
      height: 20,
      x: 0,
      y: 0,
    })),
    getComputedTextLength: vi.fn(() => 100),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    click: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
  };

  // 使其看起來像一個真正的 Node
  element.appendChild = vi.fn().mockImplementation((child) => {
    return child;
  });
  element.removeChild = vi.fn().mockImplementation((child) => {
    return child;
  });

  return element;
};

// 創建標準的 SVG mock
export const createMockSVGElement = () => ({
  ...createMockElement(),
  namespaceURI: 'http://www.w3.org/2000/svg',
  createSVGRect: vi.fn(() => ({
    width: 100,
    height: 20,
    x: 0,
    y: 0,
  })),
});

// 設置完整的 DOM 環境
export const setupDOMEnvironment = () => {
  // Mock document methods
  global.document.createElement = vi.fn((tagName: string) => {
    if (tagName === 'svg' || tagName.startsWith('svg:')) {
      return createMockSVGElement();
    }
    return createMockElement();
  }) as any;

  global.document.createElementNS = vi.fn((namespace: string, _tagName: string) => {
    if (namespace === 'http://www.w3.org/2000/svg') {
      return createMockSVGElement();
    }
    return createMockElement();
  }) as any;

  global.document.querySelector = vi.fn() as any;
  global.document.querySelectorAll = vi.fn(() => []) as any;
  global.document.getElementById = vi.fn();

  // Mock window methods
  global.window.getComputedStyle = vi.fn(() => ({
    width: '800px',
    height: '600px',
    marginTop: '0px',
    marginLeft: '0px',
  })) as any;

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  } as any;

  // Mock MutationObserver
  global.MutationObserver = class MutationObserver {
    observe = vi.fn();
    disconnect = vi.fn();
  } as any;
};

// 清理 DOM 環境
export const cleanupDOMEnvironment = () => {
  vi.clearAllMocks();
};

// React render wrapper with act()
export const renderWithAct = async (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): Promise<RenderResult> => {
  let result: RenderResult;
  
  await act(async () => {
    result = render(ui, options);
    // 等待所有異步狀態更新完成
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  return result!;
};

// 異步重新渲染的 wrapper
export const rerenderWithAct = async (
  rerender: (ui: ReactElement) => void,
  ui: ReactElement
): Promise<void> => {
  await act(async () => {
    rerender(ui);
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

// 生成測試用的時間序列數據
export const generateTimeSeriesData = (
  count: number = 10,
  startDate: Date = new Date('2023-01-01')
) => {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      date,
      value: Math.floor(Math.random() * 1000) + 100,
      category: `Category ${i % 3}`,
    };
  });
};

// 生成測試用的散點圖數據
export const generateScatterPlotData = (count: number = 20) => {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 5,
    color: ['red', 'blue', 'green', 'yellow'][i % 4],
    category: `Group ${i % 4}`,
  }));
};

// 生成測試用的層次數據
export const generateHierarchicalData = (depth: number = 3, branching: number = 3) => {
  const generateNode = (level: number, parentId: string = ''): any => {
    if (level <= 0) {
      return {
        id: parentId,
        name: `Item ${parentId}`,
        value: Math.floor(Math.random() * 100) + 1,
      };
    }

    const children = Array.from({ length: branching }, (_, i) => {
      const childId = parentId ? `${parentId}.${i}` : `${i}`;
      return generateNode(level - 1, childId);
    });

    return {
      id: parentId || 'root',
      name: `Group ${parentId || 'root'}`,
      children,
    };
  };

  return generateNode(depth);
};

// 標準的測試 props
export const getDefaultChartProps = () => ({
  width: 800,
  height: 600,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
  interactive: false,
  animate: false, // 測試時關閉動畫以提高穩定性
});

// 等待圖表渲染完成
export const waitForChartRender = async (timeout: number = 1000) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, timeout));
  });
};

// Mock console methods to reduce noise in tests
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  console.warn = vi.fn();
  console.error = vi.fn();
  console.log = vi.fn();

  return () => {
    Object.assign(console, originalConsole);
  };
};

// 驗證 SVG 元素是否存在
export const expectSVGElement = (element: Element) => {
  expect(element.tagName.toLowerCase()).toBe('svg');
  expect(element).toHaveAttribute('role', 'img');
};

// 驗證無障礙性
export const expectAccessibility = (element: Element) => {
  expect(element).toHaveAttribute('role', 'img');
  expect(element).toHaveAttribute('aria-label');
};