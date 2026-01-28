# Geography & Field Module - Plot Reference Guide

**Module**: Geography & Field  
**Source**: Airtel Analytics Dashboard  
**Last Updated**: 2026-01-28

---

## 📊 Complete Plot Reference Table

| # | Plot Name | Chart Type | Excel Sheet | Columns Used | Logic Description | What It Shows |
|---|-----------|------------|-------------|--------------|-------------------|---------------|
| 1 | **Regional Distribution** | Bar Chart | Links | `region` | Groups links by region. Sorts by count (descending). Empty values labeled as "Unknown". | Number of links deployed in each region (geographic footprint) |
| 2 | **Outages by Region** | Bar Chart | Links | `region`, `linkStatus` | Filters links where linkStatus="DOWN". Groups by region. Sorts by count (descending). Empty regions labeled as "Unknown". All bars colored red. | Regions with the most link failures (field repair priorities) |
| 3 | **State Density** | Table | Links | `state` | Groups links by state. Counts links per state. Calculates intensity: >200 links = "HIGH", else "MEDIUM". Sorts by density (descending). Empty states labeled as "Other". | Link concentration by state with intensity classification |
| 4 | **Field Ops Priority** | Table | Links | `state`, `region`, `linkStatus` | Filters links where linkStatus="DOWN". Groups by state. Counts outages per state. Assigns priority: >10 outages = "CRITICAL", else "HIGH". Sorts by outage count (descending). | States requiring urgent field operations (dispatch priorities) |

---

## 📋 Detailed Plot Specifications

### 1. Regional Distribution

**Purpose**: Show geographic footprint of network infrastructure  
**Business Value**: Understand regional presence and resource allocation needs

**Data Flow**:
```
For each link:
  1. Read region column
  2. If empty/null → "Unknown"
  3. Group by region
  4. Count links per region
  5. Sort by count (highest first)
  6. Show all regions
```

**Output**: Bar chart with one bar per region (sorted by link count)

**Common Region Values**:
- "Mumbai"
- "Delhi NCR"
- "Bangalore"
- "Chennai"
- "Hyderabad"
- "Kolkata"
- "Pune"
- "Ahmedabad"

**Business Insights**:
- **Infrastructure footprint**: Where is your network concentrated?
- **Market penetration**: Which regions have strong presence?
- **Resource allocation**: Where to deploy field teams?
- **Growth opportunities**: Underserved regions for expansion

**Example Values**:
- Mumbai → 45 links (largest presence)
- Delhi NCR → 38 links
- Bangalore → 32 links
- Unknown → 5 links (data quality issue)

**Strategic Use**:
- **Field office placement**: Open offices in high-density regions
- **Inventory planning**: Stock spare parts in major regions
- **Hiring**: Recruit field engineers in regions with most links
- **Expansion planning**: Target regions with low link count

**Red Flags**:
- **High "Unknown"**: >10% of links missing region data (data quality issue)
- **Single region dominance**: One region >60% of total (geographic concentration risk)
- **Empty regions**: Major cities with zero links (missed market opportunity)

---

### 2. Outages by Region

**Purpose**: Identify regions with highest failure rates  
**Business Value**: Prioritize field repair resources and identify problem areas

**Data Flow**:
```
For each link:
  1. Check if linkStatus = "DOWN"
  2. If DOWN:
     a. Read region column
     b. If empty → "Unknown"
     c. Group by region
     d. Count outages per region
  3. Sort by outage count (highest first)
  4. Color all bars red (critical)
```

**Output**: Bar chart with one red bar per region (sorted by outage count)

**Business Insights**:
- **Field repair priorities**: Which regions need immediate attention?
- **Infrastructure quality**: Are some regions more failure-prone?
- **Vendor performance**: Regional ISP/vendor reliability
- **Weather/environmental impact**: Natural disasters affecting specific regions

**Example Scenario**:

**Normal Day**:
- Mumbai → 2 outages
- Delhi NCR → 1 outage
- Bangalore → 1 outage

**After Cyclone**:
- Mumbai → 25 outages (disaster impact!)
- Pune → 15 outages
- Other regions → 1-2 outages

**Operational Use**:

