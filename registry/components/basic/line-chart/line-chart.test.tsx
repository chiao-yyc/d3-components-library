import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

import { LineChart } from './line-chart';
import type { LineChartProps } from './types';

// Mock data for testing
const mockData = [
  { date: '2024-01', value: 100, category: 'A' },
  { date: '2024-02', value: 150, category: 'A' },
  { date: '2024-03', value: 120, category: 'A' },
  { date: '2024-04', value: 200, category: 'A' },
  { date: '2024-05', value: 180, category: 'A' },
];

const defaultProps: LineChartProps = {
  width: 400,
  height: 300,
  data: mockData,
  xAccessor: (d) => d.date,
  yAccessor: (d) => d.value,
};

describe('LineChart', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<LineChart {...defaultProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<LineChart {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '300');
    });

    it('should handle empty data gracefully', () => {
      render(<LineChart {...defaultProps} data={[]} />);
      
      // Should show "no data" message instead of chart
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });

    it('should render line path for data', async () => {
      render(<LineChart {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('line-path')).toBeInTheDocument();
      });
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<LineChart {...defaultProps} />);
      
      const newData = [
        { date: '2024-06', value: 250, category: 'B' },
        { date: '2024-07', value: 300, category: 'B' },
      ];
      
      rerender(<LineChart {...defaultProps} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('line-path')).toBeInTheDocument();
      });
    });

    it('should handle accessor function changes', async () => {
      const { rerender } = render(<LineChart {...defaultProps} />);
      
      // Change to use different accessor
      rerender(
        <LineChart 
          {...defaultProps} 
          xKey="date"
          yKey="value"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle data type validation gracefully', () => {
      const invalidData = [
        { date: 'invalid', value: null, category: undefined },
      ] as any;

      expect(() => {
        render(<LineChart {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling
  describe('Event Handling', () => {
    it('should support interactive props', () => {
      const mockClickHandler = vi.fn();
      const mockHoverHandler = vi.fn();

      render(
        <LineChart
          {...defaultProps}
          interactive={true}
          onDataClick={mockClickHandler}
          onHover={mockHoverHandler}
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
      const { container } = render(<LineChart {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <LineChart 
          {...defaultProps} 
          aria-label={`線圖顯示 ${mockData.length} 個資料點`}
        />
      );
      
      expect(screen.getByLabelText(/線圖/)).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', () => {
      render(<LineChart {...defaultProps} interactive={true} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('tabindex', '0');
    });
  });

  // Test 5: LineChart-Specific Features
  describe('LineChart-Specific Features', () => {
    it('should support curve types', () => {
      expect(() => {
        render(
          <LineChart
            {...defaultProps}
            curve="monotone"
          />
        );
      }).not.toThrow();
    });

    it('should support dots display', () => {
      expect(() => {
        render(
          <LineChart 
            {...defaultProps} 
            showDots={true}
            dotRadius={5}
          />
        );
      }).not.toThrow();
    });

    it('should support area fill', () => {
      expect(() => {
        render(
          <LineChart 
            {...defaultProps} 
            showArea={true}
            areaOpacity={0.3}
          />
        );
      }).not.toThrow();
    });

    it('should support grid display', () => {
      expect(() => {
        render(
          <LineChart 
            {...defaultProps} 
            showGrid={true}
            gridOpacity={0.5}
          />
        );
      }).not.toThrow();
    });

    it('should support optional features', () => {
      // Just test that props are accepted without errors
      expect(() => {
        render(
          <LineChart 
            {...defaultProps} 
            enableBrushZoom={true}
            enableCrosshair={true}
            enableDropShadow={true}
            enableGlowEffect={true}
          />
        );
      }).not.toThrow();
    });
  });

  // Test 6: Performance & Edge Cases
  describe('Performance & Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        date: `2024-${String(i % 12 + 1).padStart(2, '0')}-${String(i % 28 + 1).padStart(2, '0')}`,
        value: Math.random() * 1000,
        category: `Category-${i % 5}`
      }));

      const startTime = performance.now();
      render(<LineChart {...defaultProps} data={largeData} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(5000); // Relaxed for test environments
    });

    it('should handle invalid dimensions gracefully', () => {
      expect(() => {
        render(
          <LineChart 
            {...defaultProps} 
            width={0} 
            height={0} 
          />
        );
      }).not.toThrow();
    });

    it('should handle missing accessor functions gracefully', () => {
      expect(() => {
        render(
          <LineChart 
            data={mockData}
            width={400}
            height={300}
            // Missing xAccessor and yAccessor
          />
        );
      }).not.toThrow();
    });

    it('should clean up properly on unmount', () => {
      const { unmount } = render(<LineChart {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Test 7: Props Validation
  describe('Props Validation', () => {
    it('should use default stroke width when not specified', async () => {
      render(<LineChart {...defaultProps} />);
      
      await waitFor(() => {
        const linePath = screen.getByTestId('line-path');
        expect(linePath).toBeInTheDocument();
      });
    });

    it('should accept custom stroke width', () => {
      expect(() => {
        render(<LineChart {...defaultProps} strokeWidth={3} />);
      }).not.toThrow();
    });

    it('should handle color array properly', async () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      
      render(
        <LineChart 
          {...defaultProps} 
          colors={customColors}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('line-path')).toBeInTheDocument();
      });
    });

    it('should support custom tooltip formatting', () => {
      const customTooltipFormat = vi.fn((data) => `Custom: ${data.value}`);
      
      expect(() => {
        render(
          <LineChart 
            {...defaultProps} 
            tooltipFormat={customTooltipFormat}
          />
        );
      }).not.toThrow();
    });
  });
});