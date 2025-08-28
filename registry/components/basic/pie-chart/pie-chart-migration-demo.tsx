/**
 * PieChart Migration Demo
 * Comprehensive showcase of old vs new PieChart implementations
 */

import React from 'react';
import { PieChart } from './pie-chart';
import { 
  PieChartV2, 
  DonutChartV2, 
  PieChartWithLegendV2,
  HalfPieChartV2,
  PieChartSortedV2 
} from './pie-chart-v2';

// Sample market share data
const marketShareData = [
  { company: 'Apple', share: 28.4, color: '#007aff' },
  { company: 'Samsung', share: 22.7, color: '#1428a0' },
  { company: 'Google', share: 12.1, color: '#4285f4' },
  { company: 'OnePlus', share: 10.5, color: '#f5010c' },
  { company: 'Huawei', share: 8.8, color: '#ff0000' },
  { company: 'Others', share: 17.5, color: '#6b7280' },
];

// Budget allocation data
const budgetData = [
  { category: 'Marketing', amount: 45000, department: 'Growth' },
  { category: 'R&D', amount: 62000, department: 'Engineering' },
  { category: 'Sales', amount: 38000, department: 'Business' },
  { category: 'Operations', amount: 28000, department: 'Operations' },
  { category: 'HR', amount: 22000, department: 'People' },
  { category: 'Infrastructure', amount: 33000, department: 'Engineering' },
];

// Survey results data
const surveyData = [
  { response: 'Very Satisfied', count: 342 },
  { response: 'Satisfied', count: 187 },
  { response: 'Neutral', count: 95 },
  { response: 'Unsatisfied', count: 28 },
  { response: 'Very Unsatisfied', count: 12 },
];