**Daily Operations**:
1. **Morning Check**: Review this chart at shift start
2. **Dispatch Planning**: Send field teams to high-outage regions
3. **Escalation**: >10 outages in one region = major incident

**Incident Response**:
1. **Identify hotspot**: Which region has most failures?
2. **Root cause**: Is it weather, vendor issue, or infrastructure?
3. **Resource mobilization**: Deploy extra field teams to affected region
4. **Customer communication**: Proactive notification to customers in affected region

**Strategic Analysis**:
- **Chronic issues**: Same region always has high outages → infrastructure upgrade needed
- **Seasonal patterns**: Monsoon season → Mumbai/coastal regions have more failures
- **Vendor comparison**: Region A (Vendor X) vs. Region B (Vendor Y) failure rates

**Red Flags**:
- **One region >50% of total outages**: Major regional infrastructure problem
- **Sudden spike**: Region normally has 2 outages, now has 20 → disaster/major incident
- **Persistent high outages**: Same region in top 3 every day → chronic infrastructure issue

---

### 3. State Density

**Purpose**: Show link concentration by state with intensity classification  
**Business Value**: Understand state-level infrastructure density for operations planning

**Data Flow**:
```
For each link:
  1. Read state column
  2. If empty/null → "Other"
  3. Group by state
  4. Count links per state (Density)
  5. Calculate Intensity:
     - If Density > 200 → "HIGH"
     - Else → "MEDIUM"
  6. Sort by Density (highest first)
  7. Create table with State, Density, Intensity
```

**Output**: Table with columns:
- **State**: State name
- **Density**: Number of links in that state
- **Intensity**: "HIGH" (>200 links) or "MEDIUM" (≤200 links)

**Business Insights**:
- **Operations complexity**: High-density states need more resources
- **Support structure**: HIGH intensity states need dedicated state-level teams
- **Inventory management**: Stock more spares in high-density states
- **Escalation hierarchy**: HIGH states may need state-level NOC managers

**Example Table**:
| State | Density | Intensity |
|-------|---------|-----------|
| Maharashtra | 450 | HIGH |
| Karnataka | 320 | HIGH |
| Delhi | 280 | HIGH |
| Tamil Nadu | 180 | MEDIUM |
| Gujarat | 120 | MEDIUM |
| West Bengal | 85 | MEDIUM |

**Intensity Classification Explained**:

**HIGH Intensity (>200 links)**:
- **Characteristics**: Major state with extensive network
- **Operations**: Needs dedicated state-level team
- **Support**: 24/7 field presence required
- **Inventory**: Regional warehouse needed
- **Examples**: Maharashtra, Karnataka, Delhi

**MEDIUM Intensity (≤200 links)**:
- **Characteristics**: Moderate network presence
- **Operations**: Can share resources with nearby states
- **Support**: On-call field teams acceptable
- **Inventory**: Central warehouse sufficient
- **Examples**: Gujarat, West Bengal, Rajasthan

**Operational Planning**:

**For HIGH Intensity States**:
1. **Dedicated Team**: State-level NOC manager + 5-10 field engineers
2. **Infrastructure**: Regional office with spare parts warehouse
3. **Escalation**: Direct escalation path to state manager
4. **Monitoring**: Real-time dashboards for state-level metrics

**For MEDIUM Intensity States**:
1. **Shared Resources**: Regional team covers multiple states
2. **Infrastructure**: Central warehouse, no local office needed
3. **Escalation**: Escalate to regional manager
4. **Monitoring**: Daily/weekly reports sufficient

**Strategic Use**:
- **Hiring**: Recruit more engineers in HIGH intensity states
- **Budget allocation**: More OPEX for HIGH intensity states
- **Office locations**: Open regional offices in HIGH intensity states
- **Vendor contracts**: Negotiate better rates for high-volume states

---

### 4. Field Ops Priority

**Purpose**: Identify states requiring urgent field operations based on outage count  
**Business Value**: Optimize field team dispatch and emergency response

**Data Flow**:
```
For each link:
  1. Check if linkStatus = "DOWN"
  2. If DOWN:
     a. Read state column (if empty → "Other")
     b. Read region column (for context)
     c. Group by state
     d. Count outages per state
  3. For each state with outages:
     a. Calculate Priority:
        - If outages > 10 → "CRITICAL"
        - Else → "HIGH"
  4. Sort by outage count (highest first)
  5. Create table with State, Outages, Region, Priority
```

