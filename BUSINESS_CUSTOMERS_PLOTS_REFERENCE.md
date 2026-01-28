# Business & Customers Module - Plot Reference Guide

**Module**: Business & Customers  
**Source**: Airtel Analytics Dashboard  
**Last Updated**: 2026-01-28

---

## 📊 Complete Plot Reference Table

| # | Plot Name | Chart Type | Excel Sheet | Columns Used | Logic Description | What It Shows |
|---|-----------|------------|-------------|--------------|-------------------|---------------|
| 1 | **Customer Distribution** | Bar Chart | Links | `customerName` | Groups links by customerName. Sorts by count (descending). Takes top 10 customers. Empty values labeled as "Other". | Top 10 customers ranked by number of links (circuits) they have |
| 2 | **Service Flavors** | Pie Chart | Links | `serviceFlavor` | Groups links by serviceFlavor. Counts each unique flavor. Empty values labeled as "Other". | Distribution of service types (e.g., MPLS, ILL, Broadband, P2P) |
| 3 | **Premium Breakdown** | Donut Chart | Links | `PREMIUM`, `SLA`, `serviceFlavor`, `bandwidth` | Link is Premium if: PREMIUM="Yes" OR SLA="Premium" OR serviceFlavor contains "managed" OR bandwidth > 10000. Else Standard. | Split between premium (high-value) and standard (regular) services |
| 4 | **Product Mix** | Bar Chart | Links | `SERVICE_TYPE`, `ecrmProduct` | Reads SERVICE_TYPE (or ecrmProduct fallback). Groups by product type. Sorts by count (descending). Takes top 8 products. Empty values labeled as "Other". | Top 8 product types deployed in the network |
| 5 | **SAM Allocation** | Bar Chart | Links | `SAM_NAME` | Groups links by SAM_NAME (Service Account Manager). Sorts by count (descending). Takes top 10 SAMs. Empty values labeled as "Unassigned". | Top 10 account managers ranked by number of links they manage |
| 6 | **VIP Regions** | Bar Chart | Links | `region`, `PREMIUM`, `SLA`, `serviceFlavor`, `bandwidth` | Filters only premium links (using premium logic). Groups by region. Sorts by count (descending). Empty regions labeled as "Unknown". | Regions with the highest concentration of premium customers |
| 7 | **Service/Customer Matrix** | Table | Links | `serviceFlavor` | Groups links by serviceFlavor. Calculates count and market share percentage for each flavor. | Service penetration analysis showing count and percentage of each service type |
| 8 | **High-Risk Premium Clients** | Table | Links | `customerName`, `region`, `linkId`, `raNumber`, `linkStatus`, `PREMIUM`, `SLA`, `serviceFlavor`, `bandwidth` | Filters links where: isPremium=true AND linkStatus="DOWN". Takes first 20 matches. | List of premium customers currently experiencing outages (critical SLA risk) |

---

## 📋 Detailed Plot Specifications

### 1. Customer Distribution

**Purpose**: Identify top customers by link count  
**Business Value**: Focus on high-value customers, prioritize support resources

**Data Flow**:
```
For each link:
  1. Read customerName column
  2. If empty/null → "Other"
  3. Group by customer name
  4. Count links per customer
  5. Sort by count (highest first)
  6. Take top 10 customers
```

**Output**: Bar chart with up to 10 bars (one per customer)

**Business Insights**:
- **Largest customers** by infrastructure footprint
- **Revenue concentration** (more links = more revenue)
- **Support prioritization** (top customers need premium support)
- **Account management** workload distribution

**Example Values**:
- "Reliance Industries" → 45 links
- "Tata Consultancy Services" → 38 links
- "HDFC Bank" → 32 links

---

### 2. Service Flavors

**Purpose**: Show distribution of service types  
**Business Value**: Understand product portfolio mix

**Data Flow**:
```
For each link:
  1. Read serviceFlavor column
  2. If empty/null → "Other"
  3. Group by service flavor
  4. Count links per flavor
  5. Create pie chart slices
```

