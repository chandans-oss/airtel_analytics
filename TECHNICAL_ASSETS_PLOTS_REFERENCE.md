# Technical Assets Module - Plot Reference Guide

**Module**: Technical Assets  
**Source**: Airtel Analytics Dashboard  
**Last Updated**: 2026-01-28

---

## 📊 Complete Plot Reference Table

| # | Plot Name | Chart Type | Excel Sheet | Columns Used | Logic Description | What It Shows |
|---|-----------|------------|-------------|--------------|-------------------|---------------|
| 1 | **Vendor Usage** | Bar Chart | Nodes | `make` | Groups nodes by make (manufacturer). Sorts by count (descending). Empty values labeled as "Other". | Distribution of network equipment by manufacturer/vendor |
| 2 | **Device Types** | Donut Chart | Nodes | `deviceType` | Groups nodes by deviceType. Sorts by count (descending). Empty values labeled as "Other". | Breakdown of device categories (routers, switches, firewalls, etc.) |
| 3 | **Domain Distribution** | Treemap | Links | `serviceType`, `ecrmProduct` | Reads serviceType (or ecrmProduct fallback). Groups by domain/service. Sorts by count (descending). Takes top 5 domains. Empty values labeled as "Connectivity". Assigns colors to each domain. | Top 5 network domains/segments with visual size representation |
| 4 | **Hierarchical Drilldown** | Table | Links | `location`, `customerName`, `linkId`, `lsi`, `siteName`, `linkStatus` | Takes first 50 links. Extracts location, customer, link ID, site name, and status. Empty values shown as "N/A". | Detailed link-level information for troubleshooting and analysis |

---

## 📋 Detailed Plot Specifications

### 1. Vendor Usage

**Purpose**: Show distribution of network equipment by manufacturer  
**Business Value**: Vendor diversity analysis, procurement planning, support contract management

**Data Source**: **Nodes** sheet (not Links!)

**Data Flow**:
```
For each node (device):
  1. Read make column (manufacturer/vendor)
  2. If empty/null → "Other"
  3. Group by vendor name
  4. Count devices per vendor
  5. Sort by count (highest first)
  6. Show all vendors
```

**Output**: Bar chart with one bar per vendor (sorted by device count)

**Common Vendor Values**:
- **Cisco** → Enterprise routers, switches
- **Juniper** → High-end routers, switches
- **Huawei** → Cost-effective equipment
- **Nokia** → Telecom-grade equipment
- **Arista** → Data center switches
- **HPE/HP** → Enterprise switches
- **Dell** → Servers, switches
- **Fortinet** → Firewalls, security appliances

**Business Insights**:

**1. Vendor Diversity**:
- **Healthy**: 3-5 major vendors (balanced portfolio)
- **Risk**: Single vendor >70% (vendor lock-in)
- **Opportunity**: Too many vendors (consolidation opportunity)

**2. Procurement Strategy**:
- **Volume discounts**: High device count with one vendor = better pricing
- **Negotiation leverage**: Multi-vendor = competitive bidding
- **Standardization**: Fewer vendors = simpler operations

**3. Support & Maintenance**:
- **Support contracts**: One contract per vendor
- **Spare parts**: Stock parts for top 3 vendors
- **Training**: Train engineers on top 2-3 vendor platforms

**4. Technology Refresh**:
- **Legacy vendors**: Old vendors (e.g., Nortel, 3Com) indicate aging equipment
- **Modern vendors**: Arista, Palo Alto indicate recent upgrades
- **Migration planning**: Plan to replace legacy vendor equipment

**Example Values**:
- Cisco → 450 devices (60%)
- Juniper → 180 devices (24%)
- Huawei → 90 devices (12%)
- Other → 30 devices (4%)

**Strategic Use**:

**Procurement Planning**:
- **Annual contracts**: Negotiate based on device count
- **Volume commitments**: "If we buy 100+ devices, give us 20% discount"
- **Multi-year deals**: Lock in pricing for 3-5 years

**Risk Management**:
- **Vendor concentration**: >70% one vendor = high risk
- **Diversification**: Add secondary vendor for critical roles
- **Exit strategy**: Maintain ability to switch vendors

**Operational Efficiency**:
- **Standardization**: Fewer vendors = simpler operations
- **Training**: Focus training on top 2 vendors
- **Spares**: Stock parts for top 3 vendors only

