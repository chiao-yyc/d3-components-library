/**
 * D3 Core utilities test
 * Tests D3 v6+ API compatibility and imports
 */

import { describe, it, expect } from 'vitest';
import { 
  select, 
  scaleLinear, 
  line, 
  axisBottom, 
  color, 
  easeLinear,
  interpolate,
  transition,
  timeFormat,
  timeParse,
  nest,
  safeSelect,
  createResponsiveScale,
  calculateDomain,
  safeColorInterpolate,
  configureAxis
} from './d3-core';

describe('D3 Core Utilities', () => {
  describe('D3 API Compatibility', () => {
    it('should import core D3 functions correctly', () => {
      expect(typeof select).toBe('function');
      expect(typeof scaleLinear).toBe('function');
      expect(typeof line).toBe('function');
      expect(typeof axisBottom).toBe('function');
      expect(typeof color).toBe('function');
      expect(typeof easeLinear).toBe('function');
      expect(typeof interpolate).toBe('function');
      expect(typeof transition).toBe('function');
      expect(typeof timeFormat).toBe('function');
      expect(typeof timeParse).toBe('function');
      expect(typeof nest).toBe('function');
    });

    it('should create working scales', () => {
      const scale = scaleLinear().domain([0, 100]).range([0, 500]);
      expect(scale(50)).toBe(250);
      expect(scale(0)).toBe(0);
      expect(scale(100)).toBe(500);
    });

    it('should create working colors', () => {
      const testColor = color('#ff0000');
      expect(testColor).not.toBeNull();
      expect(testColor?.formatHex()).toBe('#ff0000');
    });

    it('should handle color interpolation', () => {
      const interpolator = interpolate('#ff0000', '#0000ff');
      expect(typeof interpolator(0.5)).toBe('string');
    });

    it('should handle time formatting and parsing', () => {
      const formatTime = timeFormat('%Y-%m-%d');
      const parseTime = timeParse('%Y-%m-%d');
      
      const testDate = new Date(2023, 0, 1); // Jan 1, 2023
      const formattedDate = formatTime(testDate);
      expect(formattedDate).toBe('2023-01-01');
      
      const parsedDate = parseTime('2023-01-01');
      expect(parsedDate).toBeInstanceOf(Date);
    });
  });

  describe('Custom Utility Functions', () => {
    it('should create responsive scales', () => {
      const linearScale = createResponsiveScale('linear', [0, 100], [0, 500]);
      expect(linearScale(50)).toBe(250);

      const bandScale = createResponsiveScale('band', ['A', 'B', 'C'], [0, 300]);
      expect(bandScale.bandwidth()).toBeGreaterThan(0);
    });

    it('should calculate domains correctly', () => {
      const numericData = [
        { value: 10 },
        { value: 50 },
        { value: 30 }
      ];
      
      const domain = calculateDomain(numericData, d => d.value);
      expect(domain).toEqual([10, 50]);
    });

    it('should handle safe color interpolation', () => {
      const result = safeColorInterpolate('#ff0000', '#0000ff', 0.5);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // D3 interpolation returns rgb format, not hex
      expect(result.startsWith('rgb(')).toBe(true);
      
      // Test with valid colors - D3 can handle many color formats
      const fallback = safeColorInterpolate('red', 'blue', 0.3);
      expect(typeof fallback).toBe('string');
      expect(fallback.length).toBeGreaterThan(0);
    });

    it('should configure axes properly', () => {
      const scale = scaleLinear().domain([0, 100]).range([0, 500]);
      const axis = axisBottom(scale);
      
      const configuredAxis = configureAxis(axis, scale, {
        ticks: 10,
        tickPadding: 5
      });
      
      expect(configuredAxis).toBe(axis); // Should return same axis object
    });
  });

  describe('Legacy Compatibility', () => {
    it('should provide nest compatibility', () => {
      const testData = [
        { category: 'A', value: 10 },
        { category: 'A', value: 20 },
        { category: 'B', value: 15 }
      ];

      const nestedData = nest()
        .key(d => d.category)
        .entries(testData);

      expect(Array.isArray(nestedData)).toBe(true);
      expect(nestedData).toHaveLength(2);
      expect(nestedData[0]).toHaveProperty('key');
      expect(nestedData[0]).toHaveProperty('values');
    });

    it('should handle nest rollup functionality', () => {
      const testData = [
        { category: 'A', value: 10 },
        { category: 'A', value: 20 },
        { category: 'B', value: 15 }
      ];

      const rolledUpData = nest()
        .key(d => d.category)
        .rollup(values => values.length)
        .entries(testData);

      expect(rolledUpData).toHaveLength(2);
      expect(rolledUpData[0].values).toBe(2); // Category A has 2 items
      expect(rolledUpData[1].values).toBe(1); // Category B has 1 item
    });
  });

  describe('Error Handling', () => {
    it('should handle empty data in calculateDomain', () => {
      const domain = calculateDomain([], d => d.value);
      expect(domain).toEqual([0, 1]);
    });

    it('should handle invalid scale types', () => {
      expect(() => {
        createResponsiveScale('invalid' as any, [0, 1], [0, 100]);
      }).toThrow('Unsupported scale type: invalid');
    });

    it('should handle DOM selection errors gracefully', () => {
      expect(() => {
        safeSelect('#non-existent-element');
      }).toThrow('Element not found: #non-existent-element');
    });
  });
});