**Output**: Pie chart with one slice per service flavor

**Common Service Flavors**:
- **MPLS** (Multiprotocol Label Switching) → Enterprise WAN
- **ILL** (International Leased Line) → Point-to-point connectivity
- **Broadband** → Internet access
- **P2P** (Point-to-Point) → Dedicated connections
- **IPLC** (International Private Leased Circuit) → Global connectivity
- **Managed Services** → Fully managed solutions

**Business Insights**:
- **Product portfolio balance**
- **Revenue streams** (different flavors = different pricing)
- **Technology mix** (legacy vs. modern services)
- **Market positioning** (enterprise vs. SMB)

---

### 3. Premium Breakdown

**Purpose**: Classify services as premium or standard  
**Business Value**: Identify high-value revenue segments and SLA obligations

**Data Flow**:
```
For each link:
  1. Check if Premium:
     a. PREMIUM = "Yes" → Premium
     b. OR SLA = "Premium" → Premium
     c. OR serviceFlavor contains "managed" (case-insensitive) → Premium
     d. OR bandwidth > 10000 (10 Mbps+) → Premium
     e. Else → Standard
  
  2. Count Premium vs Standard
  3. Create donut chart
```

**Output**: Donut chart with 2 slices:
- Premium (Purple)
- Standard (Gray)

**Premium Criteria Explained**:
1. **Explicit Premium Flag**: `PREMIUM = "Yes"` (manually marked)
2. **SLA-Based**: `SLA = "Premium"` (contractual premium SLA)
3. **Service-Based**: Managed services (higher touch, more expensive)
4. **Bandwidth-Based**: >10 Mbps (high-capacity = high-value)

**Business Insights**:
- **Revenue quality**: Premium services = higher ARPU (Average Revenue Per User)
- **SLA risk**: Premium customers have stricter SLAs
- **Support costs**: Premium requires 24/7 support, faster response
- **Churn risk**: Premium customers are harder to replace

**Healthy Target**: 20-40% Premium (balanced portfolio)

---

### 4. Product Mix

**Purpose**: Show top product types deployed  
**Business Value**: Understand product demand and inventory composition

**Data Flow**:
```
For each link:
  1. Read SERVICE_TYPE column
  2. If empty, read ecrmProduct column (fallback)
  3. If both empty → "Other"
  4. Group by product type
  5. Count links per product
  6. Sort by count (highest first)
  7. Take top 8 products
```

**Output**: Bar chart with up to 8 bars (one per product)

**Common Product Types**:
- **Internet Leased Line (ILL)**
- **MPLS VPN**
- **Point-to-Point (P2P)**
- **Broadband**
- **Metro Ethernet**
- **Dark Fiber**
- **IPLC**
- **SD-WAN**

**Business Insights**:
- **Product demand trends** (which products are growing)
- **Inventory planning** (stock the right equipment)
- **Sales focus** (promote high-margin products)
- **Technology evolution** (legacy vs. modern products)

---

### 5. SAM Allocation

**Purpose**: Show workload distribution across Service Account Managers  
**Business Value**: Balance account management workload, identify overloaded SAMs

**Data Flow**:
```
For each link:
  1. Read SAM_NAME column
  2. If empty/null → "Unassigned"
  3. Group by SAM name
  4. Count links per SAM
  5. Sort by count (highest first)
  6. Take top 10 SAMs
```

**Output**: Bar chart with up to 10 bars (one per SAM)

**Business Insights**:
- **Workload balance**: Are some SAMs overloaded?
- **Unassigned accounts**: Links without dedicated SAM (risk)
- **Territory planning**: Redistribute accounts for better coverage
- **Performance tracking**: Links per SAM as productivity metric

**Example Values**:
- "Rajesh Kumar" → 28 links
- "Priya Sharma" → 24 links
- "Unassigned" → 15 links (needs assignment!)

**Red Flags**:
- **High "Unassigned"**: Poor account coverage
- **Unbalanced distribution**: Some SAMs have 50+ links, others have 5
- **Single SAM dominance**: >40% of links with one person (single point of failure)

