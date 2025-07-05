## [Unreleased]

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

#### 🛠 Technical Improvements
- Optimize field type detection algorithm in data-detector.ts
- Enhance number type detection with stricter timestamp validation
- Improve useEffect dependency management to prevent unnecessary re-renders
- Add conditional checks to prevent mapping state loops

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
