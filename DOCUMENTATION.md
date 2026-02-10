# Airtel Analytics Dashboard - System Documentation

## 1. Project Overview
The **Airtel Analytics Dashboard** is a high-performance, NOC-grade (Network Operations Center) visualization platform designed to monitor and analyze complex network infrastructures. It provides real-time insights into enterprise assets, link health, service management, and event lifecycles.

### Key Objectives:
*   **Centralized Monitoring**: A unified "Executive Overview" for holistic network health.
*   **Specialized Analysis**: Deep-dive modules for Jitter, QoS, Bandwidth, and Device Stability.
*   **Operational Intelligence**: Advanced event correlation, heatmap analysis, and hierarchical drill-downs.
*   **NOC Aesthetic**: A premium, high-density UI designed for professional monitoring environments.

---

## 2. Technology Stack
The application is built using a modern React-based stack optimized for performance and maintainability.

| Layer | Technology |
| :--- | :--- |
| **Framework** | React 18 (TypeScript) |
| **Build Tool** | Vite |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS + Custom Design Tokens |
| **Charts** | Recharts, Custom SVG Heatmaps |
| **Icons** | Lucide React |
| **Routing** | React Router DOM v6 |
| **Data Processing** | XLSX (for workbook parsing) |

---

## 3. System Architecture & Design

### A. Architectural Pattern
The app follows a **Modular Single-Page Application (SPA)** architecture. It uses a centralized "Store-First" approach where the global state drives the rendering of all components.

### B. Core Structural Flow
1.  **Entry Point (`App.tsx`)**: Configures global providers (Theme, QueryClient, Tooltip).
2.  **Structural Shell (`MainLayout.tsx`)**: Defines the top header, navigation sidebar, and dynamic content area.
3.  **Navigation (`AppSidebar.tsx`)**: Drives the `selectedModule` state in the store, which determines which dashboard is rendered in the `Index.tsx` page.
4.  **Content Rendering (`Index.tsx`)**: A dynamic router that switches between 10+ analytical modules based on current state.

---

## 4. Key Components & Modules

### Analytical Modules
Each module is a self-contained analytics environment:
*   **Unified Dashboard**: High-level cross-module KPIs and health scores.
*   **Events Dashboard**: Focuses on event distribution, heatmaps (Aging/Closure), and Link Down diagnostics.
*   **Bandwidth Analytics**: Monitors capacity, utilization trends, and SNMP polling health.
*   **QoS Analytics**: Visualizes policy compliance, packet discards, and traffic class health.
*   **Jitter & Stability**: Tracks SLA violations, latency variations, and stability inhibitors.
*   **Device Status**: Analyzes hardware health, OS distributions, and regional asset reachability.

### Structural Components
*   **Header**: Contains global metrics toggles (Network/App) and the Theme Switcher.
*   **ToolSidebar**: Provides contextual filters (Severity, Timeframe, Customer) for the active module.
*   **InventoryDashboard**: A powerful hierarchical drill-down tool using recursive tree logic.

---

## 5. State Management (`inventoryStore.ts`)

The application uses **Zustand** for high-performance state management.

### Store Responsibilities:
*   **Data Storage**: Holds raw arrays for `nodes`, `links`, `allEvents`, etc.
*   **Active Filtering**: Manages `nodeFilters` and `linkFilters` used by all widgets.
*   **Computed State**: Provides `getFilteredNodes()` and `getFilteredLinks()` logic that automatically updates as users interact with the UI.
*   **System Controls**: Manages Sidebar collapse states, `isProcessing` overlays, and Theme preferences.

---

## 6. Technical Implementation Details

### Reactive Cross-Filtering
When a user clicks a segment in a chart (e.g., a "North" slice in a Pie chart), the system:
1.  Calls `toggleFilter('region', 'North')`.
2.  The Store updates the `activeFilters`.
3.  All other components (Charts, Tables, KPIs) re-calculate their data based on the updated filtered set.

### Automated Documentation & Export
*   **CSV Engine**: A utility (`exportToCSV`) that serializes current filtered views into professional reports.
*   **Data Initialization**: The `useDataInitialization` hook fetches and parses a master Excel workbook (`Network Data.xlsx`) to hydrate the app on first load.

### Theme & Design System
*   **Design Tokens**: Managed via CSS variables in `index.css`.
*   **Modes**: Full support for "Light" and "NOC-Dark" modes.
*   **Responsive Grids**: Dashboards use a flexible `grid-cols` system to adapt from 1080p to 4K displays.

---

## 7. Operational Workflow
1.  **Init**: App loads -> Parses Master Data -> Hydrates Zustand Store.
2.  **Navigate**: User selects a module in Sidebar -> UI reactive switch.
3.  **Analyze**: User applies filters via Sidebar or Chart interactions.
4.  **Act**: User identifies issues via Heatmaps -> Filters down to ID level -> Exports CSV for NOC tasking.

---
*Generated by Antigravity AI - Airtel analytics Project Intelligence*
