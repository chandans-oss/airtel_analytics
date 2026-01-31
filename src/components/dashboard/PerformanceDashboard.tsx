import React, { useMemo } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Activity,
    Server,
    Download,
    Cpu,
    Zap,
    Network,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ChevronLeft,
    Router,
    Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    Cell, CartesianGrid, Legend, PieChart, Pie, LabelList
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

// --- MOCK DATA FROM USER ---
const PERFORMANCE_MOCK_DATA = [
    { loopback_ip: '172.21.112.222', wan_ip: '172.28.144.42', device_type: 'Switch', region: 'North', make: 'Dell', bgp_config: 0, bgp_status: 'Not Configured', qos_config: 0, qos_res: 'Yes', loopback_snmp: 100, loopback_ping: 99, wan_snmp: 100, wan_ping: 100, cpu: 29, mem: 86 },
    { loopback_ip: '172.22.36.109', wan_ip: '172.30.124.224', device_type: 'Switch', region: 'South', make: 'Dell', bgp_config: 0, bgp_status: 'Up', qos_config: 0, qos_res: 'Yes', loopback_snmp: 0, loopback_ping: 0, wan_snmp: 95, wan_ping: 100, cpu: 75, mem: 32 },
    { loopback_ip: '172.31.212.172', wan_ip: '172.25.76.244', device_type: 'Switch', region: 'East', make: 'Huawei', bgp_config: 1, bgp_status: 'Not Configured', qos_config: 1, qos_res: 'Yes', loopback_snmp: 100, loopback_ping: 99, wan_snmp: 95, wan_ping: 95, cpu: 31, mem: 68 },
    { loopback_ip: '172.21.137.150', wan_ip: '172.31.245.189', device_type: 'Router', region: 'West', make: 'Cisco', bgp_config: 0, bgp_status: 'Up', qos_config: 1, qos_res: 'Yes', loopback_snmp: 100, loopback_ping: 100, wan_snmp: 99, wan_ping: 99, cpu: 59, mem: 58 },
    { loopback_ip: '172.17.105.55', wan_ip: '172.25.194.192', device_type: 'Switch', region: 'North', make: 'Aruba', bgp_config: 1, bgp_status: 'Up', qos_config: 1, qos_res: 'Yes', loopback_snmp: 100, loopback_ping: 100, wan_snmp: 100, wan_ping: 95, cpu: 62, mem: 69 },
    { loopback_ip: '172.24.130.175', wan_ip: '172.18.170.126', device_type: 'Router', region: 'South', make: 'Palo Alto', bgp_config: 1, bgp_status: 'Up', qos_config: 1, qos_res: 'Yes', loopback_snmp: 0, loopback_ping: 100, wan_snmp: 98, wan_ping: 100, cpu: 50, mem: 70 },
    { loopback_ip: '172.31.237.118', wan_ip: '172.28.91.2', device_type: 'Switch', region: 'East', make: 'Fortinet', bgp_config: 1, bgp_status: 'Up', qos_config: 1, qos_res: 'Yes', loopback_snmp: 100, loopback_ping: 100, wan_snmp: 100, wan_ping: 99, cpu: 79, mem: 67 },
    { loopback_ip: '172.18.120.106', wan_ip: '172.21.171.225', device_type: 'Router', region: 'West', make: 'Mikrotik', bgp_config: 1, bgp_status: 'Up', qos_config: 0, qos_res: 'Yes', loopback_snmp: 100, loopback_ping: 100, wan_snmp: 100, wan_ping: 99, cpu: 17, mem: 88 },
    { loopback_ip: '172.28.216.147', wan_ip: '172.23.102.142', device_type: 'Router', region: 'North', make: 'Dell', bgp_config: 1, bgp_status: 'Up', qos_config: 1, qos_res: 'Yes', loopback_snmp: 99, loopback_ping: 99, wan_snmp: 100, wan_ping: 100, cpu: 54, mem: 58 },
    { loopback_ip: '172.31.79.113', wan_ip: '172.21.155.179', device_type: 'Router', region: 'South', make: 'Huawei', bgp_config: 1, bgp_status: 'Not Configured', qos_config: 1, qos_res: 'Yes', loopback_snmp: 98, loopback_ping: 98, wan_snmp: 98, wan_ping: 99, cpu: 57, mem: 33 },
    { loopback_ip: '172.17.31.34', wan_ip: '172.21.223.32', device_type: 'Switch', region: 'East', make: 'Huawei', bgp_config: 1, bgp_status: 'Not Configured', qos_config: 1, qos_res: 'Yes', loopback_snmp: 98, loopback_ping: 99, wan_snmp: 98, wan_ping: 100, cpu: 62, mem: 33 },
    { loopback_ip: '172.18.24.197', wan_ip: '172.19.19.79', device_type: 'Switch', region: 'West', make: 'Cisco', bgp_config: 1, bgp_status: 'Up', qos_config: 1, qos_res: 'No', loopback_snmp: 100, loopback_ping: 98, wan_snmp: 0, wan_ping: 98, cpu: 52, mem: 71 },
    { loopback_ip: '172.22.189.38', wan_ip: '172.25.220.151', device_type: 'Router', region: 'North', make: 'Cisco', bgp_config: 0, bgp_status: 'Up', qos_config: 1, qos_res: 'No', loopback_snmp: 0, loopback_ping: 100, wan_snmp: 99, wan_ping: 99, cpu: 82, mem: 61 },
    { loopback_ip: '172.20.224.10', wan_ip: '172.25.9.37', device_type: 'Switch', region: 'East', make: 'Mikrotik', bgp_config: 0, bgp_status: 'Down', qos_config: 1, qos_res: 'Yes', loopback_snmp: 100, loopback_ping: 100, wan_snmp: 100, wan_ping: 98, cpu: 57, mem: 61 },
    { loopback_ip: '172.31.166.67', wan_ip: '172.29.174.106', device_type: 'Switch', region: 'West', make: 'Palo Alto', bgp_config: 1, bgp_status: 'Down', qos_config: 1, qos_res: 'No', loopback_snmp: 0, loopback_ping: 99, wan_snmp: 0, wan_ping: 100, cpu: 70, mem: 35 },
    { loopback_ip: '172.27.223.92', wan_ip: '172.29.221.208', device_type: 'Router', region: 'North', make: 'Fortinet', bgp_config: 1, bgp_status: 'Down', qos_config: 1, qos_res: 'Yes', loopback_snmp: 100, loopback_ping: 99, wan_snmp: 98, wan_ping: 0, cpu: 85, mem: 72 },
    { loopback_ip: '172.21.114.175', wan_ip: '172.29.146.22', device_type: 'Router', region: 'South', make: 'Huawei', bgp_config: 1, bgp_status: 'Not Configured', qos_config: 1, qos_res: 'Yes', loopback_snmp: 100, loopback_ping: 0, wan_snmp: 100, wan_ping: 100, cpu: 40, mem: 39 },
    { loopback_ip: '172.16.246.143', wan_ip: '172.17.18.85', device_type: 'Router', region: 'North', make: 'Dell', bgp_config: 0, bgp_status: 'Down', qos_config: 0, qos_res: 'Yes', loopback_snmp: 99, loopback_ping: 0, wan_snmp: 100, wan_ping: 100, cpu: 62, mem: 37 }
];

