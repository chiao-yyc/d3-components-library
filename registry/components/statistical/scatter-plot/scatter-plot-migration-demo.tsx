/**
 * ScatterPlot Migration Demo
 * Simple test to verify both old and new implementations work
 */

import React from 'react';
import { ScatterPlot } from './scatter-plot';
import { ScatterPlotV2 } from './scatter-plot-v2';

// Sample data for testing
const sampleData = [
  { x: 10, y: 20, size: 5, category: 'A' },
  { x: 30, y: 40, size: 8, category: 'B' },
  { x: 50, y: 60, size: 12, category: 'A' },
  { x: 70, y: 80, size: 6, category: 'C' },
  { x: 90, y: 100, size: 10, category: 'B' },
];

export const ScatterPlotMigrationDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>ScatterPlot Migration Demo</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Legacy Implementation */}
        <div>
          <h2>Legacy ScatterPlot (BaseChart Pattern)</h2>
          <div style={{ border: '1px solid #ccc', padding: '10px' }}>
            <ScatterPlot
              data={sampleData}
              width={400}
              height={300}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xKey="x"
              yKey="y"
              sizeKey="size"
              colors={['#3b82f6', '#ef4444', '#10b981']}
              onDataClick={(data, event) => {
                console.log('Legacy ScatterPlot clicked:', data);
              }}
            />
          </div>
          <p><strong>Pattern:</strong> BaseChart + createChartComponent</p>
          <p><strong>Status:</strong> ✅ Legacy (still supported)</p>
        </div>

        {/* New Implementation */}
        <div>
          <h2>Modern ScatterPlotV2 (BaseChartCore Pattern)</h2>
          <div style={{ border: '1px solid #ccc', padding: '10px' }}>
            <ScatterPlotV2
              data={sampleData}
              width={400}
              height={300}
              margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
              xAccessor="x"
              yAccessor="y"
              sizeAccessor="size"
              colorAccessor="category"
              colors={['#3b82f6', '#ef4444', '#10b981']}
              onDataClick={(data, event) => {
                console.log('Modern ScatterPlotV2 clicked:', data);
              }}
            />
          </div>
          <p><strong>Pattern:</strong> BaseChartCore + createReactChartWrapper</p>
          <p><strong>Status:</strong> ✨ Modern (recommended)</p>
        </div>

      </div>

      {/* Migration Notes */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔄 Migration Notes</h3>
        <ul>
          <li><strong>API Changes:</strong> <code>xKey</code> → <code>xAccessor</code>, <code>yKey</code> → <code>yAccessor</code></li>
          <li><strong>Architecture:</strong> Framework-agnostic core with React wrapper</li>
          <li><strong>Benefits:</strong> Better performance, easier testing, cross-framework potential</li>
          <li><strong>Compatibility:</strong> Both versions can coexist during migration period</li>
        </ul>
      </div>

      {/* Feature Comparison */}
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h3>⚖️ Feature Comparison</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#bbdefb' }}>
              <th style={{ padding: '8px', border: '1px solid #90caf9' }}>Feature</th>
              <th style={{ padding: '8px', border: '1px solid #90caf9' }}>Legacy</th>
              <th style={{ padding: '8px', border: '1px solid #90caf9' }}>Modern V2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Framework Independence</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>❌ React-coupled</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>✅ Pure JS/TS core</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Data Mapping</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Key-based only</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Key + Accessor functions</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Event Handling</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Mixed naming</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Standardized naming</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Testing</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Complex setup</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Easy unit tests</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Performance</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>React overhead</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Optimized core</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScatterPlotMigrationDemo;