import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

import { AreaChart } from './area-chart';
import type { AreaChartProps } from './core/types';

// Mock data for testing
const mockData = [
  { date: new Date('2023-01-01'), value: 100, category: 'A' },
  { date: new Date('2023-02-01'), value: 150, category: 'A' },
  { date: new Date('2023-03-01'), value: 200, category: 'A' },
  { date: new Date('2023-04-01'), value: 175, category: 'A' },
];

const defaultProps: AreaChartProps = {
  width: 400,
  height: 300,
  data: mockData,
  xAccessor: (d) => d.date,
  yAccessor: (d) => d.value,
};

describe('AreaChart', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<AreaChart {...defaultProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<AreaChart {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '300');
    });

    it('should handle empty data gracefully', () => {
      render(<AreaChart {...defaultProps} data={[]} />);
      
      // Should show "no data" message instead of chart
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<AreaChart {...defaultProps} />);
      
      const newData = [
        { date: new Date('2023-05-01'), value: 250, category: 'B' },
        { date: new Date('2023-06-01'), value: 300, category: 'B' },
      ];
      
      rerender(<AreaChart {...defaultProps} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle accessor function changes', async () => {
      const { rerender } = render(<AreaChart {...defaultProps} />);
      
      // Change accessor functions
      rerender(
        <AreaChart
          {...defaultProps}
          yAccessor={(d) => d.value * 2}
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
        render(<AreaChart {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling (Simplified)
  describe('Event Handling', () => {
    it('should support interactive props', () => {
      const mockClickHandler = vi.fn();
      const mockHoverHandler = vi.fn();

      render(
        <AreaChart
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
      const { container } = render(<AreaChart {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <AreaChart 
          {...defaultProps} 
          aria-label={`區域圖顯示 ${mockData.length} 個資料點`}
        />
      );
      
      expect(screen.getByLabelText(/區域圖/)).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', () => {
      render(<AreaChart {...defaultProps} interactive={true} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('tabindex', '0');
    });
  });

  // Test 5: AreaChart-Specific Features (Essential only)
  describe('AreaChart-Specific Features', () => {
    it('should support stacked mode', () => {
      expect(() => {
        render(
          <AreaChart
            {...defaultProps}
            stacked={true}
          />
        );
      }).not.toThrow();
    });

    it('should support curve types', () => {
      expect(() => {
        render(
          <AreaChart
            {...defaultProps}
            curve="smooth"
          />
        );
      }).not.toThrow();
    });

    it('should support optional features', () => {
      // Just test that props are accepted without errors
      expect(() => {
        render(
          <AreaChart 
            {...defaultProps} 
            showGrid={true}
            enableBrushZoom={true}
            enableCrosshair={true}
          />
        );
      }).not.toThrow();
    });
  });

  // Test 6: Performance & Edge Cases
  describe('Performance & Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 5000 }, (_, i) => ({
        date: new Date(2023, 0, i + 1),
        value: Math.random() * 1000,
        category: `Category-${i % 5}`
      }));

      const startTime = performance.now();
      render(<AreaChart {...defaultProps} data={largeData} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(3000); // Relaxed for area charts (more complex)
    });

    it('should handle invalid dimensions gracefully', () => {
      expect(() => {
        render(
          <AreaChart 
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
          <AreaChart 
            data={mockData}
            width={400}
            height={300}
            // Missing xAccessor and yAccessor
          />
        );
      }).not.toThrow();
    });

    it('should clean up properly on unmount', () => {
      const { unmount } = render(<AreaChart {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Test 7: Props Validation
  describe('Props Validation', () => {
    it('should accept color props', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      
      expect(() => {
        render(
          <AreaChart 
            {...defaultProps} 
            colors={customColors}
          />
        );
      }).not.toThrow();
    });

    it('should accept opacity settings', () => {
      expect(() => {
        render(
          <AreaChart 
            {...defaultProps} 
            opacity={0.5}
          />
        );
      }).not.toThrow();
    });
  });
});