export function PerformanceDashboard() {
    const { setSelectedModule } = useInventoryStore();

    // --- Aggregated Stats ---
    const stats = useMemo(() => {
        // BGP
        const bgpTotal = PERFORMANCE_MOCK_DATA.filter(d => d.bgp_config === 1).length;
        const bgpUp = PERFORMANCE_MOCK_DATA.filter(d => d.bgp_config === 1 && d.bgp_status === 'Up').length;
        const bgpDown = PERFORMANCE_MOCK_DATA.filter(d => d.bgp_config === 1 && d.bgp_status === 'Down').length;

        // QoS
        const qosTotal = PERFORMANCE_MOCK_DATA.filter(d => d.qos_config === 1).length;
        const qosActive = PERFORMANCE_MOCK_DATA.filter(d => d.qos_config === 1 && d.qos_res === 'Yes').length;

        // Reachability (Loopback SNMP)
        const snmpPolling = PERFORMANCE_MOCK_DATA.filter(d => d.loopback_snmp > 0).length;
        const snmpFails = PERFORMANCE_MOCK_DATA.filter(d => d.loopback_snmp === 0).length;

        return {
            bgp: [
                { name: 'Configured', value: bgpTotal, fill: '#3b82f6' },
                { name: 'Up', value: bgpUp, fill: '#22c55e' },
                { name: 'Down', value: bgpDown, fill: '#ef4444' }
            ],
            qos: [
                { name: 'Configured', value: qosTotal, fill: '#8b5cf6' },
                { name: 'Active Polling', value: qosActive, fill: '#10b981' },
                { name: 'Not Polling', value: qosTotal - qosActive, fill: '#f59e0b' }
            ],
            reachability: [
                { name: 'Polling OK', value: snmpPolling, fill: '#14b8a6' },
                { name: 'No SNMP', value: snmpFails, fill: '#ef4444' }
            ]
        };
    }, []);

    const deviceMakeData = useMemo(() => {
        const counts: Record<string, number> = {};
        PERFORMANCE_MOCK_DATA.forEach(d => {
            counts[d.make] = (counts[d.make] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, []);

    const deviceTypeData = useMemo(() => {
        const counts: Record<string, number> = {};
        PERFORMANCE_MOCK_DATA.forEach(d => {
            counts[d.device_type] = (counts[d.device_type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, []);

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 px-1 mb-4">
                <button
                    onClick={() => setSelectedModule('unified')}
                    className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center"
                    title="Back to Overview"
                >
                    <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                <div>
                    <h2 className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/90">
                        Performance & Polling Analytics
                    </h2>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                        Device compliance & Protocol Status
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Devices</p>
                        <p className="text-2xl font-black">{PERFORMANCE_MOCK_DATA.length}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Server size={20} /></div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">BGP Compliance</p>
                        <p className="text-2xl font-black">{Math.round((stats.bgp[1].value / (stats.bgp[1].value + stats.bgp[2].value || 1)) * 100)}%</p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Network size={20} /></div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Avg CPU Util</p>
                        <p className="text-2xl font-black">
                            {Math.round(PERFORMANCE_MOCK_DATA.reduce((a, b) => a + b.cpu, 0) / PERFORMANCE_MOCK_DATA.length)}%
                        </p>
                    </div>
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Cpu size={20} /></div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Avg Memory Util</p>
                        <p className="text-2xl font-black">
                            {Math.round(PERFORMANCE_MOCK_DATA.reduce((a, b) => a + b.mem, 0) / PERFORMANCE_MOCK_DATA.length)}%
                        </p>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Activity size={20} /></div>
                </div>
            </div>

            {/* Row 1: Protocol & Reachability Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. BGP Status */}
                <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Network size={14} className="text-blue-500" /> BGP Polling Status
                        </h3>
                        <button onClick={() => exportToCSV(stats.bgp, 'BGP_Brief')} className="text-muted-foreground hover:text-primary"><Download size={14} /></button>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.bgp} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                                    {stats.bgp.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. QoS Polling */}
                <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Zap size={14} className="text-purple-500" /> QoS Configuration
                        </h3>
                        <button onClick={() => exportToCSV(stats.qos, 'QoS_Brief')} className="text-muted-foreground hover:text-primary"><Download size={14} /></button>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.qos} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                                    {stats.qos.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Device Reachability */}
                <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Wifi size={14} className="text-emerald-500" /> Loopback Reachability
                        </h3>
                        <button onClick={() => exportToCSV(stats.reachability, 'Reachability_Brief')} className="text-muted-foreground hover:text-primary"><Download size={14} /></button>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.reachability}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.reachability.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Device Segmentation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Make Distribution */}
                <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Device Make Distribution</h3>
                        <button onClick={() => exportToCSV(deviceMakeData, 'Device_Make_Stats')} className="text-muted-foreground hover:text-primary"><Download size={14} /></button>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deviceMakeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/10%)' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                                    <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Type Breakdown */}
                <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground">Device Type Breakdown</h3>
                        <button onClick={() => exportToCSV(deviceTypeData, 'Device_Type_Stats')} className="text-muted-foreground hover:text-primary"><Download size={14} /></button>
                    </div>
                    <div className="h-[180px] w-full flex items-center justify-center gap-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deviceTypeData}
                                    outerRadius={60}
                                    dataKey="value"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {deviceTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3: Detailed Data Grid */}
            <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Router size={16} className="text-primary" />
                        Detailed Device Polling Statistics
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {PERFORMANCE_MOCK_DATA.length} Records
                        </span>
                        <button
                            onClick={() => exportToCSV(PERFORMANCE_MOCK_DATA, 'Full_Performance_Report')}
                            className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase"
                        >
                            <Download size={12} /> Export Full Report
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto max-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50 text-[9px] uppercase text-muted-foreground font-black tracking-wider sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-3">Device IP</th>
                                <th className="p-3">Region</th>
                                <th className="p-3">Make</th>
                                <th className="p-3 text-center">BGP</th>
                                <th className="p-3 text-center">QoS</th>
                                <th className="p-3 text-center">LB SNMP</th>
                                <th className="p-3 text-center">CPU %</th>
                                <th className="p-3 text-center">Mem %</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-medium text-foreground divide-y divide-border/30">
                            {PERFORMANCE_MOCK_DATA.map((row, idx) => (
                                <tr key={idx} className="hover:bg-muted/50 transition-colors group">
                                    <td className="p-3 font-mono text-primary group-hover:underline cursor-pointer">{row.loopback_ip}</td>
                                    <td className="p-3">{row.region}</td>
                                    <td className="p-3">{row.make}</td>
                                    <td className="p-3 text-center">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                                            row.bgp_status === 'Up' ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                                row.bgp_status === 'Down' ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-muted text-muted-foreground border-transparent"
                                        )}>
                                            {row.bgp_status === 'Not Configured' ? 'N/A' : row.bgp_status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center">
                                            {row.qos_res === 'Yes' ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-muted-foreground/50" />}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={cn("h-full", row.loopback_snmp > 90 ? "bg-emerald-500" : row.loopback_snmp > 50 ? "bg-yellow-500" : "bg-red-500")}
                                                style={{ width: `${row.loopback_snmp}%` }}
                                            />
                                        </div>
                                        <span className="text-[9px] opacity-70">{row.loopback_snmp}%</span>
                                    </td>
                                    <td className="p-3 text-center font-mono">{row.cpu}%</td>
                                    <td className="p-3 text-center font-mono">{row.mem}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
