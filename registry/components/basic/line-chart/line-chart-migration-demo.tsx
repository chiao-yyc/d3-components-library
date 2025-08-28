/**
 * LineChart Migration Demo
 * Showcase of old vs new LineChart implementations with enhanced features
 */

import React from 'react';
import { LineChart } from './line-chart';
import { 
  LineChartV2, 
  SmoothLineChartV2, 
  LineChartWithPointsV2,
  DottedLineChartV2 
} from './line-chart-v2';

// Sample time series data
const timeSeriesData = [
  { date: new Date('2023-01'), sales: 100, profit: 20 },
  { date: new Date('2023-02'), sales: 120, profit: 25 },
  { date: new Date('2023-03'), sales: 110, profit: 18 },
  { date: new Date('2023-04'), sales: 150, profit: 35 },
  { date: new Date('2023-05'), sales: 140, profit: 30 },
  { date: new Date('2023-06'), sales: 180, profit: 45 },
  { date: new Date('2023-07'), sales: 170, profit: 40 },
  { date: new Date('2023-08'), sales: 190, profit: 50 },
];

// Multi-series data
const multiSeriesData = [
  { month: 'Jan', desktop: 186, mobile: 80, tablet: 45 },
  { month: 'Feb', desktop: 305, mobile: 200, tablet: 60 },
  { month: 'Mar', desktop: 237, mobile: 120, tablet: 55 },
  { month: 'Apr', desktop: 373, mobile: 190, tablet: 70 },
  { month: 'May', desktop: 209, mobile: 130, tablet: 50 },
  { month: 'Jun', desktop: 214, mobile: 140, tablet: 65 },
];

// Data with missing values
const gappedData = [
  { x: 1, y: 10 },
  { x: 2, y: 15 },
  { x: 3, y: null }, // Missing value
  { x: 4, y: 25 },
  { x: 5, y: 30 },
  { x: 6, y: null }, // Missing value
  { x: 7, y: 45 },
  { x: 8, y: 40 },
];