export const PieChartMigrationDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>PieChart Migration Demo</h1>
      
      {/* Basic Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        
        <div>
          <h2>Legacy PieChart</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <PieChart
              data={marketShareData}
              width={400}
              height={300}
              labelKey="company"
              valueKey="share"
              colors={marketShareData.map(d => d.color)}
              onSegmentClick={(data, event) => {
                console.log('Legacy PieChart clicked:', data);
              }}
            />
          </div>
          <p><strong>Pattern:</strong> BaseChart + createChartComponent</p>
          <p><strong>Features:</strong> Basic pie chart rendering</p>
        </div>

        <div>
          <h2>Modern PieChartV2</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <PieChartV2
              data={marketShareData}
              width={400}
              height={300}
              labelAccessor="company"
              valueAccessor="share"
              colors={marketShareData.map(d => d.color)}
              labels={{
                show: true,
                position: 'outside',
                format: (value, percentage, label) => `${label}\n${percentage.toFixed(1)}%`,
                fontSize: 11
              }}
              onSegmentClick={(data, event) => {
                console.log('Modern PieChartV2 clicked:', data);
              }}
            />
          </div>
          <p><strong>Pattern:</strong> BaseChartCore + createReactChartWrapper</p>
          <p><strong>Features:</strong> Enhanced labels, framework-agnostic</p>
        </div>

      </div>

      {/* Enhanced Features Grid */}
      <div style={{ marginBottom: '40px' }}>
        <h2>✨ Enhanced Features in V2</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          
          <div>
            <h3>Donut Chart</h3>
            <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
              <DonutChartV2
                data={budgetData}
                width={300}
                height={250}
                labelAccessor="category"
                valueAccessor="amount"
                innerRadiusRatio={0.6}
                colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']}
                labels={{
                  show: true,
                  position: 'inside',
                  format: (value) => `$${(value/1000).toFixed(0)}K`,
                  fontSize: 10,
                  color: 'white'
                }}
              />
            </div>
            <p><small>Configurable inner radius with inside labels</small></p>
          </div>

          <div>
            <h3>With Legend</h3>
            <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px' }}>
              <PieChartWithLegendV2
                data={surveyData}
                width={300}
                height={250}
                labelAccessor="response"
                valueAccessor="count"
                colors={['#10b981', '#84cc16', '#fbbf24', '#f97316', '#ef4444']}
                labels={{ show: false }}
                legend={{
                  show: true,
                  position: 'bottom',
                  fontSize: 10
                }}
                sortBy="value"
                sortOrder="desc"
              />
            </div>
            <p><small>Interactive legend with value sorting</small></p>
          </div>

          <div>
            <h3>Half Pie (Gauge)</h3>
            <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '8px' }}>
              <HalfPieChartV2
                data={[
                  { category: 'Completed', value: 75 },
                  { category: 'Remaining', value: 25 }
                ]}
                width={300}
                height={200}
                labelAccessor="category"
                valueAccessor="value"
                colors={['#10b981', '#e5e7eb']}
                labels={{
                  show: true,
                  position: 'inside',
                  format: (value, percentage) => `${percentage.toFixed(0)}%`,
                  fontSize: 14,
                  color: 'white'
                }}
              />
            </div>
            <p><small>Semi-circle for progress indicators</small></p>
          </div>

        </div>
      </div>

      {/* Advanced Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
        
        <div>
          <h2>Advanced Styling</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <PieChartV2
              data={marketShareData}
              width={400}
              height={300}
              labelAccessor="company"
              valueAccessor="share"
              colors={marketShareData.map(d => d.color)}
              cornerRadius={4}
              padAngle={0.02}
              strokeWidth={2}
              strokeColor="white"
              labels={{
                show: true,
                position: 'outside',
                format: (value, percentage, label) => `${label}: ${value}%`,
                fontSize: 12,
                connector: {
                  show: true,
                  color: '#666',
                  strokeWidth: 1
                }
              }}
            />
          </div>
          <p>Rounded corners, padding, and connector lines</p>
        </div>

        <div>
          <h2>Interactive Features</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
            <PieChartSortedV2
              data={budgetData}
              width={400}
              height={300}
              labelAccessor="category"
              valueAccessor="amount"
              colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']}
              labels={{
                show: true,
                position: 'edge',
                format: (value, percentage, label) => {
                  return percentage > 10 ? label : '';
                },
                fontSize: 11
              }}
              onSegmentClick={(data, event) => {
                console.log('Segment clicked:', data.label, data.value);
              }}
              onSegmentHover={(data, event) => {
                if (data) {
                  console.log('Hovering:', data.label);
                }
              }}
            />
          </div>
          <p>Smart labeling, sorting, and rich interactions</p>
        </div>

      </div>

      {/* Data Processing Examples */}
      <div style={{ marginBottom: '40px' }}>
        <h2>🔧 Data Processing Capabilities</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>Function-Based Accessors</h3>
            <div style={{ backgroundColor: '#fffbeb', padding: '15px', borderRadius: '8px' }}>
              <PieChartV2
                data={budgetData}
                width={350}
                height={250}
                labelAccessor={(d) => `${d.category} (${d.department})`}
                valueAccessor={(d) => d.amount / 1000} // Convert to thousands
                colors={['#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#ef4444']}
                labels={{
                  show: true,
                  position: 'outside',
                  format: (value, percentage, label) => `${label.split(' (')[0]}: $${value}K`,
                  fontSize: 10
                }}
              />
            </div>
            <p><small>Dynamic label generation and value transformation</small></p>
          </div>

          <div>
            <h3>Conditional Rendering</h3>
            <div style={{ backgroundColor: '#f0f9ff', padding: '15px', borderRadius: '8px' }}>
              <PieChartV2
                data={surveyData.filter(d => d.count > 50)} // Filter small segments
                width={350}
                height={250}
                labelAccessor="response"
                valueAccessor="count"
                colors={['#10b981', '#84cc16', '#fbbf24']}
                labels={{
                  show: true,
                  position: 'inside',
                  format: (value, percentage) => percentage > 15 ? `${percentage.toFixed(0)}%` : '',
                  fontSize: 12,
                  color: 'white'
                }}
                innerRadius={40}
              />
            </div>
            <p><small>Filtered data with conditional label display</small></p>
          </div>
        </div>
      </div>

      {/* Migration Guide */}
      <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>🔄 Migration Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4>Legacy Usage:</h4>
            <pre style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`<PieChart
  data={data}
  labelKey="name"
  valueKey="value"
  showLabels={true}
  showLegend={false}
  innerRadius={0}
  colors={colorArray}
  onSliceClick={handler}
/>`}
            </pre>
          </div>
          <div>
            <h4>Modern Usage:</h4>
            <pre style={{ backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
{`<PieChartV2
  data={data}
  labelAccessor="name"
  valueAccessor="value"
  labels={{
    show: true,
    position: "outside",
    format: (v, p, l) => \`\${l}: \${p}%\`
  }}
  legend={{ show: false }}
  innerRadius={0}
  colors={colorArray}
  onSegmentClick={handler}
/>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
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
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Label Positioning</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>2 options</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>3+ options</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Custom Label Format</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Limited</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Full control</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Legend System</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Basic</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Advanced</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Shape Customization</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Limited</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Extensive</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Data Sorting</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Manual</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Built-in</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Interaction Events</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Basic</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>Rich + Unified</td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #90caf9' }}>Variant Components</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>1 (Donut)</td>
              <td style={{ padding: '8px', border: '1px solid #90caf9', textAlign: 'center' }}>5+ variants</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Performance Notes */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
        <h4>🚀 Performance & Architecture Benefits</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h5>V2 Improvements:</h5>
            <ul style={{ fontSize: '14px' }}>
              <li>Framework-agnostic core enables Vue/Angular use</li>
              <li>Optimized arc calculations with caching</li>
              <li>Smart label collision detection</li>
              <li>Memory-efficient color management</li>
              <li>Unified event system across all chart types</li>
            </ul>
          </div>
          <div>
            <h5>Enhanced Capabilities:</h5>
            <ul style={{ fontSize: '14px' }}>
              <li>Real-time data updates with smooth transitions</li>
              <li>Accessibility improvements (ARIA labels)</li>
              <li>Responsive design with automatic sizing</li>
              <li>Rich variant ecosystem (5+ specialized components)</li>
              <li>Comprehensive TypeScript support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartMigrationDemo;