## [Unreleased]

### 2025-07-05 - Add Funnel Chart Component (Phase 2.3)

#### ✨ New Features
- **FunnelChart Component**: Professional funnel chart for conversion analysis and process tracking
  - Multiple shape modes: trapezoid (traditional funnel), rectangle, and curved segments
  - Direction control with coordinate transformation: top, bottom, left, right orientations
  - Advanced proportional modes for data representation:
    - Traditional: width proportional to data, equal heights
    - Height: height proportional to data, naturally decreasing widths
    - Area: true area proportional representation
    - Consistent: uniform shrinkage with configurable parameters
  - Intelligent shrinkage system with three modes:
    - Fixed: consistent pixel reduction between segments
    - Percentage: proportional reduction based on segment width
    - Data-driven: automatic calculation based on conversion rates
  - Smart label positioning with horizontal layout for side orientations
  - Comprehensive animation and interaction support with hover effects
  - Flexible color schemes (custom, blues, greens, oranges, reds, purples)
- **Advanced Demo Page**: Four pre-configured scenarios with real-time controls
  - Sales funnel: lead to customer conversion tracking
  - Website conversion: visitor to purchase flow analysis
  - Recruitment process: application to hire pipeline
  - Marketing campaign: impression to repeat purchase journey
- **Intelligent Label Management**: Dynamic positioning that adapts to funnel orientation
  - Vertical funnels: labels positioned on the right side
  - Horizontal funnels: labels distributed vertically with horizontal text layout
  - Inside, outside, and side positioning options with overflow prevention

#### 🐛 Bug Fixes
- Fix horizontal direction label positioning to prevent text overlap and clipping
- Resolve coordinate transformation issues for left/right orientations
- Prevent label overflow in side positioning mode for horizontal funnels
- Fix animation easing function compatibility with D3.js

#### 🛠 Technical Improvements
- Coordinate transformation system for multi-directional funnel rendering
- TypeScript interfaces for comprehensive funnel configuration options
- Modular shrinkage calculation algorithms with validation constraints
- Enhanced demo interface with conditional controls and usage examples
- Integration with existing component registry and navigation system

### 2025-07-05 - Add Gauge Chart Component (Phase 2.2)

#### ✨ New Features
- **GaugeChart Component**: Professional gauge/meter component for KPI and monitoring dashboards
  - Customizable arc angles (semi-circle, 3/4 circle, full circle support)
  - Multi-zone color configuration with custom ranges and labels
  - Smooth needle animations with configurable easing effects
  - Value display with formatting options and center positioning
  - Interactive tick marks and min/max value labels
  - Hover effects and tooltip support for zone information
- **Comprehensive Demo Page**: Three distinct use cases with real-time configuration
  - System monitoring (CPU, memory, disk usage)
  - Sales performance tracking (quarterly targets vs actual)
  - Temperature monitoring (sensors and hardware)
- **Flexible Data Input**: Support for single values or data arrays with mapping
- **Responsive Design**: Automatic sizing with accessibility features

#### 🐛 Bug Fixes
- Fix gauge chart layout overflow issues in demo containers
- Resolve center positioning calculations for different arc angles
- Improve margin and label spacing for various component sizes

#### 🛠 Technical Improvements
- Enhanced positioning algorithms for optimal space utilization
- TypeScript interfaces for gauge zones and configuration options
- CSS styling with responsive breakpoints and accessibility support
- Integration with existing navigation and demo infrastructure

### 2025-07-05 - Complete Phase 1 & 2 Chart Components

#### ✨ New Features
- **PieChart Component**: Full-featured pie chart with donut mode, animations, and interactive legends
- **AreaChart Component**: Multi-series area chart with stacking modes (none/stack/percent) and gradient fills
- **Heatmap Component**: Matrix data visualization with multiple color schemes and correlation analysis
- **Complete Gallery**: Comprehensive showcase of all 6 chart types with interactive examples
- **Navigation Updates**: Added routes and navigation links for all new chart components

#### 🐛 Bug Fixes
- Fix pie chart color mapping issue affecting all datasets
- Fix area chart demo page blank display caused by instanceof errors and incorrect import paths
- Resolve Y-axis domain issue in area charts causing overlap with X-axis
- Optimize heatmap legend size for better visual balance