**Red Flags**:
- **Single vendor >80%**: Vendor lock-in, no negotiation leverage
- **>10 vendors**: Too fragmented, high operational complexity
- **Unknown vendor names**: Possible data quality issue or gray market equipment
- **Legacy vendors** (Nortel, 3Com, Alcatel-Lucent): End-of-life equipment

---

### 2. Device Types

**Purpose**: Show breakdown of device categories in the network  
**Business Value**: Understand network architecture, capacity planning, role-based analysis

**Data Source**: **Nodes** sheet

**Data Flow**:
```
For each node (device):
  1. Read deviceType column
  2. If empty/null → "Other"
  3. Group by device type
  4. Count devices per type
  5. Sort by count (highest first)
  6. Create donut chart
```

**Output**: Donut chart with one slice per device type

**Common Device Types**:
- **Router** → Layer 3 routing devices
- **Switch** → Layer 2/3 switching devices
- **Firewall** → Security appliances
- **Load Balancer** → Traffic distribution
- **WAN Optimizer** → WAN acceleration
- **Access Point** → Wireless APs
- **Gateway** → Edge devices
- **Server** → Compute resources
- **Storage** → Storage arrays
- **Other** → Miscellaneous devices

**Business Insights**:

**1. Network Architecture**:
- **Router-heavy**: Traditional WAN architecture
- **Switch-heavy**: Data center or campus network
- **Firewall-heavy**: Security-focused architecture
- **Balanced**: Modern converged network

**2. Capacity Planning**:
- **Growth areas**: Which device types are growing?
- **Saturation**: Which types are at capacity?
- **Refresh cycles**: Plan upgrades by device type

**3. Role-Based Analysis**:
- **Core**: Routers (backbone)
- **Distribution**: Switches (aggregation)
- **Access**: Switches, APs (edge)
- **Security**: Firewalls (perimeter)

**4. Technology Evolution**:
- **Legacy**: Separate routers + switches
- **Modern**: Converged devices (router + firewall + SD-WAN)
- **Future**: Virtual network functions (NFV)

**Example Distribution**:
- Router → 35% (backbone routing)
- Switch → 40% (LAN switching)
- Firewall → 15% (security)
- Other → 10% (misc devices)

**Strategic Use**:

**Capacity Planning**:
- **Router capacity**: Do we have enough routing capacity?
- **Switch ports**: Are we running out of switch ports?
- **Firewall throughput**: Can firewalls handle traffic growth?

**Budget Allocation**:
- **By device type**: Allocate budget based on device count
- **Refresh priority**: Replace oldest devices in each category
- **Growth investment**: Add capacity to saturated device types

**Operational Efficiency**:
- **Specialization**: Assign engineers to specific device types
- **Training**: Focus on most common device types
- **Automation**: Automate configuration for high-volume types

**Red Flags**:
- **One type >70%**: Unbalanced architecture
- **No firewalls**: Security risk
- **Too many "Other"**: Data quality issue or non-standard devices
- **Legacy types** (Frame Relay, ATM): Outdated technology

---

### 3. Domain Distribution

**Purpose**: Show top network domains/segments with visual size representation  
**Business Value**: Understand service portfolio, segment analysis, resource allocation

**Data Source**: **Links** sheet

**Data Flow**:
```
For each link:
  1. Read serviceType column
  2. If empty, read ecrmProduct column (fallback)
  3. If both empty → "Connectivity"
  4. Group by domain/service
  5. Count links per domain
  6. Sort by count (highest first)
  7. Take top 5 domains
  8. Assign colors:
     - Domain 1: Blue (#3b82f6)
     - Domain 2: Green (#10b981)
     - Domain 3: Purple (#8b5cf6)
     - Domain 4: Orange (#f59e0b)
     - Domain 5: Red (#f43f5e)
  9. Create treemap (size = link count)
```

**Output**: Treemap with up to 5 colored rectangles (size proportional to link count)

**Common Domain Values**:
- **MPLS** → Enterprise WAN domain
- **Internet** → Internet connectivity domain
- **Data Center** → DC interconnect domain
- **Cloud Connect** → Cloud connectivity domain
- **Voice** → VoIP/telephony domain
- **Video** → Video conferencing domain
- **IoT** → IoT connectivity domain
- **Connectivity** → Generic/unclassified