---

### 6. VIP Regions

**Purpose**: Identify regions with highest premium customer concentration  
**Business Value**: Focus premium support resources in high-value regions

**Data Flow**:
```
For each link:
  1. Check if Premium (using premium logic from Plot #3)
  2. If Premium:
     a. Read region column
     b. If empty → "Unknown"
     c. Group by region
     d. Count premium links per region
  3. Sort by count (highest first)
  4. Show all regions with premium links
```

**Output**: Bar chart with one bar per region (sorted by premium link count)

**Business Insights**:
- **Premium customer geography**: Where are high-value customers located?
- **Support resource allocation**: Deploy premium support teams in VIP regions
- **Sales targeting**: Focus premium sales efforts in these regions
- **Infrastructure investment**: Upgrade network in VIP regions first

**Example Values**:
- "Mumbai" → 45 premium links
- "Delhi NCR" → 38 premium links
- "Bangalore" → 32 premium links

**Strategic Use**:
- **Field office placement**: Open premium support centers in VIP regions
- **SLA compliance**: Ensure fastest response times in these regions
- **Network upgrades**: Prioritize capacity expansion in VIP regions

---

### 7. Service/Customer Matrix

**Purpose**: Analyze service penetration and market share  
**Business Value**: Understand product adoption rates and revenue distribution

**Data Flow**:
```
For each link:
  1. Read serviceFlavor column
  2. If empty → "Other"
  3. Group by service flavor
  4. Count links per flavor
  5. Calculate market share: (count / total links) * 100
  6. Create table with Service, Penetration, MarketShare
```

**Output**: Table with columns:
- **Service**: Service flavor name
- **Penetration**: Number of links using this service
- **MarketShare**: Percentage of total links (e.g., "35%")

**Business Insights**:
- **Product performance**: Which services are most popular?
- **Revenue concentration**: Is revenue too dependent on one service?
- **Cross-sell opportunities**: Customers using Service A might need Service B
- **Portfolio diversification**: Healthy mix vs. over-reliance on one product

**Example Table**:
| Service | Penetration | MarketShare |
|---------|-------------|-------------|
| MPLS | 45 | 41% |
| ILL | 30 | 27% |
| Broadband | 20 | 18% |
| P2P | 14 | 13% |

**Healthy Portfolio**: No single service >50% (diversified risk)

---

### 8. High-Risk Premium Clients

**Purpose**: List premium customers currently experiencing outages  
**Business Value**: Immediate escalation for SLA-critical situations

**Data Flow**:
```
For each link:
  1. Check if Premium (using premium logic from Plot #3)
  2. Check if linkStatus = "DOWN"
  3. If Premium AND DOWN:
     a. Add to high-risk list
     b. Extract: customerName, region, linkId/raNumber
     c. Mark as "CRITICAL" risk level
  4. Take first 20 matches
```

**Output**: Table with columns:
- **Customer**: Customer name
- **Region**: Geographic location
- **Circuit**: Link ID or RA Number
- **RiskLevel**: Always "CRITICAL"

**Business Insights**:
- **SLA breach risk**: Premium customers have strict SLAs
- **Revenue at risk**: Premium customers = high monthly recurring revenue
- **Escalation priority**: These outages need immediate attention
- **Executive visibility**: Report to senior management

**Example Table**:
| Customer | Region | Circuit | RiskLevel |
|----------|--------|---------|-----------|
| Reliance Industries | Mumbai | LSI-12345 | CRITICAL |
| HDFC Bank | Delhi NCR | CKT-67890 | CRITICAL |

**Operational Use**:
- **Immediate escalation**: Alert NOC manager, field teams
- **Customer communication**: Proactive notification to customer
- **SLA tracking**: Document outage for SLA credit calculations
- **Executive reporting**: Include in daily management reports

**Red Flags**:
- **>5 entries**: Multiple premium outages (major incident)
- **Same customer multiple times**: Customer has multiple circuits down (total outage)
- **Same region multiple times**: Regional infrastructure issue

