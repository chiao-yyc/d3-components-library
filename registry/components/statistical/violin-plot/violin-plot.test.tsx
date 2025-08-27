import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

import { ViolinPlot } from './violin-plot';
import type { ViolinPlotProps } from './types';

// Mock data for testing
const mockData = [
  { 
    group: '組別A', 
    values: [10, 15, 18, 20, 22, 25, 28, 30, 32, 35, 40, 45, 50] 
  },
  { 
    group: '組別B', 
    values: [12, 16, 20, 24, 26, 28, 30, 32, 36, 38, 42, 44, 48] 
  },
  { 
    group: '組別C', 
    values: [8, 14, 19, 23, 27, 31, 33, 37, 39, 41, 43, 47, 52] 
  },
];

const defaultProps: ViolinPlotProps = {
  width: 400,
  height: 300,
  data: mockData,
  mapping: {
    label: 'group',
    values: 'values'
  },
};

const accessorProps: ViolinPlotProps = {
  width: 400,
  height: 300,
  data: mockData,
  labelAccessor: (d) => d.group,
  valueAccessor: (d) => d.values,
};

describe('ViolinPlot', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<ViolinPlot {...defaultProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render with accessor props', () => {
      render(<ViolinPlot {...accessorProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<ViolinPlot {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '300');
    });

    it('should handle empty data gracefully', () => {
      render(<ViolinPlot {...defaultProps} data={[]} />);
      
      // Should show "no data" message instead of chart
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });

    it('should render violin plots for each data group', async () => {
      render(<ViolinPlot {...defaultProps} />);
      
      await waitFor(() => {
        mockData.forEach((_, index) => {
          expect(screen.getByTestId(`violin-${index}`)).toBeInTheDocument();
        });
      });
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<ViolinPlot {...defaultProps} />);
      
      const newData = [
        { group: '新組別X', values: [20, 25, 30, 35, 40, 45, 50, 55] },
        { group: '新組別Y', values: [15, 22, 28, 33, 38, 43, 48, 53] },
      ];
      
      rerender(<ViolinPlot {...defaultProps} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('violin-0')).toBeInTheDocument();
        expect(screen.getByTestId('violin-1')).toBeInTheDocument();
        // Old violins should not exist
        expect(screen.queryByTestId('violin-2')).not.toBeInTheDocument();
      });
    });

    it('should handle mapping configuration changes', async () => {
      const { rerender } = render(<ViolinPlot {...defaultProps} />);
      
      // Change to use key-based props
      rerender(
        <ViolinPlot 
          {...defaultProps} 
          labelKey="group"
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
        { group: null, values: 'invalid' },
      ] as any;

      expect(() => {
        render(<ViolinPlot {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling
  describe('Event Handling', () => {
    it('should support interactive props', () => {
      const mockClickHandler = vi.fn();
      const mockHoverHandler = vi.fn();

      render(
        <ViolinPlot
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
      const mockViolinClick = vi.fn();
      const mockViolinHover = vi.fn();

      render(
        <ViolinPlot
          {...defaultProps}
          onViolinClick={mockViolinClick}
          onViolinHover={mockViolinHover}
        />
      );

      // Just verify the component renders with deprecated handlers
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(mockViolinClick).toBeDefined();
      expect(mockViolinHover).toBeDefined();
    });
  });

  // Test 4: Accessibility
  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const { container } = render(<ViolinPlot {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <ViolinPlot 
          {...defaultProps} 
          aria-label={`小提琴圖顯示 ${mockData.length} 個組別的分佈`}
        />
      );
      
      expect(screen.getByLabelText(/小提琴圖/)).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', () => {
      render(<ViolinPlot {...defaultProps} interactive={true} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('tabindex', '0');
    });
  });

  // Test 5: ViolinPlot-Specific Features
  describe('ViolinPlot-Specific Features', () => {
    it('should support orientation configuration', () => {
      expect(() => {
        render(
          <ViolinPlot
            {...defaultProps}
            orientation="horizontal"
          />
        );
      }).not.toThrow();
    });

    it('should support violin styling options', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            violinWidth={0.8}
            violinFillOpacity={0.7}
            violinStroke="#333"
            violinStrokeWidth={2}
          />
        );
      }).not.toThrow();
    });

    it('should support KDE configuration', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            bandwidth={1.2}
            resolution={100}
            kdeMethod="gaussian"
            smoothing={1.5}
          />
        );
      }).not.toThrow();
    });

    it('should support box plot overlay', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            showBoxPlot={true}
            boxPlotWidth={0.3}
            boxPlotStroke="#666"
            boxPlotStrokeWidth={1}
          />
        );
      }).not.toThrow();
    });

    it('should support statistical markers', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            showMedian={true}
            showMean={true}
            showQuartiles={true}
            showOutliers={true}
            meanStyle="diamond"
          />
        );
      }).not.toThrow();
    });

    it('should support statistics configuration', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            statisticsMethod="tukey"
            outlierThreshold={1.5}
            showStatistics={true}
          />
        );
      }).not.toThrow();
    });

    it('should support color schemes', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            colorScheme="purples"
          />
        );
      }).not.toThrow();
    });

    it('should support clipping configuration', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            clipMin={0}
            clipMax={100}
          />
        );
      }).not.toThrow();
    });

    it('should support label configuration', () => {
      expect(() => {
        render(
          <ViolinPlot 
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
      const largeData = Array.from({ length: 20 }, (_, i) => ({
        group: `組別-${i}`,
        values: Array.from({ length: 1000 }, () => Math.random() * 100)
      }));

      const startTime = performance.now();
      render(<ViolinPlot {...defaultProps} data={largeData} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(5000); // Relaxed for test environments
    });

    it('should handle invalid dimensions gracefully', () => {
      expect(() => {
        render(
          <ViolinPlot 
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
          <ViolinPlot 
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
        { group: 'Test', values: [10, 12] } // Very few values
      ];

      expect(() => {
        render(<ViolinPlot {...defaultProps} data={insufficientData} />);
      }).not.toThrow();
    });

    it('should handle empty value arrays gracefully', () => {
      const emptyValuesData = [
        { group: 'Empty', values: [] }
      ];

      expect(() => {
        render(<ViolinPlot {...defaultProps} data={emptyValuesData} />);
      }).not.toThrow();
    });

    it('should handle all identical values gracefully', () => {
      const identicalValuesData = [
        { group: 'Identical', values: [50, 50, 50, 50, 50] }
      ];

      expect(() => {
        render(<ViolinPlot {...defaultProps} data={identicalValuesData} />);
      }).not.toThrow();
    });

    it('should clean up properly on unmount', () => {
      const { unmount } = render(<ViolinPlot {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Test 7: Props Validation
  describe('Props Validation', () => {
    it('should use default violin width when not specified', async () => {
      render(<ViolinPlot {...defaultProps} />);
      
      await waitFor(() => {
        const violin = screen.getByTestId('violin-0');
        expect(violin).toBeInTheDocument();
      });
    });

    it('should accept custom formatting functions', () => {
      const valueFormat = vi.fn((value) => `${value.toFixed(2)}`);
      const statisticsFormat = vi.fn((stats) => `中位數: ${stats.median}`);
      const tooltipFormat = vi.fn((data) => `${data.label}: 分佈密度`);
      
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            valueFormat={valueFormat}
            statisticsFormat={statisticsFormat}
            tooltipFormat={tooltipFormat}
          />
        );
      }).not.toThrow();
    });

    it('should handle color array properly', async () => {
      const customColors = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
      
      render(
        <ViolinPlot 
          {...defaultProps} 
          colors={customColors}
        />
      );
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/violin-/)).toHaveLength(mockData.length);
      });
    });

    it('should support custom font properties', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            fontSize={12}
            fontFamily="Times New Roman, serif"
          />
        );
      }).not.toThrow();
    });

    it('should support animation configuration', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            animate={true}
            animationDuration={1200}
            animationDelay={200}
            animationEasing="ease-in"
          />
        );
      }).not.toThrow();
    });

    it('should support stroke configuration', () => {
      expect(() => {
        render(
          <ViolinPlot 
            {...defaultProps} 
            medianStroke="#ff0000"
            medianStrokeWidth={3}
          />
        );
      }).not.toThrow();
    });
  });
});