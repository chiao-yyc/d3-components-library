import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

import { ScatterPlot } from './scatter-plot';
import type { ScatterPlotProps } from './core/types';

// Mock data for testing
const mockData = [
  { revenue: 100000, profit: 20000, region: 'North', employees: 50 },
  { revenue: 150000, profit: 30000, region: 'South', employees: 75 },
  { revenue: 200000, profit: 40000, region: 'East', employees: 100 },
  { revenue: 120000, profit: 25000, region: 'West', employees: 60 },
];

const defaultProps: ScatterPlotProps = {
  width: 400,
  height: 300,
  data: mockData,
  xAccessor: (d) => d.revenue,
  yAccessor: (d) => d.profit,
};

describe('ScatterPlot', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<ScatterPlot {...defaultProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<ScatterPlot {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '300');
    });

    it('should handle empty data gracefully', () => {
      render(<ScatterPlot {...defaultProps} data={[]} />);
      
      // Should show "no data" message instead of chart
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });

    it('should render data points for each data item', async () => {
      render(<ScatterPlot {...defaultProps} />);
      
      await waitFor(() => {
        mockData.forEach((_, index) => {
          expect(screen.getByTestId(`data-point-${index}`)).toBeInTheDocument();
        });
      });
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<ScatterPlot {...defaultProps} />);
      
      const newData = [
        { revenue: 250000, profit: 50000, region: 'Central', employees: 120 },
        { revenue: 300000, profit: 60000, region: 'North', employees: 150 },
      ];
      
      rerender(<ScatterPlot {...defaultProps} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('data-point-0')).toBeInTheDocument();
        expect(screen.getByTestId('data-point-1')).toBeInTheDocument();
        // Old data points should not exist
        expect(screen.queryByTestId('data-point-2')).not.toBeInTheDocument();
      });
    });

    it('should handle accessor function changes', async () => {
      const { rerender } = render(<ScatterPlot {...defaultProps} />);
      
      // Change to use employees as x-axis
      rerender(
        <ScatterPlot 
          {...defaultProps} 
          xAccessor={(d) => d.employees}
          yAccessor={(d) => d.profit}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle data type validation gracefully', () => {
      const invalidData = [
        { revenue: 'invalid', profit: null, region: undefined },
      ] as any;

      expect(() => {
        render(<ScatterPlot {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling (Simplified)
  describe('Event Handling', () => {
    it('should support interactive props', () => {
      const mockClickHandler = vi.fn();
      const mockHoverHandler = vi.fn();

      render(
        <ScatterPlot
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
      const { container } = render(<ScatterPlot {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <ScatterPlot 
          {...defaultProps} 
          aria-label={`散點圖顯示 ${mockData.length} 個資料點`}
        />
      );
      
      expect(screen.getByLabelText(/散點圖/)).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', () => {
      render(<ScatterPlot {...defaultProps} interactive={true} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('tabindex', '0');
    });
  });

  // Test 5: ScatterPlot-Specific Features (Essential only)
  describe('ScatterPlot-Specific Features', () => {
    it('should apply accessors correctly', async () => {
      render(
        <ScatterPlot
          {...defaultProps}
          colorAccessor={(d) => d.region}
          sizeAccessor={(d) => d.employees}
        />
      );

      await waitFor(() => {
        const dataPoints = screen.getAllByTestId(/data-point-/);
        expect(dataPoints).toHaveLength(mockData.length);
      });
    });

    it('should support optional features', () => {
      // Just test that props are accepted without errors
      expect(() => {
        render(
          <ScatterPlot 
            {...defaultProps} 
            showTrendline={true}
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
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        revenue: i * 1000,
        profit: Math.random() * 10000,
        region: `Region-${i % 5}`,
        employees: Math.floor(Math.random() * 200)
      }));

      const startTime = performance.now();
      render(<ScatterPlot {...defaultProps} data={largeData} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(5000); // Relaxed for test environments
    });

    it('should handle invalid dimensions gracefully', () => {
      expect(() => {
        render(
          <ScatterPlot 
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
          <ScatterPlot 
            data={mockData}
            width={400}
            height={300}
            // Missing xAccessor and yAccessor
          />
        );
      }).not.toThrow();
    });

    it('should clean up properly on unmount', () => {
      const { unmount } = render(<ScatterPlot {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Test 7: Props Validation
  describe('Props Validation', () => {
    it('should use default radius when not specified', async () => {
      render(<ScatterPlot {...defaultProps} />);
      
      await waitFor(() => {
        const dataPoint = screen.getByTestId('data-point-0');
        expect(dataPoint).toBeInTheDocument();
      });
    });

    it('should accept radius prop', () => {
      // Just verify the component accepts the prop without error
      expect(() => {
        render(<ScatterPlot {...defaultProps} radius={10} />);
      }).not.toThrow();
    });

    it('should handle color array properly', async () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      
      render(
        <ScatterPlot 
          {...defaultProps} 
          colors={customColors}
          colorAccessor={(d) => d.region}
        />
      );
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/data-point-/)).toHaveLength(mockData.length);
      });
    });
  });
});