#### 🛠 Technical Improvements
- Replace D3.js instanceof checks with duck typing for better compatibility
- Implement proper color scale logic with fallback to index-based colors
- Update component registry to include 6 total chart components
- Add comprehensive TypeScript types for all new components
- Enhance demo environment with real-time configuration controls

### 2025-07-05 - Data Mapper Bug Fixes

#### 🐛 Bug Fixes
- Fix Y-axis field selection issue in data mapper when using sample data
- Resolve infinite re-rendering loop in DataMapper component
- Improve number field detection priority over date field detection
- Fix sales field incorrectly identified as date type instead of number
- Prevent Maximum update depth exceeded error in useEffect dependencies
- Add fallback mapping logic when auto-suggestion fails

#### ✨ Features
- Add tooltip functionality to BarChart component
- Implement interactive hover effects with data display
- Add configurable tooltip formatting options
- Add LineChart component with multiple curve types and area fill support
- Add ScatterPlot component with trend line analysis and bubble chart functionality
- Expand component registry to include 3 chart types (bar, line, scatter)
- Add dedicated demo pages for LineChart and ScatterPlot components
- Update navigation and routing to include new chart types

#### 🛠 Technical Improvements
- Optimize field type detection algorithm in data-detector.ts
- Enhance number type detection with stricter timestamp validation
- Improve useEffect dependency management to prevent unnecessary re-renders
- Add conditional checks to prevent mapping state loops
- Create unified TypeScript interfaces across CLI and Registry components
- Implement comprehensive demo environment with Gallery showcase
- Add interactive control panels for real-time chart configuration
- Optimize package.json scripts across all packages

### 2025-07-04 - Data Adapter System

#### ✨ Features
- Implement intelligent data adapter system with full CLI and UI integration
- Add BaseAdapter, CsvAdapter, TimeSeriesAdapter, NestedAdapter, and PivotAdapter
- Support 15+ date formats and 7+ number formats (currency, percent, scientific)
- Enhance data detection with confidence scoring and smart mapping suggestions
- Add CLI options for `--auto-detect` and `--interactive` import flows
- Create UI components for upload, mapping, and chart preview
- Add `/data-mapper` demo route showcasing full workflow

#### 📦 Components
- `DataUpload.tsx`: drag-drop file input with validation
- `DataMapper.tsx`: interactive field mapper with suggestions
- `MappingPreview.tsx`: chart preview with dynamic statistics
- `DataMapperDemo.tsx`: data mapping workflow demonstration

#### 🛠 Technical Improvements
- Dot notation support for nested fields (e.g., `user.profile.name`)
- Real-time chart rendering based on mapped data
- Auto-generation of React component code from CLI

### 2025-07-04 - Demo Environment

#### ✨ Features
- Set up complete React+Vite demo environment for live component development
- Add interactive demo pages: Home, BarChart Demo, and Component Gallery
- Implement @registry path alias for direct component imports with hot reload
- Add sample data generation and interactive control panels
- Integrate demo scripts into main project workflow

#### 📦 Components
- `Home.tsx`: landing page with feature showcase
- `BarChartDemo.tsx`: interactive chart testing with real-time controls
- `Gallery.tsx`: comprehensive component library display

#### 🛠 Technical Improvements
- Real-time component preview during development
- Hot reload support for Registry component changes
- Demo environment documentation and usage guide

### 2025-07-03 - Initial Project Setup

#### ✨ Features
- Initialize complete D3 Components project structure with CLI tools
- Implement Registry system with JSON Schema validation
- Add BarChart component as foundation template
- Create CLI integration for component installation and management
- Establish development environment and build pipeline

#### 📦 Components
- `BarChart`: interactive D3 bar chart with TypeScript support
- Registry architecture with component metadata and configuration

#### 🛠 Technical Improvements
- JSON Schema validation for Registry data integrity
- Shared utility functions (cn.ts, data-detector.ts)
- CLI registry integration and validation scripts
- Project structure with proper TypeScript configuration