**Treemap Visualization**:
- **Large rectangles**: Dominant domains (high link count)
- **Small rectangles**: Niche domains (low link count)
- **Color coding**: Easy visual identification

**Business Insights**:

**1. Service Portfolio**:
- **Dominant domain**: Which service is most deployed?
- **Emerging domains**: New services gaining traction
- **Declining domains**: Legacy services being phased out

**2. Revenue Analysis**:
- **High-value domains**: MPLS, Cloud Connect (premium pricing)
- **Volume domains**: Internet, Connectivity (commodity pricing)
- **Strategic domains**: IoT, Video (future growth)

**3. Resource Allocation**:
- **Engineering focus**: Allocate engineers to large domains
- **Support structure**: Dedicated teams for top 3 domains
- **Training**: Prioritize training on dominant domains

**4. Market Positioning**:
- **Enterprise focus**: MPLS, Data Center domains
- **SMB focus**: Internet, Connectivity domains
- **Innovation**: Cloud Connect, IoT domains

**Example Treemap**:
```
┌─────────────────────────────┬──────────────┐
│                             │              │
│   MPLS (Blue)               │  Internet    │
│   450 links (45%)           │  (Green)     │
│                             │  280 links   │
│                             │  (28%)       │
├─────────────┬───────────────┼──────────────┤
│             │               │              │
│ Data Center │ Cloud Connect │ Connectivity │
│ (Purple)    │ (Orange)      │ (Red)        │
│ 150 links   │ 80 links      │ 40 links     │
│ (15%)       │ (8%)          │ (4%)         │
└─────────────┴───────────────┴──────────────┘
```

**Strategic Use**:

**Portfolio Management**:
- **Diversification**: Avoid over-reliance on one domain
- **Growth areas**: Invest in emerging domains
- **Sunset planning**: Phase out declining domains

**Sales Strategy**:
- **Cross-sell**: Customers in Domain A might need Domain B
- **Upsell**: Move customers from basic to premium domains
- **Bundling**: Package multiple domains together

**Operational Planning**:
- **Team structure**: Create domain-specific teams
- **Expertise**: Hire specialists for large domains
- **Automation**: Automate provisioning for high-volume domains

**Red Flags**:
- **One domain >70%**: Over-concentration risk
- **"Connectivity" dominates**: Poor service classification
- **No modern domains** (Cloud, IoT): Missing market opportunities

---

### 4. Hierarchical Drilldown

**Purpose**: Provide detailed link-level information for troubleshooting  
**Business Value**: Quick access to link details, RCA support, operational reference

**Data Source**: **Links** sheet

**Data Flow**:
```
For each link:
  1. Take first 50 links (performance optimization)
  2. Extract:
     - Location: location column (or "N/A")
     - Customer: customerName column (or "N/A")
     - LinkID: linkId column, fallback to lsi (or "N/A")
     - Site: siteName column (or "N/A")
     - Status: linkStatus column
  3. Create table row
```

**Output**: Table with 50 rows and 5 columns

**Table Columns**:

1. **Location**: Geographic location (city, address)
2. **Customer**: Customer/company name
3. **LinkID**: Unique circuit identifier
4. **Site**: Site/building name
5. **Status**: Current operational status (UP/DOWN)

**Business Insights**:

**1. Quick Reference**:
- **Link lookup**: Find link details quickly
- **Customer context**: See which customer owns the link
- **Location context**: Understand geographic distribution

**2. Troubleshooting**:
- **Outage correlation**: Multiple links down at same location?
- **Customer impact**: Which customers are affected?
- **Site-level issues**: All links at one site down?

**3. Operational Awareness**:
- **Status overview**: Quick view of link health
- **Customer diversity**: How many customers in top 50 links?
- **Geographic spread**: How many locations in top 50 links?

**Example Table**:
| Location | Customer | LinkID | Site | Status |
|----------|----------|--------|------|--------|
| Mumbai | Reliance Industries | LSI-12345 | Reliance Tower | UP |
| Delhi NCR | TCS | CKT-67890 | TCS Campus | UP |
| Bangalore | HDFC Bank | LSI-11111 | HDFC HQ | DOWN |
| Chennai | Infosys | CKT-22222 | Infosys DC | UP |

**Operational Use**:

**Daily Operations**:
- **Morning review**: Scan for DOWN status
- **Customer calls**: Quick lookup of customer links
- **Outage correlation**: Identify patterns

**Troubleshooting**:
- **Root cause analysis**: Group by location/site to find common issues
- **Impact assessment**: Count affected customers
- **Escalation**: Identify critical customer outages

**Reporting**:
- **Executive summary**: Top 50 links represent major customers
- **Status dashboard**: Quick health check
- **Trend analysis**: Export for historical tracking

**Limitations**:
- **Only 50 links**: Not comprehensive (use filters for specific searches)
- **No sorting**: Fixed order (first 50 in database)
- **No filtering**: Shows all statuses (UP and DOWN mixed)

**Enhancement Opportunities**:
- **Filter by status**: Show only DOWN links
- **Sort by customer**: Group by customer name
- **Expand to 100**: Show more links
- **Add columns**: Include bandwidth, SLA, region

---

## 🎯 Quick Reference: Column Mapping

### Nodes Sheet Columns Used

| Column Name | Used By Plots | Data Type | Example Values | Description |
|-------------|---------------|-----------|----------------|-------------|
| `make` | 1 | String | "Cisco", "Juniper", "Huawei", "Nokia" | Equipment manufacturer/vendor |
| `deviceType` | 2 | String | "Router", "Switch", "Firewall", "Load Balancer" | Device category/role |

### Links Sheet Columns Used

| Column Name | Used By Plots | Data Type | Example Values | Description |
|-------------|---------------|-----------|----------------|-------------|
| `serviceType` | 3 | String | "MPLS", "Internet", "Data Center", "Cloud Connect" | Primary service/domain type |
| `ecrmProduct` | 3 | String | "MPLS VPN", "ILL", "Broadband" | Fallback service type (from CRM) |
| `location` | 4 | String | "Mumbai", "Delhi NCR", "Bangalore" | Geographic location |
| `customerName` | 4 | String | "Reliance Industries", "TCS", "HDFC Bank" | Customer/company name |
| `linkId` | 4 | String | "LSI-12345", "CKT-001" | Primary circuit identifier |
| `lsi` | 4 | String | "LSI-12345" | Fallback circuit identifier |
| `siteName` | 4 | String | "Reliance Tower", "TCS Campus" | Site/building name |
| `linkStatus` | 4 | String | "UP", "DOWN" | Current operational status |

---

## 📊 Chart Type Summary

| Chart Type | Plots Using It | Characteristics |
|------------|----------------|-----------------|
| **Bar Chart** | Vendor Usage | Shows counts as bars, sorted by value |
| **Donut Chart** | Device Types | Shows percentage distribution with center hole |
| **Treemap** | Domain Distribution | Shows hierarchical data as nested rectangles, size = value |
| **Table** | Hierarchical Drilldown | Lists detailed data with multiple columns, limited to 50 rows |

---

## 🔄 Data Processing Flow

```
Excel Files (Nodes + Links Sheets)
    ↓
Dashboard Upload
    ↓
Zustand Store (allNodes + allLinks)
    ↓
Filter Application (getFilteredNodes + getFilteredLinks)
    ↓
useMemo Computations (per plot)
    ↓
Data Source Split:
    - Plots 1, 2: Use Nodes data
    - Plots 3, 4: Use Links data
    ↓
Grouping & Sorting
    ↓
Top N Filtering (Plot 3: top 5, Plot 4: first 50)
    ↓
Chart/Table Rendering
```

---

## ⚠️ Important Notes

### Data Source Distinction
- **Plots 1, 2**: Use **Nodes** sheet (devices/equipment)
- **Plots 3, 4**: Use **Links** sheet (circuits/connections)
- **Critical**: Ensure both sheets are uploaded for full module functionality

### Top N Filtering
- **Domain Distribution**: Top 5 domains only (most significant)
- **Hierarchical Drilldown**: First 50 links only (performance optimization)

### Fallback Columns
- **Domain Distribution**: `serviceType` → `ecrmProduct` (if first is empty)
- **Hierarchical Drilldown**: `linkId` → `lsi` (if first is empty)

### Default Values
- **make**: Empty → "Other"
- **deviceType**: Empty → "Other"
- **serviceType/ecrmProduct**: Both empty → "Connectivity"
- **location, customerName, linkId, siteName**: Empty → "N/A"