export const LineChartMigrationDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>LineChart Migration Demo</h1>
      
      {/* Basic Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        
        <div>
          <h2>Legacy LineChart</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <LineChart
              data={timeSeriesData}
              width={400}
              height={250}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xKey="date"
              yKey="sales"
              colors={['#3b82f6']}
              curve="linear"
              onDataClick={(data, event) => {
                console.log('Legacy LineChart clicked:', data);
              }}
            />
          </div>
          <p><strong>Pattern:</strong> BaseChart + createChartComponent</p>
          <p><strong>Features:</strong> Basic line rendering</p>
        </div>

        <div>
          <h2>Modern LineChartV2</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <LineChartV2
              data={timeSeriesData}
              width={400}
              height={250}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xAccessor="date"
              yAccessor="sales"
              colors={['#3b82f6']}
              curve="monotone"
              strokeWidth={3}
              onDataClick={(data, event) => {
                console.log('Modern LineChartV2 clicked:', data);
              }}
            />
          </div>
          <p><strong>Pattern:</strong> BaseChartCore + createReactChartWrapper</p>
          <p><strong>Features:</strong> Smooth curves, framework-agnostic</p>
        </div>

      </div>

      {/* Enhanced Features Showcase */}
      <div style={{ marginBottom: '40px' }}>
        <h2>✨ Enhanced Features in V2</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          
          <div>
            <h3>Smooth Curves</h3>
            <div style={{ backgroundColor: '#f0f9ff', padding: '10px', borderRadius: '6px' }}>
              <SmoothLineChartV2
                data={multiSeriesData}
                width={300}
                height={200}
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                xAccessor="month"
                yAccessor="desktop"
                colors={['#8b5cf6']}
                strokeWidth={2}
              />
            </div>
            <p><small>Monotone interpolation for smooth curves</small></p>
          </div>

          <div>
            <h3>Points + Lines</h3>
            <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px' }}>
              <LineChartWithPointsV2
                data={multiSeriesData}
                width={300}
                height={200}
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                xAccessor="month"
                yAccessor="mobile"
                colors={['#10b981']}
                strokeWidth={2}
                pointMarker={{
                  enabled: true,
                  radius: 4,
                  fillOpacity: 1,
                  strokeWidth: 2,
                  hoverRadius: 6
                }}
              />
            </div>
            <p><small>Interactive points with hover effects</small></p>
          </div>

          <div>
            <h3>Dashed Lines</h3>
            <div style={{ backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px' }}>
              <DottedLineChartV2
                data={multiSeriesData}
                width={300}
                height={200}
                margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
                xAccessor="month"
                yAccessor="tablet"
                colors={['#ef4444']}
                strokeWidth={2}
              />
            </div>
            <p><small>Customizable stroke patterns</small></p>
          </div>

        </div>
      </div>

      {/* Multi-Series Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        
        <div>
          <h2>Legacy Multi-Series</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <LineChart
              data={[
                ...multiSeriesData.map(d => ({ ...d, series: 'Desktop', value: d.desktop })),
                ...multiSeriesData.map(d => ({ ...d, series: 'Mobile', value: d.mobile }))
              ]}
              width={400}
              height={250}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xKey="month"
              yKey="value"
              categoryKey="series"
              colors={['#3b82f6', '#ef4444']}
            />
          </div>
          <p>Requires data restructuring for multi-series</p>
        </div>

        <div>
          <h2>Modern Multi-Series</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <LineChartV2
              data={[
                ...multiSeriesData.map(d => ({ ...d, series: 'Desktop', value: d.desktop })),
                ...multiSeriesData.map(d => ({ ...d, series: 'Mobile', value: d.mobile })),
                ...multiSeriesData.map(d => ({ ...d, series: 'Tablet', value: d.tablet }))
              ]}
              width={400}
              height={250}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xAccessor="month"
              yAccessor="value"
              categoryAccessor="series"
              colors={['#3b82f6', '#ef4444', '#10b981']}
              curve="monotone"
              strokeWidth={2}
              showPoints={true}
              pointMarker={{
                enabled: true,
                radius: 3,
                fillOpacity: 0.8,
                strokeWidth: 1
              }}
            />
          </div>
          <p>Enhanced multi-series support with better data handling</p>
        </div>

      </div>

      {/* Advanced Features */}
      <div style={{ marginBottom: '40px' }}>
        <h2>🚀 Advanced Capabilities</h2>
        
        <div>
          <h3>Missing Data Handling</h3>
          <div style={{ backgroundColor: '#fffbeb', padding: '15px', borderRadius: '8px', maxWidth: '600px' }}>
            <LineChartV2
              data={gappedData}
              width={500}
              height={200}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xAccessor="x"
              yAccessor="y"
              colors={['#f59e0b']}
              curve="monotone"
              strokeWidth={3}
              showPoints={true}
              connectNulls={false}
              pointMarker={{
                enabled: true,
                radius: 5,
                fillOpacity: 1,
                strokeWidth: 2
              }}
              defined={(d) => d.y !== null}
            />
          </div>
          <p><small>Handles missing data gracefully with line breaks</small></p>
        </div>
      </div>

      {/* Migration Guide */}
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>🔄 Migration Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4>Legacy Usage:</h4>
            <pre style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`<LineChart
  data={data}
  xKey="date"
  yKey="value"
  curve="monotone"
  colors={['#blue']}
  onLineHover={handler}
/>`}
            </pre>
          </div>
          <div>
            <h4>Modern Usage:</h4>
            <pre style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`<LineChartV2
  data={data}
  xAccessor="date"
  yAccessor="value"
  curve="monotone"
  showPoints={true}
  strokeWidth={3}
  colors={['#blue']}
  onDataHover={handler}
/>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Feature Matrix */}
      <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h3>📊 Feature Comparison Matrix</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#bbdefb' }}>
              <th style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'left' }}>Feature</th>
              <th style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Legacy</th>
              <th style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Modern V2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Framework Independence</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>❌</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>✅</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Curve Types</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>4 types</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>5+ types</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Point Markers</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Basic</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Advanced</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Missing Data</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Limited</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Smart handling</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Line Styling</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Basic</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Rich options</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Interactions</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Standard</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Enhanced</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Performance</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Good</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Optimized</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LineChartMigrationDemo;