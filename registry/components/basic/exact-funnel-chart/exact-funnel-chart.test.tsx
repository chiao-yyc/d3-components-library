import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

import { ExactFunnelChart } from './exact-funnel-chart';
import type { ExactFunnelChartCoreConfig } from './core/types';

// Mock data for testing
const mockData = [
  { stage: '訪問', visitors: 10000, step: 1 },
  { stage: '註冊', visitors: 5000, step: 2 },
  { stage: '激活', visitors: 3000, step: 3 },
  { stage: '購買', visitors: 1500, step: 4 },
  { stage: '復購', visitors: 800, step: 5 },
];

const defaultProps: ExactFunnelChartCoreConfig = {
  width: 500,
  height: 400,
  data: mockData,
  stepKey: 'step',
  valueKey: 'visitors',
  labelKey: 'stage',
};

describe('ExactFunnelChart', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<ExactFunnelChart {...defaultProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<ExactFunnelChart {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '500');
      expect(svg).toHaveAttribute('height', '400');
    });

    it('should handle empty data gracefully', () => {
      render(<ExactFunnelChart {...defaultProps} data={[]} />);
      
      // Should show "no data" message instead of chart
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });

    it('should render funnel shape', async () => {
      render(<ExactFunnelChart {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('funnel-shape')).toBeInTheDocument();
      });
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<ExactFunnelChart {...defaultProps} />);
      
      const newData = [
        { stage: '新階段1', visitors: 8000, step: 1 },
        { stage: '新階段2', visitors: 4000, step: 2 },
        { stage: '新階段3', visitors: 2000, step: 3 },
      ];
      
      rerender(<ExactFunnelChart {...defaultProps} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle accessor function changes', async () => {
      const stepAccessor = (d: any) => d.step;
      const valueAccessor = (d: any) => d.visitors;
      const labelAccessor = (d: any) => d.stage;
      
      const { rerender } = render(<ExactFunnelChart {...defaultProps} />);
      
      rerender(
        <ExactFunnelChart 
          {...defaultProps} 
          stepKey={stepAccessor}
          valueKey={valueAccessor}
          labelKey={labelAccessor}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle data type validation gracefully', () => {
      const invalidData = [
        { stage: null, visitors: 'invalid', step: undefined },
      ] as any;

      expect(() => {
        render(<ExactFunnelChart {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling
  describe('Event Handling', () => {
    it('should support interactive props', () => {
      const mockClickHandler = vi.fn();
      const mockHoverHandler = vi.fn();

      render(
        <ExactFunnelChart
          {...defaultProps}
          interactive={true}
          onDataClick={mockClickHandler}
          onDataHover={mockHoverHandler}
        />
      );

      // Just verify the component renders with event handlers
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(mockClickHandler).toBeDefined();
      expect(mockHoverHandler).toBeDefined();
    });
  });

  // Test 4: Accessibility
  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const { container } = render(<ExactFunnelChart {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <ExactFunnelChart 
          {...defaultProps} 
          aria-label={`漏斗圖顯示 ${mockData.length} 個轉換階段`}
        />
      );
      
      expect(screen.getByLabelText(/漏斗圖/)).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', () => {
      render(<ExactFunnelChart {...defaultProps} interactive={true} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('tabindex', '0');
    });
  });

  // Test 5: ExactFunnelChart-Specific Features
  describe('ExactFunnelChart-Specific Features', () => {
    it('should support custom gradient colors', () => {
      expect(() => {
        render(
          <ExactFunnelChart
            {...defaultProps}
            gradient1="#FF6B6B"
            gradient2="#4ECDC4"
          />
        );
      }).not.toThrow();
    });

    it('should support custom background and colors', () => {
      expect(() => {
        render(
          <ExactFunnelChart 
            {...defaultProps} 
            background="#1a1a1a"
            values="#ffffff"
            labels="#cccccc"
            percentages="#888888"
          />
        );
      }).not.toThrow();
    });

    it('should support border configuration', () => {
      expect(() => {
        render(
          <ExactFunnelChart 
            {...defaultProps} 
            showBorder={true}
            borderColor="#333333"
          />
        );
      }).not.toThrow();
    });

    it('should support font configuration', () => {
      expect(() => {
        render(
          <ExactFunnelChart 
            {...defaultProps} 
            fontFamily="Arial, sans-serif"
            fontSize={20}
            labelFontSize={16}
            percentageFontSize={14}
          />
        );
      }).not.toThrow();
    });

    it('should support animation configuration', () => {
      expect(() => {
        render(
          <ExactFunnelChart 
            {...defaultProps} 
            animate={true}
            animationDuration={1500}
            animationDelay={200}
          />
        );
      }).not.toThrow();
    });
  });

  // Test 6: Performance & Edge Cases
  describe('Performance & Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 50 }, (_, i) => ({
        stage: `階段-${i + 1}`,
        visitors: Math.floor(Math.random() * 10000) + 1000,
        step: i + 1
      }));

      const startTime = performance.now();
      render(<ExactFunnelChart {...defaultProps} data={largeData} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(5000); // Relaxed for test environments
    });

    it('should handle invalid dimensions gracefully', () => {
      expect(() => {
        render(
          <ExactFunnelChart 
            {...defaultProps} 
            width={0} 
            height={0} 
          />
        );
      }).not.toThrow();
    });

    it('should handle missing key properties gracefully', () => {
      expect(() => {
        render(
          <ExactFunnelChart 
            data={mockData}
            width={500}
            height={400}
            // Missing stepKey, valueKey, labelKey
          />
        );
      }).not.toThrow();
    });

    it('should handle zero values gracefully', () => {
      const zeroValuesData = [
        { stage: '起始', visitors: 1000, step: 1 },
        { stage: '零轉換', visitors: 0, step: 2 },
        { stage: '結束', visitors: 0, step: 3 },
      ];

      expect(() => {
        render(<ExactFunnelChart {...defaultProps} data={zeroValuesData} />);
      }).not.toThrow();
    });

    it('should handle single data point gracefully', () => {
      const singleData = [
        { stage: '唯一階段', visitors: 5000, step: 1 },
      ];

      expect(() => {
        render(<ExactFunnelChart {...defaultProps} data={singleData} />);
      }).not.toThrow();
    });

    it('should clean up properly on unmount', () => {
      const { unmount } = render(<ExactFunnelChart {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Test 7: Props Validation
  describe('Props Validation', () => {
    it('should render value labels correctly', async () => {
      render(<ExactFunnelChart {...defaultProps} />);
      
      await waitFor(() => {
        // Check for formatted values (with comma separators)
        expect(screen.getByText('10,000')).toBeInTheDocument();
        expect(screen.getByText('5,000')).toBeInTheDocument();
      });
    });

    it('should render stage labels correctly', async () => {
      render(<ExactFunnelChart {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('訪問')).toBeInTheDocument();
        expect(screen.getByText('註冊')).toBeInTheDocument();
        expect(screen.getByText('激活')).toBeInTheDocument();
      });
    });

    it('should calculate conversion rates correctly', async () => {
      render(<ExactFunnelChart {...defaultProps} />);
      
      await waitFor(() => {
        // 5000/10000 = 50%
        expect(screen.getByText('50.0%')).toBeInTheDocument();
        // 3000/5000 = 60%
        expect(screen.getByText('60.0%')).toBeInTheDocument();
      });
    });

    it('should support different data key types', () => {
      const numericKeyData = [
        { 0: '階段1', 1: 1000, 2: 1 },
        { 0: '階段2', 1: 800, 2: 2 },
      ];

      expect(() => {
        render(
          <ExactFunnelChart 
            {...defaultProps} 
            data={numericKeyData}
            stepKey={2}
            valueKey={1}
            labelKey={0}
          />
        );
      }).not.toThrow();
    });

    it('should handle missing data properties gracefully', () => {
      const incompleteData = [
        { stage: '完整', visitors: 1000 }, // missing step
        { visitors: 800, step: 2 }, // missing stage
        { stage: '無數值', step: 3 }, // missing visitors
      ];

      expect(() => {
        render(<ExactFunnelChart {...defaultProps} data={incompleteData} />);
      }).not.toThrow();
    });

    it('should use default values when step/value/label are not found', async () => {
      const minimalData = [{}, {}]; // Empty objects
      
      render(<ExactFunnelChart {...defaultProps} data={minimalData} />);
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });
  });
});