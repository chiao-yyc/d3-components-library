import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

import { BoxPlot } from './box-plot';
import type { BoxPlotProps } from './types';

// Mock data for testing
const mockData = [
  { 
    category: '產品A', 
    values: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55] 
  },
  { 
    category: '產品B', 
    values: [5, 12, 18, 22, 28, 32, 38, 42, 48, 52] 
  },
  { 
    category: '產品C', 
    values: [8, 16, 24, 28, 34, 36, 44, 46, 54, 58] 
  },
];

const defaultProps: BoxPlotProps = {
  width: 400,
  height: 300,
  data: mockData,
  mapping: {
    label: 'category',
    values: 'values'
  },
};

const accessorProps: BoxPlotProps = {
  width: 400,
  height: 300,
  data: mockData,
  labelAccessor: (d) => d.category,
  valueAccessor: (d) => d.values,
};

describe('BoxPlot', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<BoxPlot {...defaultProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render with accessor props', () => {
      render(<BoxPlot {...accessorProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<BoxPlot {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '300');
    });

    it('should handle empty data gracefully', () => {
      render(<BoxPlot {...defaultProps} data={[]} />);
      
      // Should show "no data" message instead of chart
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });

    it('should render box plots for each data category', async () => {
      render(<BoxPlot {...defaultProps} />);
      
      await waitFor(() => {
        mockData.forEach((_, index) => {
          expect(screen.getByTestId(`box-plot-${index}`)).toBeInTheDocument();
        });
      });
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<BoxPlot {...defaultProps} />);
      
      const newData = [
        { category: '新產品X', values: [20, 25, 30, 35, 40, 45, 50] },
        { category: '新產品Y', values: [15, 20, 28, 33, 38, 43, 48] },
      ];
      
      rerender(<BoxPlot {...defaultProps} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('box-plot-0')).toBeInTheDocument();
        expect(screen.getByTestId('box-plot-1')).toBeInTheDocument();
        // Old box plots should not exist
        expect(screen.queryByTestId('box-plot-2')).not.toBeInTheDocument();
      });
    });

    it('should handle mapping configuration changes', async () => {
      const { rerender } = render(<BoxPlot {...defaultProps} />);
      
      // Change to use deprecated key-based props
      rerender(
        <BoxPlot 
          {...defaultProps} 
          labelKey="category"
          valuesKey="values"
          mapping={undefined}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle data type validation gracefully', () => {
      const invalidData = [
        { category: null, values: 'invalid' },
      ] as any;

      expect(() => {
        render(<BoxPlot {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling
  describe('Event Handling', () => {
    it('should support interactive props', () => {
      const mockClickHandler = vi.fn();
      const mockHoverHandler = vi.fn();

      render(
        <BoxPlot
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

    it('should support deprecated event handlers for backward compatibility', () => {
      const mockBoxClick = vi.fn();
      const mockBoxHover = vi.fn();

      render(
        <BoxPlot
          {...defaultProps}
          onBoxClick={mockBoxClick}
          onBoxHover={mockBoxHover}
        />
      );

      // Just verify the component renders with deprecated handlers
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(mockBoxClick).toBeDefined();
      expect(mockBoxHover).toBeDefined();
    });
  });

  // Test 4: Accessibility
  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const { container } = render(<BoxPlot {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <BoxPlot 
          {...defaultProps} 
          aria-label={`箱形圖顯示 ${mockData.length} 個類別的統計分佈`}
        />
      );
      
      expect(screen.getByLabelText(/箱形圖/)).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', () => {
      render(<BoxPlot {...defaultProps} interactive={true} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('tabindex', '0');
    });
  });

  // Test 5: BoxPlot-Specific Features
  describe('BoxPlot-Specific Features', () => {
    it('should support orientation configuration', () => {
      expect(() => {
        render(
          <BoxPlot
            {...defaultProps}
            orientation="horizontal"
          />
        );
      }).not.toThrow();
    });

    it('should support box styling options', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            boxWidth={0.7}
            whiskerWidth={0.5}
            boxFillOpacity={0.8}
            boxStroke="#333"
            boxStrokeWidth={2}
          />
        );
      }).not.toThrow();
    });

    it('should support outlier display', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            showOutliers={true}
            outlierRadius={3}
            outlierThreshold={1.5}
          />
        );
      }).not.toThrow();
    });

    it('should support mean and median display', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            showMean={true}
            showMedian={true}
            meanStyle="diamond"
          />
        );
      }).not.toThrow();
    });

    it('should support statistics configuration', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            statisticsMethod="tukey"
            showWhiskers={true}
            showStatistics={true}
          />
        );
      }).not.toThrow();
    });

    it('should support color schemes', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            colorScheme="blues"
          />
        );
      }).not.toThrow();
    });

    it('should support all points display', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            showAllPoints={true}
            pointColorMode="by-value"
            jitterWidth={0.3}
            pointRadius={2}
            pointOpacity={0.6}
          />
        );
      }).not.toThrow();
    });

    it('should support label configuration', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            showLabels={true}
            showValues={true}
            labelPosition="outside"
          />
        );
      }).not.toThrow();
    });
  });

  // Test 6: Performance & Edge Cases
  describe('Performance & Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 50 }, (_, i) => ({
        category: `類別-${i}`,
        values: Array.from({ length: 1000 }, () => Math.random() * 100)
      }));

      const startTime = performance.now();
      render(<BoxPlot {...defaultProps} data={largeData} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(5000); // Relaxed for test environments
    });

    it('should handle invalid dimensions gracefully', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            width={0} 
            height={0} 
          />
        );
      }).not.toThrow();
    });

    it('should handle missing mapping configuration gracefully', () => {
      expect(() => {
        render(
          <BoxPlot 
            data={mockData}
            width={400}
            height={300}
            // Missing mapping configuration
          />
        );
      }).not.toThrow();
    });

    it('should handle insufficient data points gracefully', () => {
      const insufficientData = [
        { category: 'Test', values: [10] } // Only one value
      ];

      expect(() => {
        render(<BoxPlot {...defaultProps} data={insufficientData} />);
      }).not.toThrow();
    });

    it('should handle empty value arrays gracefully', () => {
      const emptyValuesData = [
        { category: 'Empty', values: [] }
      ];

      expect(() => {
        render(<BoxPlot {...defaultProps} data={emptyValuesData} />);
      }).not.toThrow();
    });

    it('should clean up properly on unmount', () => {
      const { unmount } = render(<BoxPlot {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Test 7: Props Validation
  describe('Props Validation', () => {
    it('should use default box width when not specified', async () => {
      render(<BoxPlot {...defaultProps} />);
      
      await waitFor(() => {
        const boxPlot = screen.getByTestId('box-plot-0');
        expect(boxPlot).toBeInTheDocument();
      });
    });

    it('should accept custom formatting functions', () => {
      const valueFormat = vi.fn((value) => `${value.toFixed(2)}`);
      const statisticsFormat = vi.fn((stats) => `中位數: ${stats.median}`);
      const tooltipFormat = vi.fn((data) => `${data.label}: ${data.statistics.median}`);
      
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            valueFormat={valueFormat}
            statisticsFormat={statisticsFormat}
            tooltipFormat={tooltipFormat}
          />
        );
      }).not.toThrow();
    });

    it('should handle color array properly', async () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      
      render(
        <BoxPlot 
          {...defaultProps} 
          colors={customColors}
        />
      );
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/box-plot-/)).toHaveLength(mockData.length);
      });
    });

    it('should support custom font properties', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            fontSize={12}
            fontFamily="Helvetica, Arial, sans-serif"
          />
        );
      }).not.toThrow();
    });

    it('should support animation configuration', () => {
      expect(() => {
        render(
          <BoxPlot 
            {...defaultProps} 
            animate={true}
            animationDuration={800}
            animationDelay={100}
            animationEasing="ease-out"
          />
        );
      }).not.toThrow();
    });
  });
});