**Output**: Table with columns:
- **State**: State name
- **Outages**: Number of links down in that state
- **Region**: Region the state belongs to (for context)
- **Priority**: "CRITICAL" (>10 outages) or "HIGH" (≤10 outages)

**Business Insights**:
- **Dispatch priorities**: Which states need field teams immediately?
- **Resource allocation**: How many engineers to send to each state?
- **Severity assessment**: CRITICAL vs HIGH priority states
- **Regional coordination**: Multiple states in same region may share root cause

**Example Table**:
| State | Outages | Region | Priority |
|-------|---------|--------|----------|
| Maharashtra | 25 | Mumbai | CRITICAL |
| Karnataka | 15 | Bangalore | CRITICAL |
| Delhi | 8 | Delhi NCR | HIGH |
| Tamil Nadu | 5 | Chennai | HIGH |
| Gujarat | 3 | Ahmedabad | HIGH |

**Priority Classification Explained**:

**CRITICAL Priority (>10 outages)**:
- **Severity**: Major incident affecting multiple customers
- **Response Time**: Immediate (within 1 hour)
- **Resources**: Deploy multiple field teams
- **Escalation**: Notify state manager, regional manager, and executive team
- **Communication**: Proactive customer notifications
- **Examples**: Natural disaster, major infrastructure failure, vendor outage

**HIGH Priority (≤10 outages)**:
- **Severity**: Normal operational issues
- **Response Time**: Within 4 hours
- **Resources**: Standard field team dispatch
- **Escalation**: Notify state manager only
- **Communication**: Standard SLA-based communication
- **Examples**: Individual link failures, equipment issues

**Operational Workflow**:

**For CRITICAL Priority States**:
```
1. Immediate Actions (0-15 minutes):
   - Alert state manager and regional manager
   - Dispatch all available field teams to affected state
   - Activate emergency response protocol
   - Notify executive team

2. Short-term Actions (15-60 minutes):
   - Assess root cause (weather, vendor, infrastructure)
   - Coordinate with vendor/ISP if needed
   - Set up war room for incident management
   - Prepare customer communication

3. Ongoing Actions:
   - Hourly status updates to management
   - Real-time tracking of restoration progress
   - Post-incident review and documentation
```

**For HIGH Priority States**:
```
1. Standard Response (0-60 minutes):
   - Alert state manager
   - Dispatch field team to affected sites
   - Follow standard SLA procedures

2. Monitoring:
   - Track restoration progress
   - Update tickets as resolved
   - Standard reporting
```

**Strategic Use**:

**Daily Operations**:
- **Shift Handover**: Review this table at every shift change
- **Resource Planning**: Pre-position field teams in states with frequent CRITICAL status
- **Vendor Management**: Track vendor SLAs by state

**Monthly Review**:
- **Chronic Issues**: States frequently appearing as CRITICAL need infrastructure upgrades
- **Seasonal Patterns**: Monsoon months → coastal states more CRITICAL
- **Vendor Performance**: Compare outage rates by state/vendor

**Red Flags**:
- **Same state CRITICAL daily**: Chronic infrastructure problem
- **Multiple states CRITICAL simultaneously**: Regional/national infrastructure issue
- **CRITICAL with low link count**: High failure rate (e.g., 12 outages but only 20 total links = 60% failure rate!)

---

## 🎯 Quick Reference: Column Mapping

### Links Sheet Columns Used

| Column Name | Used By Plots | Data Type | Example Values | Description |
|-------------|---------------|-----------|----------------|-------------|
| `region` | 1, 2, 4 | String | "Mumbai", "Delhi NCR", "Bangalore", "Chennai" | Geographic region/city |
| `state` | 3, 4 | String | "Maharashtra", "Karnataka", "Delhi", "Tamil Nadu" | State name |
| `linkStatus` | 2, 4 | String | "UP", "DOWN" | Current operational status of link |

---

## 📊 Chart Type Summary

| Chart Type | Plots Using It | Characteristics |
|------------|----------------|-----------------|
| **Bar Chart** | Regional Distribution, Outages by Region | Shows counts as bars, sorted by value |
| **Table** | State Density, Field Ops Priority | Lists detailed data with multiple columns, sorted by primary metric |

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
Filtering (linkStatus = "DOWN" for plots 2, 4)
    ↓