---

## 🎯 Quick Reference: Column Mapping

### Links Sheet Columns Used

| Column Name | Used By Plots | Data Type | Example Values | Description |
|-------------|---------------|-----------|----------------|-------------|
| `customerName` | 1, 8 | String | "Reliance Industries", "TCS", "HDFC Bank" | Customer/company name |
| `serviceFlavor` | 2, 3, 7 | String | "MPLS", "ILL", "Broadband", "P2P", "Managed MPLS" | Type of service/product |
| `PREMIUM` | 3, 6, 8 | String | "Yes", "No" | Explicit premium flag |
| `SLA` | 3, 6, 8 | String | "Premium", "Standard", "Gold", "Silver" | SLA tier |
| `bandwidth` | 3, 6, 8 | Number | 2048, 10240, 102400 (in Kbps) | Link bandwidth |
| `SERVICE_TYPE` | 4 | String | "Internet Leased Line", "MPLS VPN", "P2P" | Primary product type |
| `ecrmProduct` | 4 | String | "ILL", "MPLS", "Broadband" | Fallback product type (from CRM) |
| `SAM_NAME` | 5 | String | "Rajesh Kumar", "Priya Sharma" | Service Account Manager name |
| `region` | 6, 8 | String | "Mumbai", "Delhi NCR", "Bangalore", "Chennai" | Geographic region |
| `linkId` | 8 | String | "LSI-12345", "CKT-001" | Primary circuit identifier |
| `raNumber` | 8 | String | "RA-2024-001" | Fallback circuit identifier (Revenue Assurance number) |
| `linkStatus` | 8 | String | "UP", "DOWN" | Current operational status |

---

## 📊 Chart Type Summary

| Chart Type | Plots Using It | Characteristics |
|------------|----------------|-----------------|
| **Bar Chart** | Customer Distribution, Product Mix, SAM Allocation, VIP Regions | Shows counts/values as bars, sorted by value |
| **Pie Chart** | Service Flavors | Shows percentage distribution as slices, circular |
| **Donut Chart** | Premium Breakdown | Like pie chart but with center hole, shows 2 categories |
| **Table** | Service/Customer Matrix, High-Risk Premium Clients | Lists detailed data with multiple columns |

---

## 🔄 Data Processing Flow

```
Excel File (Links Sheet)
    ↓
Dashboard Upload
    ↓
Zustand Store (allLinks)
    ↓
Filter Application (getFilteredLinks)
    ↓
useMemo Computations (per plot)
    ↓
Premium Classification Logic (shared across plots 3, 6, 8)
    ↓
Chart/Table Rendering
    ↓
User Interaction (right-click, export)
```

---

## 🎯 Premium Classification Logic (Shared)

**Used by**: Premium Breakdown, VIP Regions, High-Risk Premium Clients

```javascript
function isPremiumLink(link) {
    return (
        link.PREMIUM === 'Yes' ||                              // Explicit flag
        link.SLA === 'Premium' ||                              // Premium SLA
        link.serviceFlavor?.toLowerCase().includes('managed') || // Managed service
        (link.bandwidth && parseInt(link.bandwidth) > 10000)   // High bandwidth (>10 Mbps)
    );
}
```

**Any ONE condition = Premium**

---

## ⚠️ Important Notes

### Top N Filtering
- **Customer Distribution**: Top 10 customers
- **Product Mix**: Top 8 products
- **SAM Allocation**: Top 10 SAMs
- **High-Risk Premium Clients**: First 20 outages

**Why limit?**: Keep charts readable, focus on most important items

### Fallback Columns
- **Product Mix**: `SERVICE_TYPE` → `ecrmProduct` (if first is empty)
- **High-Risk Circuits**: `linkId` → `raNumber` (if first is empty)

### Case Sensitivity
- **serviceFlavor check**: Uses `.toLowerCase()` for "managed" detection
- Ensures "Managed MPLS", "MANAGED ILL", "managed services" all match

