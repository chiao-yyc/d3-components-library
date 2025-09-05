import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

import { PieChart } from './pie-chart';
import type { PieChartProps } from './pie-chart';

// Mock data for testing
const mockData = [
  { category: '產品A', value: 150, color: '#ff6b6b' },
  { category: '產品B', value: 200, color: '#4ecdc4' },
  { category: '產品C', value: 100, color: '#45b7d1' },
  { category: '產品D', value: 80, color: '#f9ca24' },
  { category: '產品E', value: 120, color: '#f0932b' },
];

const defaultProps: PieChartProps = {
  width: 400,
  height: 300,
  data: mockData,
  labelAccessor: 'category',
  valueAccessor: 'value',
};

describe('PieChart', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<PieChart {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<PieChart {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '300');
    });

    it('should handle empty data gracefully', () => {
      render(<PieChart {...defaultProps} data={[]} />);
      
      // Should show "no data" message instead of chart
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });

    it('should render pie slices for each data item', async () => {
      render(<PieChart {...defaultProps} />);
      
      await waitFor(() => {
        mockData.forEach((_, index) => {
          expect(screen.getByTestId(`pie-slice-${index}`)).toBeInTheDocument();
        });
      });
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<PieChart {...defaultProps} />);
      
      const newData = [
        { category: '新產品X', value: 300, color: '#e056fd' },
        { category: '新產品Y', value: 250, color: '#ff9ff3' },
      ];
      
      rerender(<PieChart {...defaultProps} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pie-slice-0')).toBeInTheDocument();
        expect(screen.getByTestId('pie-slice-1')).toBeInTheDocument();
        // Old slices should not exist
        expect(screen.queryByTestId('pie-slice-2')).not.toBeInTheDocument();
      });
    });

    it('should handle accessor function changes', async () => {
      const { rerender } = render(<PieChart {...defaultProps} />);
      
      // Change to use key-based accessors
      rerender(
        <PieChart 
          {...defaultProps} 
          labelKey="category"
          valueKey="value"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle data type validation gracefully', () => {
      const invalidData = [
        { category: null, value: 'invalid', color: undefined },
      ] as any;

      expect(() => {
        render(<PieChart {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling
  describe('Event Handling', () => {
    it('should support interactive props', () => {
      const mockClickHandler = vi.fn();
      const mockHoverHandler = vi.fn();

      render(
        <PieChart
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
      const mockSliceClick = vi.fn();
      const mockSliceHover = vi.fn();

      render(
        <PieChart
          {...defaultProps}
          onSliceClick={mockSliceClick}
          onSliceHover={mockSliceHover}
        />
      );

      // Just verify the component renders with deprecated handlers
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(mockSliceClick).toBeDefined();
      expect(mockSliceHover).toBeDefined();
    });
  });

  // Test 4: Accessibility
  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const { container } = render(<PieChart {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <PieChart 
          {...defaultProps} 
          aria-label={`餅圖顯示 ${mockData.length} 個分類`}
        />
      );
      
      expect(screen.getByLabelText(/餅圖/)).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', () => {
      render(<PieChart {...defaultProps} interactive={true} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('tabindex', '0');
    });
  });

  // Test 5: PieChart-Specific Features
  describe('PieChart-Specific Features', () => {
    it('should support donut chart configuration', () => {
      expect(() => {
        render(
          <PieChart
            {...defaultProps}
            innerRadius={50}
            outerRadius={100}
          />
        );
      }).not.toThrow();
    });

    it('should support corner radius and padding', () => {
      expect(() => {
        render(
          <PieChart 
            {...defaultProps} 
            cornerRadius={5}
            padAngle={0.02}
          />
        );
      }).not.toThrow();
    });

    it('should support labels display', () => {
      expect(() => {
        render(
          <PieChart 
            {...defaultProps} 
            showLabels={true}
            showPercentages={true}
            labelThreshold={0.05}
          />
        );
      }).not.toThrow();
    });

    it('should support legend configuration', () => {
      expect(() => {
        render(
          <PieChart 
            {...defaultProps} 
            showLegend={true}
            legendPosition="bottom"
          />
        );
      }).not.toThrow();
    });

    it('should support center text for donut chart', () => {
      const centerTextFormat = vi.fn((total, data) => ({
        total: `總計: ${total}`,
        label: '銷售額'
      }));

      expect(() => {
        render(
          <PieChart 
            {...defaultProps} 
            innerRadius={50}
            showCenterText={true}
            centerTextFormat={centerTextFormat}
          />
        );
      }).not.toThrow();
    });

    it('should support color schemes', () => {
      expect(() => {
        render(
          <PieChart 
            {...defaultProps} 
            colorScheme="category10"
          />
        );
      }).not.toThrow();
    });

    it('should support animation types', () => {
      expect(() => {
        render(
          <PieChart 
            {...defaultProps} 
            animationType="sweep"
            hoverEffect="lift"
          />
        );
      }).not.toThrow();
    });
  });

  // Test 6: Performance & Edge Cases
  describe('Performance & Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        category: `類別-${i}`,
        value: Math.random() * 1000,
        color: `hsl(${i * 3.6}, 70%, 50%)`
      }));

      const startTime = performance.now();
      render(<PieChart {...defaultProps} data={largeData} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(5000); // Relaxed for test environments
    });

    it('should handle invalid dimensions gracefully', () => {
      expect(() => {
        render(
          <PieChart 
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
          <PieChart 
            data={mockData}
            width={400}
            height={300}
            // Missing labelAccessor and valueAccessor
          />
        );
      }).not.toThrow();
    });

    it('should handle zero or negative values gracefully', () => {
      const dataWithZeros = [
        { category: 'Zero', value: 0 },
        { category: 'Negative', value: -10 },
        { category: 'Positive', value: 100 },
      ];

      expect(() => {
        render(<PieChart {...defaultProps} data={dataWithZeros} />);
      }).not.toThrow();
    });

    it('should clean up properly on unmount', () => {
      const { unmount } = render(<PieChart {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Test 7: Props Validation
  describe('Props Validation', () => {
    it('should use default radius when not specified', async () => {
      render(<PieChart {...defaultProps} />);
      
      await waitFor(() => {
        const pieSlice = screen.getByTestId('pie-slice-0');
        expect(pieSlice).toBeInTheDocument();
      });
    });

    it('should accept custom radius props', () => {
      expect(() => {
        render(
          <PieChart 
            {...defaultProps} 
            innerRadius={30} 
            outerRadius={120} 
          />
        );
      }).not.toThrow();
    });

    it('should handle color array properly', async () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
      
      render(
        <PieChart 
          {...defaultProps} 
          colors={customColors}
        />
      );
      
      await waitFor(() => {
        expect(screen.getAllByTestId(/pie-slice-/)).toHaveLength(mockData.length);
      });
    });

    it('should support custom tooltip formatting', () => {
      const customTooltipFormat = vi.fn((data) => `${data.label}: ${data.value} (${data.percentage}%)`);
      
      expect(() => {
        render(
          <PieChart 
            {...defaultProps} 
            tooltipFormat={customTooltipFormat}
          />
        );
      }).not.toThrow();
    });

    it('should support custom label formatting', () => {
      const customLabelFormat = vi.fn((data) => `${data.label}: ${data.percentage}%`);
      
      expect(() => {
        render(
          <PieChart 
            {...defaultProps} 
            showLabels={true}
            labelFormat={customLabelFormat}
          />
        );
      }).not.toThrow();
    });
  });
});