Grouping (by region or state)
    ↓
Sorting (by count, descending)
    ↓
Classification (Intensity/Priority calculation)
    ↓
Chart/Table Rendering
```

---

## 🎯 Classification Logic

### State Density - Intensity Classification
```javascript
Intensity = (Density > 200) ? "HIGH" : "MEDIUM"
```

**Threshold**: 200 links
- **Above 200**: HIGH intensity (major state, needs dedicated resources)
- **200 or below**: MEDIUM intensity (moderate presence, shared resources)

---

### Field Ops Priority - Priority Classification
```javascript
Priority = (Outages > 10) ? "CRITICAL" : "HIGH"
```

**Threshold**: 10 outages
- **Above 10**: CRITICAL priority (major incident, immediate response)
- **10 or below**: HIGH priority (normal operations, standard response)

---

## ⚠️ Important Notes

### Geographic Hierarchy
- **Region**: City-level (Mumbai, Delhi NCR, Bangalore)
- **State**: State-level (Maharashtra, Karnataka, Delhi)
- **Relationship**: Multiple regions can be in one state
  - Example: Mumbai region + Pune region → Maharashtra state

### Default Values
- **region**: Empty → "Unknown"
- **state**: Empty → "Other"

### Sorting
- All plots sort by count/density/outages in **descending order** (highest first)
- This ensures most critical items appear at the top

### Color Coding
- **Outages by Region**: All bars are **red** (#f43f5e) to indicate critical status
- **Other plots**: Default colors (blue/gray)

### Data Quality
- **"Unknown" regions**: Indicates missing region data in Excel
- **"Other" states**: Indicates missing state data in Excel
- **High unknown/other %**: Data quality issue requiring cleanup

---

## 📈 Healthy Targets

| Plot | Healthy Range | Red Flag |
|------|---------------|----------|
| Regional Distribution | Balanced across top 5 regions | One region >50% (concentration risk) |
| Outages by Region | <5% of links down per region | One region >20% failure rate |
| State Density | Mix of HIGH and MEDIUM | All states MEDIUM (no major presence) OR all HIGH (over-concentration) |
| Field Ops Priority | 0-2 CRITICAL states | >5 CRITICAL states (major incident) |

---

## 🛠️ Troubleshooting Guide

### If a plot shows unexpected data:

1. **Check Excel Column Names**
   - Verify `region` and `state` columns exist
   - Check for typos or extra spaces

2. **Check Data Values**
   - **region**: Should be city names (Mumbai, Delhi NCR, etc.)
   - **state**: Should be state names (Maharashtra, Karnataka, etc.)
   - **linkStatus**: Must be exactly "DOWN" (not "down", "Down")

3. **Check Geographic Consistency**
   - Verify region-to-state mapping is correct
   - Example: Mumbai region should be in Maharashtra state

4. **Check for Empty Values**
   - Empty regions show as "Unknown"
   - Empty states show as "Other"
   - High unknown/other % indicates data quality issue

5. **Validate Outage Data**
   - If Outages by Region shows zero everywhere, check if linkStatus column exists
   - Verify linkStatus values are "UP" or "DOWN" (not other values)

---

## 💼 Business Use Cases

### Use Case 1: Disaster Response (Cyclone in Mumbai)
**Plots Used**: Outages by Region, Field Ops Priority

**Scenario**: Cyclone hits Mumbai, causing widespread outages.

**Before Cyclone**:
- Outages by Region: Mumbai → 2 outages
- Field Ops Priority: Maharashtra → 2 outages (HIGH)

**After Cyclone**:
- Outages by Region: Mumbai → 45 outages (top of chart, red bar)
- Field Ops Priority: Maharashtra → 45 outages (CRITICAL)

**Response**:
1. **Immediate** (0-15 min):
   - Alert all Maharashtra field teams
   - Notify regional and executive management
   - Activate disaster response protocol

2. **Short-term** (1-4 hours):
   - Deploy field teams from nearby states (Gujarat, Goa)
   - Coordinate with vendors for emergency support
   - Set up customer communication center

3. **Ongoing**:
   - Hourly updates to management
   - Track restoration progress on dashboard
   - Post-disaster review and lessons learned

---

### Use Case 2: Regional Expansion Planning
**Plots Used**: Regional Distribution, State Density

**Scenario**: Planning to expand network to new regions.

**Current State**:
- Regional Distribution: Mumbai (45), Delhi (38), Bangalore (32), Chennai (15), Hyderabad (10)
- State Density: Maharashtra (HIGH), Karnataka (HIGH), Delhi (HIGH), Tamil Nadu (MEDIUM)

**Analysis**:
- **Strong presence**: Mumbai, Delhi, Bangalore (HIGH density)
- **Growing markets**: Chennai, Hyderabad (MEDIUM density)
- **Underserved**: Kolkata, Pune, Ahmedabad (low/zero links)

**Expansion Strategy**:
1. **Tier 1**: Strengthen existing HIGH density states (upsell to existing customers)
2. **Tier 2**: Grow MEDIUM density states to HIGH (Chennai, Hyderabad)
3. **Tier 3**: Enter new markets (Kolkata, Pune, Ahmedabad)

**Resource Allocation**:
- **HIGH states**: Maintain current resources, focus on retention
- **MEDIUM states**: Hire 2-3 field engineers, open small office
- **New markets**: Partner with local vendors initially, hire after reaching 50 links

---

### Use Case 3: Field Team Optimization
**Plots Used**: State Density, Field Ops Priority

**Scenario**: Optimizing field team allocation across states.

**Current Allocation** (Before Optimization):
- Maharashtra (450 links, HIGH): 5 engineers
- Karnataka (320 links, HIGH): 5 engineers
- Tamil Nadu (180 links, MEDIUM): 5 engineers
- Gujarat (120 links, MEDIUM): 5 engineers

**Analysis**:
- Maharashtra and Karnataka are **under-resourced** (90 links per engineer)
- Tamil Nadu and Gujarat are **over-resourced** (24-36 links per engineer)

**Optimized Allocation**:
- Maharashtra: 8 engineers (56 links per engineer)
- Karnataka: 6 engineers (53 links per engineer)
- Tamil Nadu: 3 engineers (60 links per engineer)
- Gujarat: 2 engineers (60 links per engineer)

**Result**:
- **Same total headcount** (20 engineers)
- **Better distribution** based on link density
- **Faster response times** in high-density states

---

### Use Case 4: Vendor Performance Tracking
**Plots Used**: Outages by Region, Field Ops Priority

**Scenario**: Comparing vendor performance across regions.

**Setup**:
- Vendor A: Provides connectivity in Mumbai, Pune (Maharashtra)
- Vendor B: Provides connectivity in Bangalore, Mysore (Karnataka)

**Monthly Review**:
- Outages by Region:
  - Mumbai (Vendor A): 25 outages
  - Bangalore (Vendor B): 8 outages
- Field Ops Priority:
  - Maharashtra (Vendor A): 25 outages (CRITICAL)
  - Karnataka (Vendor B): 8 outages (HIGH)

**Analysis**:
- **Vendor A**: High failure rate (25/45 links = 56% failure rate)
- **Vendor B**: Low failure rate (8/32 links = 25% failure rate)

**Action**:
1. **Immediate**: Escalate to Vendor A management
2. **Short-term**: Demand root cause analysis and corrective action plan
3. **Long-term**: Consider replacing Vendor A if performance doesn't improve
4. **Strategic**: Negotiate SLA penalties for poor performance

---

## 🌍 Geographic Data Best Practices

### Region Naming Conventions
- Use consistent naming: "Delhi NCR" (not "Delhi", "NCR", "Delhi-NCR")
- Avoid abbreviations: "Mumbai" (not "MUM", "BOM")
- Include context: "Delhi NCR" (not just "Delhi")

### State Naming Conventions
- Use full state names: "Maharashtra" (not "MH", "Maha")
- Match official names: "Tamil Nadu" (not "Tamilnadu", "TN")

### Data Quality Checks
- **Monthly audit**: Review "Unknown" and "Other" percentages
- **Target**: <5% unknown/other values
- **Cleanup**: Update missing region/state data in source system

---

**End of Reference Guide**
