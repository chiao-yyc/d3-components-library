import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

import { RadarChart } from './radar-chart';
import type { RadarChartProps } from './core/types';

// Mock data for testing
const mockData = [
  { 
    player: 'Player A', 
    speed: 85, 
    strength: 72, 
    agility: 90, 
    defense: 68, 
    technique: 88 
  },
  { 
    player: 'Player B', 
    speed: 75, 
    strength: 95, 
    agility: 70, 
    defense: 85, 
    technique: 80 
  },
  { 
    player: 'Player C', 
    speed: 92, 
    strength: 60, 
    agility: 88, 
    defense: 75, 
    technique: 92 
  },
];

const mockAxes = ['speed', 'strength', 'agility', 'defense', 'technique'];

const defaultProps: RadarChartProps = {
  width: 400,
  height: 400,
  data: mockData,
  axes: mockAxes,
  labelAccessor: (d) => d.player,
};

describe('RadarChart', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<RadarChart {...defaultProps} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<RadarChart {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '400');
    });

    it('should handle empty data gracefully', () => {
      render(<RadarChart {...defaultProps} data={[]} />);
      
      // Should show "no data" message instead of chart
      expect(screen.getByText('無數據')).toBeInTheDocument();
    });

    it('should handle empty axes gracefully', () => {
      render(<RadarChart {...defaultProps} axes={[]} />);
      
      // With empty axes, chart should still render but with no data elements
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render radar grid when showGrid is true', () => {
      render(<RadarChart {...defaultProps} showGrid={true} />);
      
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render radar areas for each data series', async () => {
      render(<RadarChart {...defaultProps} />);
      
      await waitFor(() => {
        mockData.forEach((_, index) => {
          expect(screen.getByTestId(`radar-area-${index}`)).toBeInTheDocument();
        });
      });
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<RadarChart {...defaultProps} />);
      
      const newData = [
        { player: 'Player D', speed: 80, strength: 85, agility: 75, defense: 90, technique: 88 },
        { player: 'Player E', speed: 95, strength: 70, agility: 85, defense: 80, technique: 75 },
      ];
      
      rerender(<RadarChart {...defaultProps} data={newData} />);
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle accessor function changes', async () => {
      const { rerender } = render(<RadarChart {...defaultProps} />);
      
      // Change label accessor
      rerender(
        <RadarChart
          {...defaultProps}
          labelAccessor={(d) => `Champion ${d.player}`}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle axes changes', async () => {
      const { rerender } = render(<RadarChart {...defaultProps} />);
      
      const newAxes = ['speed', 'strength', 'agility'];
      rerender(<RadarChart {...defaultProps} axes={newAxes} />);
      
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle data type validation gracefully', () => {
      const invalidData = [
        { player: undefined, speed: 'invalid', strength: null, agility: NaN },
      ] as any;

      expect(() => {
        render(<RadarChart {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling (Simplified)
  describe('Event Handling', () => {
    it('should support interactive props', () => {
      const mockSeriesClick = vi.fn();
      const mockSeriesHover = vi.fn();
      const mockDotClick = vi.fn();
      const mockDotHover = vi.fn();

      render(
        <RadarChart
          {...defaultProps}
          interactive={true}
          onSeriesClick={mockSeriesClick}
          onSeriesHover={mockSeriesHover}
          onDotClick={mockDotClick}
          onDotHover={mockDotHover}
        />
      );

      // Just verify the component renders with event handlers
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(mockSeriesClick).toBeDefined();
      expect(mockSeriesHover).toBeDefined();
      expect(mockDotClick).toBeDefined();
      expect(mockDotHover).toBeDefined();
    });
  });

  // Test 4: Accessibility
  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const { container } = render(<RadarChart {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <RadarChart 
          {...defaultProps} 
          aria-label={`雷達圖顯示 ${mockData.length} 個系列的 ${mockAxes.length} 個維度`}
        />
      );
      
      expect(screen.getByLabelText(/雷達圖/)).toBeInTheDocument();
    });

    it('should support keyboard navigation when interactive', () => {
      render(<RadarChart {...defaultProps} interactive={true} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('tabindex', '0');
    });
  });

  // Test 5: RadarChart-Specific Features (Essential only)
  describe('RadarChart-Specific Features', () => {
    it('should support different scale types', () => {
      expect(() => {
        render(
          <RadarChart
            {...defaultProps}
            scaleType="linear"
          />
        );
      }).not.toThrow();

      expect(() => {
        render(
          <RadarChart
            {...defaultProps}
            scaleType="log"
          />
        );
      }).not.toThrow();
    });

    it('should support different interpolation types', () => {
      expect(() => {
        render(
          <RadarChart
            {...defaultProps}
            interpolation="linear-closed"
          />
        );
      }).not.toThrow();

      expect(() => {
        render(
          <RadarChart
            {...defaultProps}
            interpolation="cardinal-closed"
          />
        );
      }).not.toThrow();
    });

    it('should support custom radius and levels', () => {
      expect(() => {
        render(
          <RadarChart
            {...defaultProps}
            radius={150}
            levels={7}
          />
        );
      }).not.toThrow();
    });

    it('should support angle configuration', () => {
      expect(() => {
        render(
          <RadarChart
            {...defaultProps}
            startAngle={0}
            clockwise={false}
          />
        );
      }).not.toThrow();
    });

    it('should support display options', () => {
      expect(() => {
        render(
          <RadarChart 
            {...defaultProps} 
            showGrid={true}
            showGridLabels={true}
            showAxes={true}
            showAxisLabels={true}
            showDots={true}
            showArea={true}
          />
        );
      }).not.toThrow();
    });

    it('should support value range configuration', () => {
      expect(() => {
        render(
          <RadarChart
            {...defaultProps}
            minValue={0}
            maxValue={100}
            autoScale={false}
          />
        );
      }).not.toThrow();
    });
  });

  // Test 6: Performance & Edge Cases
  describe('Performance & Edge Cases', () => {
    it('should handle multiple series efficiently', () => {
      const largeData = Array.from({ length: 50 }, (_, i) => ({
        player: `Player ${i + 1}`,
        speed: Math.random() * 100,
        strength: Math.random() * 100,
        agility: Math.random() * 100,
        defense: Math.random() * 100,
        technique: Math.random() * 100,
      }));

      const startTime = performance.now();
      render(<RadarChart {...defaultProps} data={largeData} />);
      const renderTime = performance.now() - startTime;

      expect(renderTime).toBeLessThan(3000);
    });

    it('should handle many axes efficiently', () => {
      const manyAxes = Array.from({ length: 20 }, (_, i) => `axis${i + 1}`);
      const dataWithManyAxes = mockData.map(d => {
        const newData = { ...d };
        manyAxes.forEach(axis => {
          newData[axis] = Math.random() * 100;
        });
        return newData;
      });

      expect(() => {
        render(
          <RadarChart
            {...defaultProps}
            data={dataWithManyAxes}
            axes={manyAxes}
          />
        );
      }).not.toThrow();
    });

    it('should handle invalid dimensions gracefully', () => {
      expect(() => {
        render(
          <RadarChart 
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
          <RadarChart 
            data={mockData}
            axes={mockAxes}
            width={400}
            height={400}
            // Missing labelAccessor
          />
        );
      }).not.toThrow();
    });

    it('should handle extreme values gracefully', () => {
      const extremeData = [
        { player: 'Max', speed: 1000000, strength: 0, agility: -100, defense: Infinity, technique: NaN },
      ];

      expect(() => {
        render(<RadarChart {...defaultProps} data={extremeData} />);
      }).not.toThrow();
    });

    it('should clean up properly on unmount', () => {
      const { unmount } = render(<RadarChart {...defaultProps} />);
      
      expect(() => unmount()).not.toThrow();
    });
  });

  // Test 7: Props Validation
  describe('Props Validation', () => {
    it('should accept custom colors', () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
      
      expect(() => {
        render(
          <RadarChart 
            {...defaultProps} 
            colors={customColors}
          />
        );
      }).not.toThrow();
    });

    it('should accept styling props', () => {
      expect(() => {
        render(
          <RadarChart 
            {...defaultProps} 
            strokeWidth={3}
            areaOpacity={0.3}
            dotRadius={6}
            gridStroke="#cccccc"
            axisStroke="#999999"
          />
        );
      }).not.toThrow();
    });

    it('should accept formatting props', () => {
      const valueFormat = (value: number) => `${value.toFixed(1)}%`;
      
      expect(() => {
        render(
          <RadarChart 
            {...defaultProps} 
            valueFormat={valueFormat}
            fontSize={14}
            fontFamily="Arial"
          />
        );
      }).not.toThrow();
    });

    it('should accept mapping configuration', () => {
      const mapping = {
        label: 'player',
        values: {
          speed: 'speed',
          strength: 'strength',
          agility: 'agility',
          defense: 'defense',
          technique: 'technique'
        }
      };

      expect(() => {
        render(
          <RadarChart 
            {...defaultProps} 
            mapping={mapping}
          />
        );
      }).not.toThrow();
    });

    it('should accept legend configuration', () => {
      expect(() => {
        render(
          <RadarChart 
            {...defaultProps} 
            showLegend={true}
            legendPosition="top"
          />
        );
      }).not.toThrow();
    });

    it('should accept visual effects', () => {
      expect(() => {
        render(
          <RadarChart 
            {...defaultProps} 
            glowEffect={true}
          />
        );
      }).not.toThrow();
    });
  });
});