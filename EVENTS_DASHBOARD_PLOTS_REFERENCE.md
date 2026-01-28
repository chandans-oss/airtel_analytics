# Events Dashboard - Plot Reference Guide

## Complete Plot Documentation

| Module/Page | Plot Name | Chart Type | Excel Sheet | Columns Used | Logic Description | What It Shows |
|------------|-----------|------------|-------------|--------------|-------------------|---------------|
| **Events Dashboard** | Severity KPI Cards | KPI Cards (4 cards) | All Events | `severity` | Counts events by severity level (CRITICAL, MAJOR, MINOR, WARNING). Calculates percentage of total for progress bar. | Distribution of events across severity levels with interactive filtering capability. Shows count and percentage for each severity. |
| **Events Dashboard** | Severity Distribution | Donut Chart (Pie) | All Events | `severity` | Groups all events by severity field. Creates pie segments with predefined colors (Critical=Red, Major=Orange, Minor=Teal, Warning=Blue). | Visual breakdown of event severity distribution. Inner radius creates donut effect for modern look. |
| **Events Dashboard** | Top Fault Categories | Horizontal Bar Chart | All Events | `category` | Counts events by category field, sorts descending, takes top 8 categories. | Shows which fault categories are most common. Helps identify systemic issues or patterns. |
| **Events Dashboard** | Fault Log Table | Data Table | All Events | `severity`, `deviceName`, `ip`, `faultName`, `category`, `startTime`, `age` | Displays all event records with search and severity filtering. Supports text search across device name, fault name, and IP. | Detailed event listing with filtering capabilities. Shows device context, fault details, and timing information. |
| **Probable Cause Analytics** | Event Status KPIs | KPI Cards (4 cards) | All Events | `status` | Categorizes events by status using flexible keyword matching: OPEN/ACTIVE/NEW → Open; PROGRESS/ACKNOWLEDGED → In Progress; CLEAR/RESOLVED/CLOSED → Resolved; PENDING/VENDOR → Pending Vendor. | Current state of event lifecycle. Shows how many events are in each workflow stage. |
| **Probable Cause Analytics** | Probable Cause Distribution | Horizontal Bar Chart | All Events | `faultName`, `rootCause`, `summary` | Keyword-based classification into 6 categories: Link/Interface (LINK, PORT, DOWN), BGP/Routing (BGP, OSPF, PEER), Hardware (CARD, FAN, POWER), Reachability (PING, TIMEOUT, SNMP), Config/System (CONFIG, ERROR, REBOOT), Other (catch-all). Searches combined text of faultName + rootCause + summary. | Root cause analysis showing most common failure types. Helps identify infrastructure weak points. |
| **Probable Cause Analytics** | Event Trends (24h) | Multi-Line Chart | All Events (Mock Data) | N/A (Currently mock) | Generates 24-hour timeline with random data for Events, Failures, and Reachability metrics. | **Note: Currently uses mock data**. Intended to show temporal patterns of events over 24 hours. |
| **Probable Cause Analytics** | Severity Composition | Stacked Area Chart | All Events (Mock Data) | N/A (Currently mock) | Generates time-series data showing Critical, Major, Minor, Info event counts over 12 time periods (2-hour intervals). Uses gradient fills. | **Note: Currently uses mock data**. Intended to show how severity distribution changes over time. |
| **Probable Cause Analytics** | Causal Flow Analysis | Sankey Diagram | All Events (Mock Data) | N/A (Currently mock) | 3-level flow: Scan Type (SNMP/ICMP) → Severity (Critical/Major/Minor) → Probable Cause (BFD Down/Interface/Latency/Pkt Loss). Color-coded nodes with gradient links showing flow magnitude. | **Note: Currently uses mock data**. Shows correlation between detection method, severity, and root cause. Helps understand which scan types detect which problems. |
| **Probable Cause Analytics** | Multi-Dimensional Correlations | Sankey Diagram | All Events (Mock Data) | N/A (Currently mock) | 3-level flow: Event Type (Link Failure/Device Down) → Region (North/South/East) → Cause (Power Cut/Fiber Cut/Config Error). Custom node rendering with external labels. | **Note: Currently uses mock data**. Geographic correlation of event types and causes. Identifies regional patterns and infrastructure issues. |
| **Probable Cause Analytics** | Business Hours Pattern | Line Chart | All Events (Mock Data) | N/A (Currently mock) | Plots event count and critical event count across 6 time periods (4-hour intervals). | **Note: Currently uses mock data**. Intended to identify peak incident hours for resource planning. |
| **Probable Cause Analytics** | Impacted Domains | Ranked List | All Events | `category` | Groups events by category field, sorts by count descending, takes top 5. | Shows which network domains/categories are experiencing the most issues. |
| **Probable Cause Analytics** | Top Impacted Nodes | Ranked List | All Events | `deviceName` | Groups events by deviceName, sorts by count descending, takes top 10. | Identifies devices with highest fault frequency. Helps prioritize maintenance and replacement. |