### Default Values
- **customerName**: Empty → "Other"
- **serviceFlavor**: Empty → "Other"
- **SERVICE_TYPE/ecrmProduct**: Both empty → "Other"
- **SAM_NAME**: Empty → "Unassigned"
- **region**: Empty → "Unknown"

---

## 📈 Healthy Targets

| Plot | Healthy Range | Red Flag |
|------|---------------|----------|
| Customer Distribution | Top customer <30% of total | One customer >50% (concentration risk) |
| Service Flavors | Balanced mix | One service >60% (over-reliance) |
| Premium Breakdown | 20-40% Premium | <10% Premium (low-value) OR >60% Premium (unsustainable) |
| Product Mix | Diverse portfolio | One product >70% |
| SAM Allocation | Balanced workload | "Unassigned" >20% OR one SAM >40% |
| VIP Regions | Top 3 regions <60% | One region >50% (geographic concentration) |
| Service/Customer Matrix | No service >50% share | One service >70% share |
| High-Risk Premium Clients | 0-5 outages | >10 outages (major incident) |

---

## 🛠️ Troubleshooting Guide

### If a plot shows unexpected data:

1. **Check Excel Column Names**
   - Verify exact column names (case-sensitive in Excel)
   - Common issues: "Customer Name" vs. "customerName"

2. **Check Data Values**
   - **PREMIUM**: Must be exactly "Yes" (not "yes", "Y", "TRUE")
   - **SLA**: Must be exactly "Premium" (not "premium", "PREMIUM")
   - **linkStatus**: Must be exactly "DOWN" (not "down", "Down")

3. **Check Bandwidth Format**
   - Must be numeric (not "10 Mbps" or "10,000")
   - Should be in Kbps (10 Mbps = 10000)

4. **Check Empty Values**
   - Empty cells will show as "Other", "Unassigned", or "Unknown"
   - Verify if this is intentional or data quality issue

5. **Check Fallback Columns**
   - If SERVICE_TYPE is empty, ecrmProduct is used
   - If linkId is empty, raNumber is used

---

## 💼 Business Use Cases

### Use Case 1: Account Manager Workload Balancing
**Plots Used**: Customer Distribution, SAM Allocation

**Scenario**: SAM Allocation shows "Rajesh Kumar" has 50 links, while "Priya Sharma" has 10.

**Action**:
1. Review customer distribution to identify large customers
2. Reassign some of Rajesh's smaller customers to Priya
3. Target: Each SAM manages 20-30 links

---

### Use Case 2: Premium Customer Outage Response
**Plots Used**: High-Risk Premium Clients, VIP Regions

**Scenario**: High-Risk table shows 3 premium customers down in Mumbai.

**Action**:
1. Immediate escalation to NOC manager
2. Dispatch field team to Mumbai (VIP region)
3. Proactive customer communication
4. Executive notification (SLA risk)

---

### Use Case 3: Product Portfolio Optimization
**Plots Used**: Service Flavors, Service/Customer Matrix, Product Mix

**Scenario**: Service Flavors shows 70% MPLS, 30% other services.

**Analysis**:
- **Risk**: Over-reliance on one product
- **Opportunity**: Diversify into SD-WAN, Cloud Connect
- **Strategy**: Cross-sell ILL/Broadband to MPLS customers

**Action**:
1. Sales team targets MPLS customers for additional services
2. Marketing campaigns for underutilized products
3. Quarterly review to track diversification progress

---

### Use Case 4: Regional Expansion Planning
**Plots Used**: VIP Regions, Customer Distribution

**Scenario**: VIP Regions shows 60% of premium customers in Mumbai/Delhi.

**Analysis**:
- **Concentration risk**: Too dependent on 2 cities
- **Growth opportunity**: Expand to Bangalore, Hyderabad
- **Infrastructure need**: Upgrade network in emerging regions

**Action**:
1. Sales focus on Tier-2 cities
2. Infrastructure investment in growing regions
3. Hire regional SAMs for new territories

---

**End of Reference Guide**
