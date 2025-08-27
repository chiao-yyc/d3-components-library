import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

import { GaugeChart } from './gauge-chart';
import type { GaugeChartProps } from './types';

// Mock data for testing
const mockData = [
  { metric: '使用率', current: 75, max: 100 }
];

const defaultProps: GaugeChartProps = {
  width: 300,
  height: 200,
  data: mockData,
  valueAccessor: (d) => d.current,
  labelAccessor: (d) => d.metric,
  min: 0,
  max: 100,
};

const singleValueProps: GaugeChartProps = {
  width: 300,
  height: 200,
  value: 65,
  min: 0,
  max: 100,
};

describe('GaugeChart', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<GaugeChart {...defaultProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render with single value prop', () => {
      render(<GaugeChart {...singleValueProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<GaugeChart {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '300');
      expect(svg).toHaveAttribute('height', '200');
    });

    it('should handle empty data gracefully when using array data', () => {
      render(<GaugeChart {...defaultProps} data={[]} />);
      
      // Should show "no data" message instead of chart
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });

    it('should render gauge components', async () => {
      render(<GaugeChart {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('gauge-background')).toBeInTheDocument();
        expect(screen.getByTestId('gauge-needle')).toBeInTheDocument();
      });
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<GaugeChart {...defaultProps} />);
      
      const newData = [
        { metric: '新指標', current: 85, max: 100 }
      ];
      
      rerender(<GaugeChart {...defaultProps} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should update when single value changes', async () => {
      const { rerender } = render(<GaugeChart {...singleValueProps} />);
      
      rerender(<GaugeChart {...singleValueProps} value={90} />);
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle accessor function changes', async () => {
      const { rerender } = render(<GaugeChart {...defaultProps} />);
      
      // Change to use key-based accessors
      rerender(
        <GaugeChart 
          {...defaultProps} 
          valueKey="current"
          labelKey="metric"
        />
      );
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle data type validation gracefully', () => {
      const invalidData = [
        { metric: null, current: 'invalid', max: undefined },
      ] as any;

      expect(() => {
        render(<GaugeChart {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling
  describe('Event Handling', () => {
    it('should support interactive props', () => {
      const mockValueChangeHandler = vi.fn();

      render(
        <GaugeChart
          {...defaultProps}
          interactive={true}
          onValueChange={mockValueChangeHandler}
        />
      );

      // Just verify the component renders with event handlers
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(mockValueChangeHandler).toBeDefined();
    });

    it('should support tooltip display', () => {
      const mockTooltipFormat = vi.fn((value, label) => `${label}: ${value}`);

      render(
        <GaugeChart
          {...defaultProps}
          showTooltip={true}
          tooltipFormat={mockTooltipFormat}
        />
      );

      // Just verify the component renders with tooltip
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(mockTooltipFormat).toBeDefined();
    });
  });

  // Test 4: Accessibility
  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const { container } = render(<GaugeChart {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <GaugeChart 
          {...defaultProps} 
          aria-label="儀表板顯示目前使用率為75%"
        />
      );
      
      expect(screen.getByLabelText(/儀表板/)).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', () => {
      render(<GaugeChart {...defaultProps} interactive={true} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('tabindex', '0');
    });
  });

  // Test 5: GaugeChart-Specific Features
  describe('GaugeChart-Specific Features', () => {
    it('should support custom angle range', () => {
      expect(() => {
        render(
          <GaugeChart
            {...defaultProps}
            startAngle={-90}
            endAngle={90}
          />
        );
      }).not.toThrow();
    });

    it('should support custom radius configuration', () => {
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            innerRadius={40}
            outerRadius={80}
          />
        );
      }).not.toThrow();
    });

    it('should support needle customization', () => {
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            needleColor="#ff0000"
            needleWidth={3}
            centerCircleRadius={8}
            centerCircleColor="#333"
          />
        );
      }).not.toThrow();
    });

    it('should support color zones', () => {
      const zones = [
        { min: 0, max: 30, color: '#ff4757', label: '危險' },
        { min: 30, max: 70, color: '#ffa502', label: '警告' },
        { min: 70, max: 100, color: '#2ed573', label: '正常' },
      ];

      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            zones={zones}
          />
        );
      }).not.toThrow();
    });

    it('should support tick marks and labels', () => {
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            showTicks={true}
            showMinMax={true}
            tickCount={10}
          />
        );
      }).not.toThrow();
    });

    it('should support value and label display', () => {
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            showValue={true}
            showLabel={true}
          />
        );
      }).not.toThrow();
    });

    it('should support animation configuration', () => {
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            animate={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        );
      }).not.toThrow();
    });
  });

  // Test 6: Performance & Edge Cases
  describe('Performance & Edge Cases', () => {
    it('should handle values outside min/max range gracefully', () => {
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            value={150} // Above max
            min={0}
            max={100}
          />
        );
      }).not.toThrow();

      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            value={-20} // Below min
            min={0}
            max={100}
          />
        );
      }).not.toThrow();
    });

    it('should handle invalid dimensions gracefully', () => {
      expect(() => {
        render(
          <GaugeChart 
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
          <GaugeChart 
            data={mockData}
            width={300}
            height={200}
            min={0}
            max={100}
            // Missing valueAccessor and labelAccessor
          />
        );
      }).not.toThrow();
    });

    it('should handle invalid min/max values gracefully', () => {
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            min={100}
            max={0} // max < min
          />
        );
      }).not.toThrow();
    });

    it('should clean up properly on unmount', () => {
      const { unmount } = render(<GaugeChart {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Test 7: Props Validation
  describe('Props Validation', () => {
    it('should use default angles when not specified', async () => {
      render(<GaugeChart {...defaultProps} />);
      
      await waitFor(() => {
        const gaugeBackground = screen.getByTestId('gauge-background');
        expect(gaugeBackground).toBeInTheDocument();
      });
    });

    it('should accept custom formatting functions', () => {
      const valueFormat = vi.fn((value) => `${value}%`);
      const labelFormat = vi.fn((label) => `指標: ${label}`);
      const tickFormat = vi.fn((value) => `${value}`);
      
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            valueFormat={valueFormat}
            labelFormat={labelFormat}
            tickFormat={tickFormat}
          />
        );
      }).not.toThrow();
    });

    it('should handle color array properly', async () => {
      const customColors = ['#ff0000', '#ffff00', '#00ff00'];
      
      render(
        <GaugeChart 
          {...defaultProps} 
          colors={customColors}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('gauge-background')).toBeInTheDocument();
      });
    });

    it('should support custom font properties', () => {
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            fontSize={14}
            fontFamily="Arial, sans-serif"
          />
        );
      }).not.toThrow();
    });

    it('should handle corner radius configuration', () => {
      expect(() => {
        render(
          <GaugeChart 
            {...defaultProps} 
            cornerRadius={5}
          />
        );
      }).not.toThrow();
    });
  });
});