### Color Coding
- **Domain Distribution**: Fixed color palette for top 5 domains
  - Blue, Green, Purple, Orange, Red (in that order)

---

## 📈 Healthy Targets

| Plot | Healthy Range | Red Flag |
|------|---------------|----------|
| Vendor Usage | 3-5 major vendors, no single vendor >60% | One vendor >80% (lock-in) OR >10 vendors (fragmentation) |
| Device Types | Balanced mix (Router 30-40%, Switch 30-40%, Firewall 10-20%) | One type >70% OR no firewalls |
| Domain Distribution | Top domain <50%, diverse portfolio | One domain >70% (over-concentration) |
| Hierarchical Drilldown | <10% DOWN status in top 50 | >30% DOWN status (major outage) |

---

## 🛠️ Troubleshooting Guide

### If a plot shows unexpected data:

1. **Check Data Source**
   - **Plots 1, 2**: Verify **Nodes** sheet is uploaded
   - **Plots 3, 4**: Verify **Links** sheet is uploaded
   - Both sheets required for full module

2. **Check Column Names**
   - **Nodes sheet**: `make`, `deviceType`
   - **Links sheet**: `serviceType`, `ecrmProduct`, `location`, `customerName`, `linkId`, `lsi`, `siteName`, `linkStatus`

3. **Check Data Values**
   - **make**: Should be vendor names (Cisco, Juniper, etc.)
   - **deviceType**: Should be device categories (Router, Switch, etc.)
   - **serviceType**: Should be service names (MPLS, Internet, etc.)
   - **linkStatus**: Must be "UP" or "DOWN"

4. **Check for Empty Values**
   - Empty values show as "Other", "Connectivity", or "N/A"
   - High "Other"/"N/A" % indicates data quality issue

5. **Validate Vendor Names**
   - Check for typos: "Cisko" vs "Cisco"
   - Check for variations: "HP" vs "HPE" vs "Hewlett Packard"
   - Standardize naming in source data

---

## 💼 Business Use Cases

### Use Case 1: Vendor Consolidation
**Plots Used**: Vendor Usage, Device Types

**Scenario**: Company has 12 different vendors, high operational complexity.

**Current State**:
- Vendor Usage: Cisco (30%), Juniper (15%), Huawei (10%), 9 other vendors (45%)
- 12 separate support contracts
- High training costs (engineers need to know 12 platforms)
- Complex spare parts inventory

**Analysis**:
- **Top 3 vendors**: 55% of devices
- **Bottom 9 vendors**: 45% of devices (fragmentation)
- **Opportunity**: Consolidate to top 3 vendors

**Consolidation Strategy**:
1. **Phase 1** (Year 1): Replace bottom 5 vendors (20% of devices)
   - Migrate to Cisco/Juniper/Huawei
   - Target: 75% on top 3 vendors

2. **Phase 2** (Year 2): Replace next 4 vendors (25% of devices)
   - Target: 90% on top 3 vendors

3. **Phase 3** (Year 3): Final consolidation
   - Target: 95% on top 3 vendors

**Benefits**:
- **Cost savings**: 12 contracts → 3 contracts (60% reduction in support costs)
- **Operational efficiency**: Simpler operations, easier training
- **Negotiation leverage**: Higher volume with fewer vendors = better pricing

---

### Use Case 2: Technology Refresh Planning
**Plots Used**: Vendor Usage, Device Types, Domain Distribution

**Scenario**: Planning 5-year technology refresh cycle.

**Current State**:
- Vendor Usage: Cisco (60%), Legacy vendors (Nortel, 3Com) (15%)
- Device Types: Router (40%), Switch (35%), Firewall (10%)
- Domain Distribution: MPLS (50%), Internet (30%), Legacy (20%)

**Analysis**:
- **Legacy equipment**: 15% of devices are end-of-life
- **Aging architecture**: Router-heavy (traditional WAN)
- **Modern needs**: Need SD-WAN, Cloud Connect

**Refresh Strategy**:

**Year 1-2** (Legacy Replacement):
- Replace Nortel/3Com devices (15%)
- Migrate to Cisco/Juniper
- Budget: $2M

**Year 3-4** (Architecture Modernization):
- Replace 50% of routers with SD-WAN appliances
- Add Cloud Connect domain
- Budget: $5M

