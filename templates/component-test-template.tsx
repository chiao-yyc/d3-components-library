import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { vi } from 'vitest';

// Import the component to test
import { ComponentName } from './component-name';
import type { ComponentNameProps } from './core/types';

// Mock data for testing
const mockData = [
  { x: 10, y: 20, value: 100 },
  { x: 20, y: 30, value: 150 },
  { x: 30, y: 40, value: 200 },
];

const defaultProps: ComponentNameProps = {
  width: 400,
  height: 300,
  data: mockData,
  xAccessor: (d) => d.x,
  yAccessor: (d) => d.y,
};

describe('ComponentName', () => {
  // Test 1: Basic Rendering
  describe('Basic Rendering', () => {
    it('should render with minimal props', () => {
      render(<ComponentName {...defaultProps} />);
      
      // Check that the chart container exists
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should render SVG element with correct dimensions', () => {
      render(<ComponentName {...defaultProps} />);
      
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '300');
    });

    it('should handle empty data gracefully', () => {
      render(<ComponentName {...defaultProps} data={[]} />);
      
      // Should not throw error and might show empty state
      expect(screen.getByRole('img')).toBeInTheDocument();
    });
  });

  // Test 2: Data Updates
  describe('Data Updates', () => {
    it('should update when data changes', async () => {
      const { rerender } = render(<ComponentName {...defaultProps} />);
      
      const newData = [
        { x: 40, y: 50, value: 250 },
        { x: 50, y: 60, value: 300 },
      ];
      
      rerender(<ComponentName {...defaultProps} data={newData} />);
      
      // Wait for re-render to complete
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('should handle data type validation', () => {
      // Test with invalid data
      const invalidData = [
        { x: 'invalid', y: null, value: undefined },
      ] as any;

      // Should handle gracefully without crashing
      expect(() => {
        render(<ComponentName {...defaultProps} data={invalidData} />);
      }).not.toThrow();
    });
  });

  // Test 3: Event Handling
  describe('Event Handling', () => {
    it('should emit correct events on data interaction', async () => {
      const user = userEvent.setup();
      const mockClickHandler = vi.fn();
      const mockHoverHandler = vi.fn();

      render(
        <ComponentName
          {...defaultProps}
          onDataClick={mockClickHandler}
          onDataHover={mockHoverHandler}
        />
      );

      // Find and click a data point (adjust selector based on component)
      const dataPoint = screen.getByTestId('data-point-0');
      await user.click(dataPoint);

      expect(mockClickHandler).toHaveBeenCalledWith(
        mockData[0],
        expect.any(Object)
      );
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);

      const chartContainer = screen.getByRole('img');
      await user.tab();
      
      expect(chartContainer).toHaveFocus();
    });
  });

  // Test 4: Accessibility
  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const { container } = render(<ComponentName {...defaultProps} />);
      const results = await axe(container);
      
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels', () => {
      render(
        <ComponentName 
          {...defaultProps} 
          aria-label="Test chart showing data visualization"
        />
      );
      
      expect(screen.getByLabelText(/test chart/i)).toBeInTheDocument();
    });

    it('should support screen readers', () => {
      render(<ComponentName {...defaultProps} />);
      
      const chartElement = screen.getByRole('img');
      expect(chartElement).toHaveAttribute('aria-label');
    });
  });

  // Test 5: Performance & Edge Cases
  describe('Performance & Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
        value: Math.random() * 1000,
      }));

      const startTime = performance.now();
      render(<ComponentName {...defaultProps} data={largeData} />);
      const renderTime = performance.now() - startTime;

      // Should render within 1 second for 10K points
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle prop changes without memory leaks', () => {
      const { rerender, unmount } = render(<ComponentName {...defaultProps} />);
      
      // Change props multiple times
      for (let i = 0; i < 10; i++) {
        rerender(
          <ComponentName
            {...defaultProps}
            width={400 + i}
            height={300 + i}
          />
        );
      }

      // Unmount should clean up properly
      expect(() => unmount()).not.toThrow();
    });

    it('should handle invalid dimensions', () => {
      expect(() => {
        render(
          <ComponentName 
            {...defaultProps} 
            width={0} 
            height={0} 
          />
        );
      }).not.toThrow();
    });
  });

  // Test 6: Component-Specific Functionality
  describe('Component-Specific Features', () => {
    // Add tests specific to the component type
    // For example, for ScatterPlot:
    it('should render scatter points correctly', () => {
      render(<ComponentName {...defaultProps} />);
      
      // Check that data points are rendered
      mockData.forEach((_, index) => {
        expect(screen.getByTestId(`data-point-${index}`)).toBeInTheDocument();
      });
    });

    // For components with special features like trendlines:
    it('should show trendline when enabled', () => {
      render(
        <ComponentName 
          {...defaultProps} 
          showTrendline={true}
        />
      );
      
      expect(screen.getByTestId('trendline')).toBeInTheDocument();
    });

    // For interactive components:
    it('should support zoom functionality', async () => {
      const user = userEvent.setup();
      const mockZoomHandler = vi.fn();

      render(
        <ComponentName
          {...defaultProps}
          enableBrushZoom={true}
          onZoom={mockZoomHandler}
        />
      );

      // Simulate brush selection
      const chartArea = screen.getByTestId('chart-area');
      await user.pointer([
        { target: chartArea, coords: { x: 50, y: 50 } },
        { keys: '[MouseLeft>]', coords: { x: 50, y: 50 } },
        { coords: { x: 150, y: 150 } },
        { keys: '[/MouseLeft]', coords: { x: 150, y: 150 } }
      ]);

      expect(mockZoomHandler).toHaveBeenCalled();
    });
  });
});