/**
 * ModernBarChart 測試
 * 驗證新的 hooks-based 架構
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ModernBarChart } from './modern-bar-chart';

// 測試數據
const mockData = [
  { category: 'A', value: 10 },
  { category: 'B', value: 20 },
  { category: 'C', value: 15 },
  { category: 'D', value: 25 },
];

describe('ModernBarChart', () => {
  describe('基礎渲染', () => {
    it('應該能使用新的 mapping 配置渲染', () => {
      render(
        <ModernBarChart 
          data={mockData}
          mapping={{
            x: "category",
            y: "value"
          }}
          width={400}
          height={300}
        />
      );
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('應該處理空數據情況', () => {
      render(
        <ModernBarChart 
          data={[]}
          mapping={{ x: "category", y: "value" }}
          width={400}
          height={300}
        />
      );
      
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });
  });

  describe('向下兼容性', () => {
    it('應該支援舊的 key-based 配置（附帶 deprecated 警告）', () => {
      render(
        <ModernBarChart 
          data={mockData}
          // @ts-expect-error - 測試 deprecated props
          xKey="category"
          yKey="value"
          width={400}
          height={300}
        />
      );
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('應該支援舊的 accessor-based 配置（附帶 deprecated 警告）', () => {
      render(
        <ModernBarChart 
          data={mockData}
          // @ts-expect-error - 測試 deprecated props  
          xAccessor={(d) => d.category}
          yAccessor={(d) => d.value}
          width={400}
          height={300}
        />
      );
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('圖表類型特定功能', () => {
    it('應該支援垂直和水平方向', () => {
      const { rerender } = render(
        <ModernBarChart 
          data={mockData}
          mapping={{ x: "category", y: "value" }}
          orientation="vertical"
          width={400}
          height={300}
        />
      );
      
      expect(screen.getByRole('img')).toBeInTheDocument();

      rerender(
        <ModernBarChart 
          data={mockData}
          mapping={{ x: "category", y: "value" }}
          orientation="horizontal"
          width={400}
          height={300}
        />
      );
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  describe('錯誤處理', () => {
    it('應該優雅地處理無效數據', () => {
      render(
        <ModernBarChart 
          data={null as any}
          mapping={{ x: "category", y: "value" }}
          width={400}
          height={300}
        />
      );
      
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });
  });
});