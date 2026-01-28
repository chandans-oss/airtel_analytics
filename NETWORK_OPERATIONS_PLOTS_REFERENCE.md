# Network Operations Module - Plot Reference Guide

**Module**: Network Operations  
**Source**: Airtel Analytics Dashboard  
**Last Updated**: 2026-01-28

---

## 📊 Complete Plot Reference Table

| # | Plot Name | Chart Type | Excel Sheet | Columns Used | Logic Description | What It Shows |
|---|-----------|------------|-------------|--------------|-------------------|---------------|
| 1 | **Ping & SNMP Status** | Donut Chart | Links | `pingStatus`, `linkStatus`, `linkState`, `reachabilityStatus`, `snmpStatus`, `scanType` | Checks ping status (UP if any of: pingStatus=UP, linkStatus=UP, linkState=UP, reachabilityStatus=REACHABLE). Checks SNMP status independently (UP if: snmpStatus=UP OR scanType includes "SNMP" AND linkStatus=UP). Creates 4 categories based on both statuses. | Distribution of links by dual-layer reachability: Ping UP/SNMP UP (fully reachable), Ping UP/SNMP DOWN (partial monitoring), Ping DOWN/SNMP UP (unusual case), Ping DOWN/SNMP DOWN (unreachable) |
| 2 | **Monitoring Coverage** | Donut Chart | Links | `PROACTIVE_MONITORING`, `PING`, `MONITOR_VIA_LINK` | If PROACTIVE_MONITORING="Yes" → Maintenance Mode. Else, check if PING="Yes" OR MONITOR_VIA_LINK="Yes" → Monitored. Otherwise → Maintenance Mode. | Percentage of links actively monitored vs. in maintenance mode (excluded from monitoring) |
| 3 | **SNMP Versions** | Bar Chart | Links | `SNMP_VERSION` | Groups links by SNMP_VERSION column value. If empty/null, labeled as "No SNMP". | Distribution of SNMP protocol versions (v1, v2c, v3) showing security posture |
| 4 | **Polling Issues** | Table | Links | `pingStatus`, `linkStatus`, `snmpStatus`, `scanType`, `linkId`, `lsi` | Filters links where: (pingStatus=UP OR linkStatus=UP) AND (snmpStatus=DOWN OR scanType doesn't include "SNMP"). Shows first 15 matches. | List of specific links that respond to ping but not SNMP, indicating monitoring problems |
| 5 | **Redundancy Split** | Bar Chart | Links | `PRIMARY_OR_SECONDARY`, `primarySecondary` | Checks PRIMARY_OR_SECONDARY (or primarySecondary fallback). If contains "primary" → Primary. If contains "secondary" → Secondary. Else → Single-Homed. | Distribution of links by redundancy role: Primary (main links), Secondary (backup links), Single-Homed (no backup) |
| 6 | **Discovery Success** | Bar Chart | Links | `LAST_STATUS_CODE` | Checks LAST_STATUS_CODE column. If value="200" → Success. Any other value → Failure. Empty/null defaults to "200". | Success rate of automated device discovery process |
| 7 | **Single Homed Sites** | Table | Links | `PRIMARY_OR_SECONDARY`, `primarySecondary`, `siteName`, `linkId`, `lsi` | Filters links where PRIMARY_OR_SECONDARY doesn't contain "primary" or "secondary". Shows first 15 sites. | List of sites with no backup connection (single point of failure risk) |

---

## 📋 Detailed Plot Specifications

### 1. Ping & SNMP Status

**Purpose**: Assess dual-layer network reachability  
**Business Value**: Identify monitoring blind spots and complete outages

**Data Flow**:
```
For each link:
  1. Check Ping Status:
     - pingStatus = "UP" → Ping UP
     - OR linkStatus = "UP" → Ping UP
     - OR linkState = "UP" → Ping UP
     - OR reachabilityStatus = "REACHABLE" → Ping UP
     - Else → Ping DOWN
  
  2. Check SNMP Status:
     - snmpStatus = "UP" → SNMP UP
     - OR (scanType includes "SNMP" AND linkStatus = "UP") → SNMP UP
     - Else → SNMP DOWN
  
  3. Categorize:
     - Ping UP + SNMP UP → "Ping UP / SNMP UP" (Green)
     - Ping UP + SNMP DOWN → "Ping UP / SNMP DOWN" (Orange)
     - Ping DOWN + SNMP UP → "Ping DOWN / SNMP UP" (Purple)
     - Ping DOWN + SNMP DOWN → "Ping DOWN / SNMP DOWN" (Red)
```

**Output**: Donut chart with up to 4 slices (empty categories filtered out)

---

### 2. Monitoring Coverage

**Purpose**: Show percentage of network under active monitoring  
**Business Value**: Identify links excluded from monitoring (maintenance mode)

**Data Flow**:
```
For each link:
  1. Check if in Maintenance:
     - PROACTIVE_MONITORING = "Yes" → Maintenance Mode
  
  2. If NOT in Maintenance, check monitoring:
     - PING = "Yes" → Monitored
     - OR MONITOR_VIA_LINK = "Yes" → Monitored
     - Else → Maintenance Mode
  
  3. Count:
     - Monitored (Green)
     - Maintenance Mode (Orange)
```

**Output**: Donut chart with 2 slices

**Important Note**: PROACTIVE_MONITORING="Yes" means the link is in MAINTENANCE MODE (excluded from monitoring), not actively monitored.

---

### 3. SNMP Versions

**Purpose**: Show distribution of SNMP protocol versions  
**Business Value**: Assess security posture and plan v3 migration

**Data Flow**:
```
For each link:
  1. Read SNMP_VERSION column
  2. If empty/null → "No SNMP"
  3. Group by version value
  4. Count per version
```

**Common Values**:
- `v1`, `SNMPv1` → Version 1 (insecure)
- `v2c`, `SNMPv2c` → Version 2c (limited security)
- `v3`, `SNMPv3` → Version 3 (secure)
- Empty → "No SNMP"

**Output**: Bar chart with one bar per version

---

### 4. Polling Issues

**Purpose**: List specific links with monitoring problems  
**Business Value**: Troubleshoot and fix SNMP failures

**Data Flow**:
```
For each link:
  1. Check if Ping is UP:
     - pingStatus = "UP" OR linkStatus = "UP"
  
  2. Check if SNMP is DOWN:
     - snmpStatus = "DOWN"
     - OR (scanType doesn't include "SNMP" AND Ping is UP)
  
  3. If Ping UP AND SNMP DOWN:
     - Add to issues list
     - Determine issue type:
       * scanType doesn't include "SNMP" → "ICMP Only Discovery"
       * scanType includes "SNMP" → "SNMP Polling Timeout"
  
  4. Take first 15 links
```

**Output**: Table with columns:
- Circuit (linkId or lsi)
- Status (e.g., "UP/DOWN")
- Issue ("ICMP Only Discovery" or "SNMP Polling Timeout")
- Severity (always "MAJOR")

---

### 5. Redundancy Split

**Purpose**: Show distribution of primary, secondary, and single-homed links  
**Business Value**: Assess network resilience and identify vulnerable sites

**Data Flow**:
```
For each link:
  1. Read PRIMARY_OR_SECONDARY (or primarySecondary fallback)
  2. Categorize:
     - Contains "primary" (case-insensitive) → Primary
     - Contains "secondary" (case-insensitive) → Secondary
     - Empty or other value → Single-Homed
  3. Count each category
```

**Output**: Bar chart with 3 bars:
- Primary (Blue)
- Secondary (Green)
- Single-Homed (Orange)

---

### 6. Discovery Success

**Purpose**: Show reliability of automated device discovery  
**Business Value**: Identify devices missing from inventory

**Data Flow**:
```
For each link:
  1. Read LAST_STATUS_CODE column
  2. If empty/null → default to "200"
  3. Categorize:
     - Value = "200" → Success
     - Any other value → Failure
  4. Count each category
```

**Common Status Codes**:
- `200` → Success (HTTP OK)
- `404` → Not Found
- `401` → Unauthorized
- `403` → Forbidden
- `500` → Internal Error
- `timeout` → Timeout
- `unreachable` → Unreachable

**Output**: Bar chart with 2 bars:
- Success (Green)
- Failure (Red)

---

### 7. Single Homed Sites

**Purpose**: List sites without backup connections  
**Business Value**: Identify high-risk sites for redundancy planning

**Data Flow**:
```
For each link:
  1. Read PRIMARY_OR_SECONDARY (or primarySecondary fallback)
  2. Filter where:
     - Does NOT contain "primary" (case-insensitive)
     - AND does NOT contain "secondary" (case-insensitive)
  3. Take first 15 sites
```

**Output**: Table with columns:
- SiteName (from siteName column)
- LSI (from linkId or lsi column)
- Risk (always "Single Homed")

---

## 🎯 Quick Reference: Column Mapping

### Links Sheet Columns Used

| Column Name | Used By Plots | Data Type | Example Values |
|-------------|---------------|-----------|----------------|
| `pingStatus` | 1, 4 | String | "UP", "DOWN" |
| `linkStatus` | 1, 4 | String | "UP", "DOWN" |
| `linkState` | 1 | String | "UP", "DOWN" |
| `reachabilityStatus` | 1 | String | "REACHABLE", "UNREACHABLE" |
| `snmpStatus` | 1, 4 | String | "UP", "DOWN" |
| `scanType` | 1, 4 | String | "SNMP", "ICMP", "SNMP+ICMP" |
| `PROACTIVE_MONITORING` | 2 | String | "Yes", "No" |
| `PING` | 2 | String | "Yes", "No" |
| `MONITOR_VIA_LINK` | 2 | String | "Yes", "No" |
| `SNMP_VERSION` | 3 | String | "v1", "v2c", "v3", "SNMPv1", "SNMPv2c", "SNMPv3" |
| `PRIMARY_OR_SECONDARY` | 5, 7 | String | "Primary", "Secondary", "" |
| `primarySecondary` | 5, 7 | String | "Primary", "Secondary", "" |
| `LAST_STATUS_CODE` | 6 | String | "200", "404", "401", "500", "timeout" |
| `linkId` | 4, 7 | String | "LSI-12345", "CKT-001" |
| `lsi` | 4, 7 | String | "LSI-12345" |
| `siteName` | 7 | String | "Mumbai DC", "Delhi Branch" |

---

## 📊 Chart Type Summary

| Chart Type | Plots Using It | Characteristics |
|------------|----------------|-----------------|
| **Donut Chart** | Ping & SNMP Status, Monitoring Coverage | Shows percentage distribution, center hole for aesthetics |
| **Bar Chart** | SNMP Versions, Redundancy Split, Discovery Success | Shows counts/values as horizontal or vertical bars |
| **Table** | Polling Issues, Single Homed Sites | Lists specific items with multiple columns, limited to 15 rows |

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
Chart/Table Rendering
    ↓
User Interaction (right-click, export)
```

---

## ⚠️ Important Notes

### Maintenance Mode Logic
- `PROACTIVE_MONITORING = "Yes"` means the link is **IN MAINTENANCE** (not monitored)
- This is the **opposite** of the standard interpretation
- Links in maintenance mode are excluded from active monitoring

### Fallback Columns
- Many plots check multiple columns in priority order
- If primary column is empty, fallback column is used
- Example: `PRIMARY_OR_SECONDARY` → `primarySecondary`

### Case Sensitivity
- All string comparisons use `.toLowerCase()` or `.toUpperCase()`
- Ensures "Primary", "primary", "PRIMARY" all match

### Default Values
- Empty/null values often have defaults
- Example: `LAST_STATUS_CODE` defaults to "200" if empty
- Example: `PRIMARY_OR_SECONDARY` defaults to "Single-Homed" if empty

---

## 📈 Healthy Targets

| Plot | Healthy Range | Red Flag |
|------|---------------|----------|
| Ping & SNMP Status | >80% "Ping UP / SNMP UP" | >20% "Ping DOWN / SNMP DOWN" |
| Monitoring Coverage | >85% Monitored | >30% Maintenance Mode |
| SNMP Versions | >90% SNMPv3 | >30% SNMPv1/v2c |
| Polling Issues | <15 links (<5%) | >30 links (>10%) |
| Redundancy Split | Primary:Secondary ~1:1 | >30% Single-Homed |
| Discovery Success | >90% Success | <80% Success |
| Single Homed Sites | <15 sites (<10%) | >30 sites (>30%) |

---

## 🛠️ Troubleshooting Guide

### If a plot shows unexpected data:

1. **Check Excel Column Names**
   - Verify column names match exactly (case-sensitive in Excel)
   - Check for typos or extra spaces

2. **Check Data Values**
   - Verify values match expected format (e.g., "UP" not "up")
   - Check for empty cells vs. actual values

3. **Check Data Type**
   - Ensure text columns don't have numbers
   - Ensure no special characters

4. **Check Upload**
   - Verify correct sheet was uploaded
   - Check if data was parsed correctly in browser console

---

**End of Reference Guide**
