# Lifecycle & Resources Module - Plot Reference Guide

**Module**: Lifecycle & Resources  
**Source**: Airtel Analytics Dashboard  
**Last Updated**: 2026-01-28

---

## 📊 Complete Plot Reference Table

| # | Plot Name | Chart Type | Excel Sheet | Columns Used | Logic Description | What It Shows |
|---|-----------|------------|-------------|--------------|-------------------|---------------|
| 1 | **Link Growth Trends** | Bar Chart | Links | `addedDate` | If addedDate exists: Groups links by addedDate, counts added per date, sorts chronologically, takes last 6 dates. If no addedDate: Shows mock data (Oct-Jan). | Historical trend of new links added to network over time |
| 2 | **Polling Protocols** | Donut Chart | Nodes | `snmpStatus`, `pingStatus` | For each node: If snmpStatus="UP" → SNMP. Else if pingStatus="UP" → ICMP. Else → No Polling. Counts each category. | Distribution of monitoring methods (SNMP vs ICMP vs unmonitored) |
| 3 | **Resource Polling Status** | Table | Nodes + Links | `snmpStatus`, `pingStatus`, `utilization` | Calculates for 3 resources: SNMP Polling (nodes with snmpStatus=UP), ICMP Polling (nodes with pingStatus=UP), Link Performance (links with utilization>0). Shows Configured, Applied, Active, Gap for each. | Monitoring resource configuration and activation status |
| 4 | **Outage Correlation** | Bar Chart | Links | `linkStatus`, `region` | Filters links where linkStatus="DOWN". Groups by region + "Business Hours" (mocked). Sorts by count (descending). | Outages correlated by region and time context |
| 5 | **SNMP Polling Exceptions** | Table | Nodes | `pingStatus`, `status`, `snmpStatus`, `scanType`, `deviceName`, `loopbackIP`, `probableCause` | Filters nodes where: (pingStatus=UP OR status=UP) AND (snmpStatus=DOWN OR scanType doesn't include SNMP). Takes first 15 nodes. | List of devices reachable via ping but not responding to SNMP |

---

## 📋 Detailed Plot Specifications

### 1. Link Growth Trends

**Purpose**: Track network expansion over time  
**Business Value**: Understand growth patterns, forecast capacity needs, measure sales performance

**Data Source**: **Links** sheet

**Data Flow**:
```
Check if any link has addedDate:

If YES (Real Data):
  For each link:
    1. Read addedDate column
    2. If empty → "Unknown"
    3. Group by date
    4. Count links added per date
    5. Sort chronologically
    6. Take last 6 dates (most recent)
    7. Create bar chart with Added count

If NO (Mock Data):
  Show sample data:
    - Oct 23: 45 added, 12 deleted
    - Nov 23: 62 added, 8 deleted
    - Dec 23: 38 added, 15 deleted
    - Jan 24: 55 added, 10 deleted
```

**Output**: Bar chart with up to 6 bars (one per time period)

**Chart Elements**:
- **X-axis**: Date/month (e.g., "Oct 23", "Nov 23")
- **Y-axis**: Number of links
- **Bars**: Links added in that period
- **Note**: "Deleted" data shown in mock but not currently used in real data

**Business Insights**:

**1. Growth Trajectory**:
- **Upward trend**: Network expanding (good for revenue)
- **Flat trend**: Stagnant growth (sales concern)
- **Downward trend**: Network shrinking (churn issue)

**2. Seasonality**:
- **Q4 spike**: Year-end budget spending
- **Q1 dip**: Post-holiday slowdown
- **Monsoon impact**: Seasonal installation delays

**3. Sales Performance**:
- **Target tracking**: Are we meeting monthly/quarterly targets?
- **Pipeline health**: Consistent additions = healthy pipeline
- **Acceleration**: Growth rate increasing or decreasing?

**4. Capacity Planning**:
- **Resource needs**: More links = more NOC staff, more monitoring capacity
- **Infrastructure**: Plan data center, NOC expansion
- **Budget**: Forecast OPEX based on growth rate

**Example Data**:

**Healthy Growth**:
- Oct 23: 45 links
- Nov 23: 52 links (+15%)
- Dec 23: 58 links (+12%)
- Jan 24: 65 links (+12%)
- **Trend**: Consistent 12-15% monthly growth

**Concerning Pattern**:
- Oct 23: 60 links
- Nov 23: 45 links (-25%)
- Dec 23: 30 links (-33%)
- Jan 24: 25 links (-17%)
- **Trend**: Declining growth, possible churn issue

**Operational Use**:

**Monthly Review**:
1. **Compare to target**: Did we meet monthly sales target?
2. **Trend analysis**: Is growth accelerating or slowing?
3. **Forecast**: Project next 3-6 months based on trend

**Strategic Planning**:
1. **Annual planning**: Use historical data to set realistic targets
2. **Resource allocation**: Hire staff based on growth projections
3. **Investment**: Justify infrastructure spend with growth data

**Red Flags**:
- **Negative growth**: More deletions than additions
- **Volatile pattern**: Wild swings month-to-month (unstable business)
- **Flat for 6+ months**: Growth stalled (sales issue)

---

### 2. Polling Protocols

**Purpose**: Show distribution of monitoring methods  
**Business Value**: Understand monitoring coverage and protocol usage

**Data Source**: **Nodes** sheet

**Data Flow**:
```
For each node (device):
  1. Check snmpStatus:
     - If snmpStatus = "UP" → Categorize as "SNMP"
  
  2. Else, check pingStatus:
     - If pingStatus = "UP" → Categorize as "ICMP"
  
  3. Else:
     - Categorize as "No Polling"
  
  4. Count each category
  5. Create donut chart
```

**Output**: Donut chart with 3 slices:
- **SNMP** (Green) - Full monitoring capability
- **ICMP** (Orange) - Basic ping monitoring only
- **No Polling** (Red) - Not monitored at all

**Protocol Comparison**:

| Protocol | Capabilities | Use Case | Limitations |
|----------|--------------|----------|-------------|
| **SNMP** | Full monitoring: bandwidth, errors, CPU, memory, interface stats | Production devices, critical infrastructure | Requires SNMP configuration, more overhead |
| **ICMP** | Basic reachability: UP/DOWN status only | Simple devices, IoT, printers | No performance metrics, no detailed stats |
| **No Polling** | None - device invisible to monitoring | Devices in deployment, testing, or decommissioning | No visibility, no alerts |

**Business Insights**:

**1. Monitoring Maturity**:
- **High SNMP %**: Mature monitoring (detailed metrics)
- **High ICMP %**: Basic monitoring (limited visibility)
- **High No Polling %**: Poor monitoring coverage (blind spots)

**2. Operational Capability**:
- **SNMP**: Can detect performance degradation before failure
- **ICMP**: Can only detect complete failures
- **No Polling**: Cannot detect any issues

**3. Troubleshooting Efficiency**:
- **SNMP**: Rich historical data for RCA
- **ICMP**: Limited to UP/DOWN history
- **No Polling**: No data for troubleshooting

**Example Distribution**:

**Mature Network**:
- SNMP: 75% (good detailed monitoring)
- ICMP: 20% (basic devices)
- No Polling: 5% (acceptable for test devices)

**Immature Network**:
- SNMP: 30% (limited detailed monitoring)
- ICMP: 40% (too much basic monitoring)
- No Polling: 30% (major blind spots)

**Operational Use**:

**Daily Operations**:
- **Target**: >70% SNMP, <10% No Polling
- **Action**: Enable SNMP on ICMP-only devices
- **Priority**: Move No Polling devices to at least ICMP

**Strategic Planning**:
- **SNMP migration**: Plan to convert ICMP devices to SNMP
- **Budget**: Allocate for SNMP licenses, monitoring tools
- **Training**: Train team on SNMP configuration

**Red Flags**:
- **No Polling >20%**: Major monitoring gaps
- **ICMP >50%**: Too much basic monitoring, limited visibility
- **SNMP <50%**: Insufficient detailed monitoring

---

### 3. Resource Polling Status

**Purpose**: Show monitoring resource configuration and activation status  
**Business Value**: Identify gaps between configured and active monitoring

**Data Source**: **Nodes** + **Links** sheets

**Data Flow**:
```
Calculate for 3 resource types:

1. SNMP Polling:
   - Configured: Total nodes
   - Applied: Total nodes (assumed all configured)
   - Active: Nodes with snmpStatus = "UP"
   - Gap: Total - Active

2. ICMP Polling:
   - Configured: Total nodes
   - Applied: Total nodes (assumed all configured)
   - Active: Nodes with pingStatus = "UP"
   - Gap: Total - Active

3. Link Performance:
   - Configured: Total links
   - Applied: Total links (assumed all configured)
   - Active: Links with utilization > 0
   - Gap: Links with no utilization data

Create table with 3 rows (one per resource)
```

**Output**: Table with columns:
- **Resource**: Resource type name
- **Configured**: Number of devices/links configured for this resource
- **Applied**: Number where configuration is applied
- **Active**: Number actually working/responding
- **Gap**: Configured - Active (items not working)

**Column Definitions**:

- **Configured**: Total inventory (all devices/links)
- **Applied**: Configuration deployed (assumed 100% in current logic)
- **Active**: Actually functioning (responding to polls)
- **Gap**: Not functioning (configured but not responding)

**Example Table**:
| Resource | Configured | Applied | Active | Gap |
|----------|------------|---------|--------|-----|
| SNMP Polling | 750 | 750 | 565 | 185 |
| ICMP Polling | 750 | 750 | 720 | 30 |
| Link Performance | 109 | 109 | 85 | 24 |

**Interpretation**:

**SNMP Polling** (565/750 = 75% active):
- **Gap of 185**: 185 devices configured for SNMP but not responding
- **Action**: Troubleshoot why 25% of SNMP polling is failing
- **Possible causes**: Wrong credentials, firewall, service down

**ICMP Polling** (720/750 = 96% active):
- **Gap of 30**: Only 30 devices not responding to ping
- **Action**: Check if these 30 devices are down or unreachable
- **Good status**: 96% reachability is healthy

**Link Performance** (85/109 = 78% active):
- **Gap of 24**: 24 links have no utilization data
- **Action**: Enable performance monitoring on these 24 links
- **Impact**: Missing capacity planning data for 22% of links

**Business Insights**:

**1. Monitoring Effectiveness**:
- **Low gap**: Monitoring is working well
- **High gap**: Many configured items not actually monitored

**2. Troubleshooting Priorities**:
- **Large SNMP gap**: Fix SNMP issues (credentials, firewall)
- **Large ICMP gap**: Devices down or unreachable
- **Large Performance gap**: Enable utilization collection

**3. Data Quality**:
- **Gap = 0**: Perfect monitoring (unlikely)
- **Gap < 10%**: Excellent monitoring
- **Gap > 30%**: Poor monitoring, data quality issues

**Operational Use**:

**Weekly Review**:
1. **Track gap trends**: Is gap increasing or decreasing?
2. **Prioritize fixes**: Focus on largest gaps first
3. **Set targets**: Reduce gap by 10% per month

**Monthly Reporting**:
1. **KPI**: "Monitoring Effectiveness" = (Active / Configured) * 100
2. **Target**: >90% for all resources
3. **Executive summary**: "SNMP monitoring at 75%, need to improve"

**Red Flags**:
- **Gap >30%**: Major monitoring failure
- **Gap increasing**: Monitoring degrading over time
- **Performance gap >40%**: Cannot do capacity planning

---

### 4. Outage Correlation

**Purpose**: Correlate outages by region and time context  
**Business Value**: Identify patterns in outages for root cause analysis

**Data Source**: **Links** sheet

**Data Flow**:
```
For each link:
  1. Check if linkStatus = "DOWN"
  2. If DOWN:
     a. Read region column
     b. Append " | Business Hours" (mocked time context)
     c. Create key: "Region | Business Hours"
     d. Count outages per key
  3. Sort by count (highest first)
  4. Create bar chart
```

**Output**: Bar chart with one bar per region-time combination

**Current Implementation Note**:
- Time context is **mocked** as "Business Hours" for all outages
- Future enhancement: Use actual timestamp to determine business hours vs. after hours

**Example Data**:
- Mumbai | Business Hours: 15 outages
- Delhi NCR | Business Hours: 8 outages
- Bangalore | Business Hours: 5 outages

**Business Insights**:

**1. Regional Patterns**:
- **High outages in one region**: Regional infrastructure issue
- **Evenly distributed**: Random failures, no pattern
- **Concentrated**: Possible vendor or provider issue

**2. Time Patterns** (when real time data available):
- **Business hours**: Higher impact (customers working)
- **After hours**: Lower impact (less usage)
- **Weekends**: Maintenance windows

**3. Root Cause Hints**:
- **Same region, same time**: Possible scheduled maintenance
- **Multiple regions, same time**: National infrastructure issue
- **Random pattern**: Individual link failures

**Operational Use**:

**Daily Operations**:
- **Identify hotspots**: Which regions have most outages?
- **Dispatch planning**: Send field teams to high-outage regions
- **Customer communication**: Proactive notification for affected regions

**Strategic Analysis**:
- **Vendor performance**: Compare outage rates by region/vendor
- **Infrastructure investment**: Upgrade high-outage regions
- **SLA compliance**: Track outages by region for SLA reporting

**Future Enhancements**:
- **Real time correlation**: Use actual timestamps
- **Business hours detection**: Categorize as business hours vs. after hours
- **Day of week**: Identify weekend vs. weekday patterns
- **Holiday correlation**: Track outages during holidays

**Red Flags**:
- **One region >50% of outages**: Major regional problem
- **All outages in business hours**: High customer impact
- **Recurring pattern**: Same region/time every day (chronic issue)

---

### 5. SNMP Polling Exceptions

**Purpose**: List devices reachable via ping but not responding to SNMP  
**Business Value**: Identify and fix SNMP monitoring issues

**Data Source**: **Nodes** sheet

**Data Flow**:
```
For each node (device):
  1. Check if Ping is UP:
     - pingStatus = "UP" OR status = "UP"
  
  2. Check if SNMP is DOWN:
     - snmpStatus is empty/null
     - OR snmpStatus = "DOWN"
     - OR scanType doesn't include "SNMP"
  
  3. If Ping UP AND SNMP DOWN:
     a. Add to exceptions list
     b. Extract: deviceName, loopbackIP, scanType, probableCause
     c. Determine Reason:
        - If scanType includes "ICMP" → "Configured for ICMP Only"
        - Else → "SNMP Timeout"
     d. Set Status: "Partial Polling"
  
  4. Take first 15 devices
  5. Create table
```

**Output**: Table with columns:
- **Device**: Device name
- **IP**: Loopback IP address
- **Scan**: Scan type (ICMP, SNMP, etc.)
- **Reason**: Why SNMP is failing
- **Status**: Always "Partial Polling"

**Reason Categories**:

**1. "Configured for ICMP Only"**:
- **Meaning**: Device was intentionally configured for ping-only monitoring
- **Root Cause**: Design decision (simple device, no SNMP support)
- **Action**: Evaluate if SNMP should be enabled
- **Priority**: Low (intentional configuration)

**2. "SNMP Timeout"**:
- **Meaning**: SNMP was configured but is not responding
- **Root Cause**: SNMP service down, wrong credentials, firewall
- **Action**: Troubleshoot and fix SNMP
- **Priority**: High (broken monitoring)

**Business Insights**:

**1. Monitoring Gaps**:
- **Each device in this table**: Missing performance metrics
- **Impact**: Cannot measure bandwidth, errors, CPU, memory
- **Risk**: Issues may go undetected until failure

**2. Troubleshooting Priorities**:
- **"SNMP Timeout"**: Fix immediately (broken monitoring)
- **"Configured for ICMP Only"**: Evaluate if upgrade needed

**3. Device Categories**:
- **Simple devices**: Printers, IoT (ICMP only acceptable)
- **Network devices**: Routers, switches (SNMP required)
- **Servers**: Should have SNMP for performance monitoring

**Example Table**:
| Device | IP | Scan | Reason | Status |
|--------|----|----|--------|--------|
| Router-MUM-01 | 10.1.1.1 | ICMP | SNMP Timeout | Partial Polling |
| Switch-DEL-05 | 10.2.2.5 | ICMP | Configured for ICMP Only | Partial Polling |
| FW-BLR-03 | 10.3.3.3 | ICMP | SNMP Timeout | Partial Polling |

**Operational Use**:

**Daily Operations**:
1. **Review table**: Check for new entries
2. **Categorize**: "SNMP Timeout" vs. "ICMP Only"
3. **Create tickets**: Fix SNMP Timeout devices
4. **Track progress**: Monitor table size (should decrease)

**Troubleshooting Steps**:

**For "SNMP Timeout" devices**:
1. **Test connectivity**: `snmpwalk -v2c -c public <IP>`
2. **Check service**: Verify SNMP service running on device
3. **Verify credentials**: Correct community string or v3 credentials
4. **Check firewall**: Ensure UDP 161/162 allowed
5. **Device health**: Check if device CPU/memory is high

**For "ICMP Only" devices**:
1. **Evaluate need**: Does this device need SNMP?
2. **Device capability**: Does device support SNMP?
3. **Cost-benefit**: Is SNMP worth the effort for this device?
4. **Decision**: Enable SNMP or accept ICMP-only

**Red Flags**:
- **>15 devices** (table full): Widespread SNMP issues
- **Critical devices** (routers, core switches): High priority to fix
- **All "SNMP Timeout"**: Systematic issue (credentials, firewall)
- **Same devices daily**: Chronic issues not being fixed

---

## 🎯 Quick Reference: Column Mapping

### Links Sheet Columns Used

| Column Name | Used By Plots | Data Type | Example Values | Description |
|-------------|---------------|-----------|----------------|-------------|
| `addedDate` | 1 | String/Date | "2023-10-15", "Oct 23", "2024-01-01" | Date when link was added to network |
| `linkStatus` | 4 | String | "UP", "DOWN" | Current operational status |
| `region` | 4 | String | "Mumbai", "Delhi NCR", "Bangalore" | Geographic region |
| `utilization` | 3 | Number | 0, 45, 78, 95 (percentage) | Link utilization percentage |

### Nodes Sheet Columns Used

| Column Name | Used By Plots | Data Type | Example Values | Description |
|-------------|---------------|-----------|----------------|-------------|
| `snmpStatus` | 2, 3, 5 | String | "UP", "DOWN" | SNMP polling status |
| `pingStatus` | 2, 3, 5 | String | "UP", "DOWN" | ICMP ping status |
| `status` | 5 | String | "UP", "DOWN" | General device status |
| `scanType` | 5 | String | "SNMP", "ICMP", "SNMP+ICMP" | Discovery/scan method |
| `deviceName` | 5 | String | "Router-MUM-01", "Switch-DEL-05" | Device hostname |
| `loopbackIP` | 5 | String | "10.1.1.1", "192.168.1.1" | Device IP address |
| `probableCause` | 5 | String | "SNMP Timeout", "Firewall Block" | Reason for issue (if available) |

---

## 📊 Chart Type Summary

| Chart Type | Plots Using It | Characteristics |
|------------|----------------|-----------------|
| **Bar Chart** | Link Growth Trends, Outage Correlation | Shows counts/values as bars, time-series or categorical |
| **Donut Chart** | Polling Protocols | Shows percentage distribution with center hole |
| **Table** | Resource Polling Status, SNMP Polling Exceptions | Lists detailed data with multiple columns |

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
    - Plot 1, 4: Use Links data
    - Plot 2, 3, 5: Use Nodes data (Plot 3 also uses Links)
    ↓
Filtering & Grouping
    ↓
Sorting & Limiting
    ↓
Chart/Table Rendering
```

---

## ⚠️ Important Notes

### Data Source Distinction
- **Plots 1, 4**: Use **Links** sheet
- **Plots 2, 5**: Use **Nodes** sheet
- **Plot 3**: Uses **both** Nodes and Links sheets

### Mock Data Fallback
- **Link Growth Trends**: If no `addedDate` column exists, shows mock data (Oct-Jan)
- This allows the plot to render even without historical data

### Time Context (Mocked)
- **Outage Correlation**: Currently appends " | Business Hours" to all outages
- Future enhancement: Use real timestamps for accurate time correlation

### Top N Filtering
- **Link Growth Trends**: Last 6 time periods
- **SNMP Polling Exceptions**: First 15 devices

### Default Values
- **addedDate**: Empty → "Unknown"
- **deviceName**: Empty → "Unknown"
- **loopbackIP**: Empty → "N/A"
- **scanType**: Empty → "ICMP"

---

## 📈 Healthy Targets

| Plot | Healthy Range | Red Flag |
|------|---------------|----------|
| Link Growth Trends | Consistent positive growth (5-15% monthly) | Negative growth OR volatile swings |
| Polling Protocols | SNMP >70%, No Polling <10% | SNMP <50% OR No Polling >20% |
| Resource Polling Status | Gap <10% for all resources | Gap >30% for any resource |
| Outage Correlation | Evenly distributed, <5% of total links | One region >50% of outages |
| SNMP Polling Exceptions | <15 devices (<5% of total) | Table full (15+) OR critical devices listed |

---

## 🛠️ Troubleshooting Guide

### If a plot shows unexpected data:

1. **Check Data Source**
   - Verify correct sheet uploaded (Nodes vs. Links)
   - Plot 3 requires **both** sheets

2. **Check Column Names**
   - **Links**: `addedDate`, `linkStatus`, `region`, `utilization`
   - **Nodes**: `snmpStatus`, `pingStatus`, `status`, `scanType`, `deviceName`, `loopbackIP`, `probableCause`

3. **Check Data Values**
   - **Status fields**: Must be "UP" or "DOWN" (case-insensitive)
   - **addedDate**: Should be consistent format (YYYY-MM-DD or "Mon YY")
   - **utilization**: Should be numeric (0-100)

4. **Check for Empty Values**
   - Empty dates show as "Unknown"
   - Empty device names show as "Unknown"
   - Empty IPs show as "N/A"

5. **Validate Mock Data**
   - If Link Growth Trends shows "Oct 23, Nov 23, Dec 23, Jan 24", it's using mock data
   - Add `addedDate` column to see real data

---

## 💼 Business Use Cases

### Use Case 1: Growth Forecasting
**Plots Used**: Link Growth Trends

**Scenario**: Planning next year's budget and resource needs.

**Current Data** (last 6 months):
- Jul 23: 800 links
- Aug 23: 850 links (+6.25%)
- Sep 23: 900 links (+5.88%)
- Oct 23: 960 links (+6.67%)
- Nov 23: 1020 links (+6.25%)
- Dec 23: 1090 links (+6.86%)

**Analysis**:
- **Average growth**: ~6.3% per month
- **Annualized growth**: ~100% (doubling every year)
- **Projection**: 2000+ links by end of next year

**Resource Planning**:
1. **NOC Staff**: Need to double team size (10 → 20 engineers)
2. **Monitoring Capacity**: Upgrade monitoring servers
3. **Budget**: $5M for infrastructure, $3M for staff

---

### Use Case 2: Monitoring Coverage Improvement
**Plots Used**: Polling Protocols, Resource Polling Status, SNMP Polling Exceptions

**Scenario**: Improving monitoring coverage from 60% to 90%.

**Current State**:
- Polling Protocols: SNMP 60%, ICMP 30%, No Polling 10%
- Resource Polling Status: SNMP gap 300 devices (40%)
- SNMP Polling Exceptions: 15 devices (table full)

**90-Day Improvement Plan**:

**Month 1** (Fix Exceptions):
- Fix all 15 devices in SNMP Polling Exceptions table
- Target: Reduce exceptions to <5 devices
- Result: SNMP coverage 60% → 65%

**Month 2** (Enable SNMP on ICMP devices):
- Identify top 100 ICMP-only devices
- Enable SNMP on 50 devices
- Target: SNMP coverage 65% → 72%

**Month 3** (Enable monitoring on unmonitored devices):
- Identify all "No Polling" devices
- Enable at least ICMP on all
- Enable SNMP on critical devices
- Target: SNMP coverage 72% → 80%, No Polling 10% → 2%

**Final Result**:
- Polling Protocols: SNMP 80%, ICMP 18%, No Polling 2%
- Resource Polling Status: SNMP gap 150 devices (20%)
- SNMP Polling Exceptions: 3 devices

---

### Use Case 3: Regional Outage Response
**Plots Used**: Outage Correlation, Resource Polling Status

**Scenario**: Mumbai region experiencing high outage rate.

**Outage Correlation** shows:
- Mumbai | Business Hours: 45 outages (75% of total)
- Delhi NCR | Business Hours: 8 outages
- Bangalore | Business Hours: 7 outages

**Investigation**:
1. **Check Resource Polling Status**: Is monitoring working in Mumbai?
   - SNMP Polling: 95% active (monitoring is working)
   - ICMP Polling: 94% active (monitoring is working)
   - Conclusion: Outages are real, not monitoring failure

2. **Root Cause Analysis**:
   - Check if all outages are same vendor
   - Check if weather-related (monsoon, cyclone)
   - Check if ISP/provider issue

3. **Response**:
   - Dispatch all available field teams to Mumbai
   - Escalate to vendor/ISP
   - Proactive customer communication
   - Executive notification (major incident)

---

**End of Reference Guide**