## Data Source Details

### Excel Workbook: `Airtel Data.xlsx`
**Sheet Name:** `All Events`

### Key Columns in All Events Sheet:
- `severity`: Event severity level (CRITICAL, MAJOR, MINOR, WARNING)
- `status`: Event lifecycle status (OPEN, ACTIVE, IN PROGRESS, RESOLVED, PENDING VENDOR, etc.)
- `deviceName`: Name/identifier of the affected device
- `ip`: IP address of the affected device
- `faultName`: Description of the fault/event
- `category`: Event category/domain classification
- `rootCause`: Root cause analysis text
- `summary`: Additional event summary/description
- `startTime`: When the event occurred
- `age`: How long the event has been active

## Classification Logic Details

### Probable Cause Keywords:
1. **Link/Interface Failure**: LINK, INTERFACE, PORT, DOWN, FLAP, ETH, GIGABIT
2. **BGP/Routing Issues**: BGP, OSPF, NEIGHBOR, PEER, ROUTE, ADHOC
3. **Hardware/Environment**: CARD, CHASSIS, FAN, POWER, TEMP, VOLTAGE, HARDWARE
4. **Reachability/Ping**: PING, REACHABILITY, TIMEOUT, UNREACHABLE, ICMP, SNMP
5. **Config/System**: CONFIG, MISMATCH, ERROR, SYSTEM, REBOOT, RESTART
6. **Other Anomalies**: Catch-all for unmatched events

### Status Classification:
- **Open**: Contains OPEN, ACTIVE, or NEW
- **In Progress**: Contains PROGRESS, ACKNOWLEDGED, or WORKING
- **Resolved**: Contains CLEAR, RESOLVED, CLOSED, or FIXED
- **Pending Vendor**: Contains PENDING, VENDOR, or WAITING
- **Default**: Unmatched statuses default to Open

## Color Scheme

### Severity Colors:
- **CRITICAL**: `hsl(12, 85%, 55%)` - Red
- **MAJOR**: `hsl(38, 92%, 50%)` - Orange
- **MINOR**: `hsl(174, 72%, 45%)` - Teal
- **WARNING**: `hsl(210, 100%, 55%)` - Blue

### Status Colors:
- **Open**: `hsl(12, 85%, 55%)` - Red
- **In Progress**: `hsl(38, 92%, 50%)` - Orange
- **Resolved**: `hsl(160, 84%, 39%)` - Green
- **Pending Vendor**: `hsl(210, 100%, 55%)` - Blue

### Probable Cause Colors:
- **Link/Interface**: `hsl(320, 70%, 55%)` - Pink
- **BGP/Routing**: `hsl(38, 92%, 50%)` - Orange
- **Hardware**: `hsl(12, 85%, 55%)` - Red
- **Reachability**: `hsl(210, 100%, 55%)` - Blue
- **Config/System**: `hsl(280, 70%, 55%)` - Purple
- **Other**: `hsl(215, 15%, 65%)` - Gray

## Notes

### Mock Data Charts:
The following charts currently use **mock/random data** and should be connected to real event data for production use:
- Event Trends (24h)
- Severity Composition
- Causal Flow Analysis
- Multi-Dimensional Correlations
- Business Hours Pattern

### Real-Time Data Charts:
These charts use actual data from the Excel workbook:
- All KPI Cards
- Severity Distribution
- Top Fault Categories
- Fault Log Table
- Probable Cause Distribution
- Impacted Domains
- Top Impacted Nodes

### Filtering Capabilities:
- **Global Filters**: Applied via the inventory store's filter mechanism
- **Local Filters**: 
  - Severity filter (click KPI cards)
  - Text search (device name, fault name, IP)
  - Status-based filtering (via ProbableCauseAnalytics context)

### Performance Considerations:
- Event table supports up to 1000+ rows with virtual scrolling
- Charts use `useMemo` for performance optimization
- Search is client-side filtered (consider server-side for large datasets)
