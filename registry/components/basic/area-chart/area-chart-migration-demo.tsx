/**
 * AreaChart Migration Demo
 * Simple test to verify both old and new implementations work
 */

import React from 'react';
import { AreaChart } from './area-chart';
import { AreaChartV2, StackedAreaChartV2 } from './area-chart-v2';

// Sample time series data for testing
const timeSeriesData = [
  { date: new Date('2023-01'), revenue: 120, profit: 20, category: 'Q1' },
  { date: new Date('2023-02'), revenue: 150, profit: 30, category: 'Q1' },
  { date: new Date('2023-03'), revenue: 180, profit: 45, category: 'Q1' },
  { date: new Date('2023-04'), revenue: 160, profit: 35, category: 'Q2' },
  { date: new Date('2023-05'), revenue: 200, profit: 55, category: 'Q2' },
  { date: new Date('2023-06'), revenue: 220, profit: 60, category: 'Q2' },
];

// Sample multi-series data
const multiSeriesData = [
  { month: 'Jan', sales: 100, marketing: 50, support: 20 },
  { month: 'Feb', sales: 120, marketing: 60, support: 25 },
  { month: 'Mar', sales: 140, marketing: 70, support: 30 },
  { month: 'Apr', sales: 130, marketing: 65, support: 28 },
  { month: 'May', sales: 160, marketing: 80, support: 35 },
];

export const AreaChartMigrationDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>AreaChart Migration Demo</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        
        {/* Legacy Implementation - Simple Area */}
        <div>
          <h2>Legacy AreaChart (BaseChart Pattern)</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <AreaChart
              data={timeSeriesData}
              width={400}
              height={250}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xKey="date"
              yKey="revenue"
              colors={['#3b82f6']}
              onDataClick={(data, event) => {
                console.log('Legacy AreaChart clicked:', data);
              }}
            />
          </div>
          <p><strong>Pattern:</strong> BaseChart + createChartComponent</p>
          <p><strong>Data:</strong> Time series with single area</p>
        </div>

        {/* New Implementation - Simple Area */}
        <div>
          <h2>Modern AreaChartV2 (BaseChartCore Pattern)</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <AreaChartV2
              data={timeSeriesData}
              width={400}
              height={250}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xAccessor="date"
              yAccessor="revenue"
              colors={['#3b82f6']}
              curve="monotone"
              onDataClick={(data, event) => {
                console.log('Modern AreaChartV2 clicked:', data);
              }}
            />
          </div>
          <p><strong>Pattern:</strong> BaseChartCore + createReactChartWrapper</p>
          <p><strong>Features:</strong> Smooth curve, framework-agnostic core</p>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        
        {/* Legacy Stacked Area */}
        <div>
          <h2>Legacy Stacked Area</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <AreaChart
              data={multiSeriesData}
              width={400}
              height={250}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xKey="month"
              yKey="sales"
              variant="stacked"
              colors={['#3b82f6', '#ef4444', '#10b981']}
            />
          </div>
          <p><strong>Legacy stacking</strong> with variant prop</p>
        </div>

        {/* New Stacked Area */}
        <div>
          <h2>Modern Stacked AreaV2</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <StackedAreaChartV2
              data={multiSeriesData}
              width={400}
              height={250}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xAccessor="month"
              yAccessor="sales"
              categoryAccessor={(d) => 'sales'} // Simple category
              colors={['#3b82f6', '#ef4444', '#10b981']}
              showPoints={true}
              fillOpacity={0.8}
            />
          </div>
          <p><strong>Modern stacking</strong> with dedicated component and enhanced features</p>
        </div>

      </div>

      {/* Migration Notes */}
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>🔄 AreaChart Migration Notes</h3>
        <ul>
          <li><strong>API Changes:</strong> <code>xKey</code> → <code>xAccessor</code>, <code>yKey</code> → <code>yAccessor</code></li>
          <li><strong>Stacking:</strong> <code>variant="stacked"</code> → <code>stackMode="normal"</code> + dedicated components</li>
          <li><strong>Curves:</strong> New <code>curve</code> prop supports multiple interpolation types</li>
          <li><strong>Enhanced Features:</strong> Points display, gradient fills, better interaction</li>
          <li><strong>Architecture:</strong> Framework-agnostic core with React wrapper</li>
        </ul>
      </div>

      {/* Feature Showcase */}
      <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h3>⭐ Enhanced Features in V2</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4>Visual Enhancements</h4>
            <ul>
              <li>✨ Multiple curve types (linear, monotone, cardinal, basis)</li>
              <li>🎨 Configurable fill opacity</li>
              <li>📍 Optional point display</li>
              <li>🌈 Gradient fill support</li>
              <li>📊 Enhanced grid system</li>
            </ul>
          </div>
          <div>
            <h4>Architecture Benefits</h4>
            <ul>
              <li>⚡ Framework-independent core logic</li>
              <li>🧪 Easy unit testing</li>
              <li>🔧 Better performance optimization</li>
              <li>🔄 Consistent API across components</li>
              <li>📱 Vue/Angular ready</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h4>💻 Code Examples</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <strong>Legacy (still supported):</strong>
            <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`<AreaChart
  data={data}
  xKey="date"
  yKey="value"
  variant="stacked"
  colors={['#blue']}
/>`}
            </pre>
          </div>
          <div>
            <strong>Modern (recommended):</strong>
            <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`<AreaChartV2
  data={data}
  xAccessor="date"
  yAccessor="value"
  stackMode="normal"
  curve="monotone"
  showPoints={true}
  colors={['#blue']}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaChartMigrationDemo;