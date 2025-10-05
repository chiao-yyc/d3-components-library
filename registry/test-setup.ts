import '@testing-library/jest-dom';
import { expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';
import { setupDOMEnvironment, cleanupDOMEnvironment } from './test-utils';

// Extend Vitest matchers with jest-dom and jest-axe
expect.extend(toHaveNoViolations);

// 全局設置 DOM 環境
beforeEach(() => {
  setupDOMEnvironment();
});

// 全局清理 DOM 環境
afterEach(() => {
  cleanupDOMEnvironment();
});

// Mock D3 selection methods for testing
(globalThis as any).ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock SVG methods that D3 uses
Object.defineProperty(SVGElement.prototype, 'getBBox', {
  value: () => ({
    width: 100,
    height: 100,
    x: 0,
    y: 0
  }),
  writable: true
});

Object.defineProperty(SVGElement.prototype, 'getComputedTextLength', {
  value: () => 100,
  writable: true
});

// Mock canvas context for testing
HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  getImageData: () => ({ data: [] }),
  putImageData: () => {},
  createImageData: () => [],
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  fillText: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  stroke: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  arc: () => {},
  fill: () => {},
  measureText: () => ({ width: 0 }),
  transform: () => {},
  rect: () => {},
  clip: () => {}
} as any);

// Silence console warnings in tests unless needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});