**Year 5** (Optimization):
- Consolidate remaining legacy
- Optimize device types
- Budget: $2M

**Outcome**:
- **Vendor Usage**: Cisco (50%), Juniper (30%), Arista (20%)
- **Device Types**: SD-WAN (30%), Switch (35%), Firewall (20%)
- **Domain Distribution**: MPLS (30%), Cloud Connect (25%), Internet (25%), SD-WAN (20%)

---

### Use Case 3: Multi-Vendor Outage Correlation
**Plots Used**: Vendor Usage, Hierarchical Drilldown

**Scenario**: Multiple links down, need to identify if vendor-specific issue.

**Hierarchical Drilldown** shows:
| Location | Customer | LinkID | Site | Status |
|----------|----------|--------|------|--------|
| Mumbai | Customer A | LSI-001 | Site 1 | DOWN |
| Mumbai | Customer B | LSI-002 | Site 2 | DOWN |
| Mumbai | Customer C | LSI-003 | Site 3 | DOWN |
| Delhi | Customer D | LSI-004 | Site 4 | UP |

**Analysis**:
1. **Geographic correlation**: All DOWN links in Mumbai
2. **Cross-reference with Vendor Usage**: Check if all Mumbai devices are same vendor
3. **Hypothesis**: Vendor-specific issue in Mumbai region

**Investigation**:
- Check if all Mumbai devices are Cisco (for example)
- Check if Cisco had a software bug or outage
- Check if other vendors in Mumbai are unaffected

**Resolution**:
- If vendor-specific: Escalate to vendor support
- If location-specific: Escalate to field team
- If both: Coordinate vendor + field response

---

### Use Case 4: Domain-Based Resource Allocation
**Plots Used**: Domain Distribution, Device Types

**Scenario**: Allocating engineering resources based on service portfolio.

**Current State**:
- Domain Distribution: MPLS (45%), Internet (28%), Data Center (15%), Cloud (8%), Other (4%)
- Team: 20 engineers (all generalists)

**Analysis**:
- **MPLS dominance**: 45% of links, needs dedicated team
- **Emerging Cloud**: 8% but growing rapidly
- **Generalist model**: Inefficient, no deep expertise

**Resource Allocation Strategy**:

**Reorganize into Domain Teams**:
1. **MPLS Team** (9 engineers, 45% of resources)
   - Focus: MPLS troubleshooting, optimization
   - Training: Advanced MPLS, QoS, VPN

2. **Internet Team** (6 engineers, 30% of resources)
   - Focus: Internet connectivity, BGP
   - Training: BGP, DDoS mitigation

3. **Data Center Team** (3 engineers, 15% of resources)
   - Focus: DC interconnect, high-speed links
   - Training: Data center networking, VXLAN

4. **Cloud/Innovation Team** (2 engineers, 10% of resources)
   - Focus: Cloud Connect, new technologies
   - Training: Cloud networking, SD-WAN, automation

**Benefits**:
- **Deep expertise**: Engineers specialize in specific domains
- **Better support**: Domain experts provide better troubleshooting
- **Career growth**: Clear specialization paths for engineers
- **Scalability**: Easy to add resources to growing domains

---

## 🔧 Advanced Analysis Techniques

### Vendor-Device Type Matrix
**Combine**: Vendor Usage + Device Types

**Question**: Which vendors provide which device types?

**Analysis**:
- Cisco: Routers (200), Switches (150), Firewalls (50)
- Juniper: Routers (100), Switches (50), Firewalls (20)
- Fortinet: Firewalls (80)

**Insights**:
- **Multi-vendor strategy**: Cisco for routers, Fortinet for firewalls
- **Single-vendor strategy**: Cisco for all device types
- **Best-of-breed**: Different vendors for different roles

---

### Domain-Location Correlation
**Combine**: Domain Distribution + Hierarchical Drilldown

**Question**: Which domains are deployed in which locations?

**Analysis**:
- Mumbai: MPLS (dominant), Data Center
- Delhi: Internet (dominant), MPLS
- Bangalore: Cloud Connect (dominant), MPLS

**Insights**:
- **Regional preferences**: Different regions use different services
- **Market maturity**: Cloud adoption higher in Bangalore (tech hub)
- **Infrastructure**: Data Center domain concentrated in Mumbai

---

**End of Reference Guide**
