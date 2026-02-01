'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Globe, Gift, Heart, Ghost } from 'lucide-react';

const formatCurrency = (val: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(val);

const iconMap: any = {
    'local': <MapPin size={16} className="text-indigo-500" />,
    'global': <Globe size={16} className="text-blue-500" />,
    'china': <Gift size={16} className="text-red-500" />, 
    'love': <Heart size={16} className="text-pink-500" />,
    'halloween': <Ghost size={16} className="text-orange-500" />
};

export default function DashboardChart({ data, loading }: { data: any[], loading: boolean }) {
    return (
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-[450px]">
            <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                    แนวโน้มรายได้ (Revenue Trend)
                </h3>
            </div>
            
            <div className="flex-1 w-full min-h-0 relative">
                {loading ? (
                    <div className="absolute inset-0 bg-slate-50 animate-pulse rounded-2xl"/>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data || []}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            
                            {/* ✅ แก้ไข: เปลี่ยน dataKey="label" -> "date" */}
                            <XAxis 
                                dataKey="date" 
                                axisLine={false}
                                tickLine={false}
                                dy={10} 
                                height={60} 
                                interval={0}
                                tick={(props) => {
                                    const { x, y, payload, index } = props;
                                    const item = data?.[index];
                                    const holidayParts = item?.holiday ? item.holiday.split('|') : null;
                                    const holidayType = holidayParts?.[0];

                                    return (
                                        <g transform={`translate(${x},${y})`}>
                                            {holidayType && iconMap[holidayType] && (
                                                <g transform="translate(-8, -38)">
                                                    {iconMap[holidayType]}
                                                </g>
                                            )}
                                            <text 
                                                x={0} y={0} dy={16} 
                                                textAnchor="middle" 
                                                fill={holidayType ? '#F59E0B' : '#94A3B8'} 
                                                fontSize={10} 
                                                fontWeight={holidayType ? 700 : 500} 
                                            >
                                                {payload.value}
                                            </text>
                                        </g>
                                    );
                                }}
                            />
                            
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 500}} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                            
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const d = payload[0].payload;
                                        const holidayParts = d.holiday ? d.holiday.split('|') : null;
                                        const holidayType = holidayParts?.[0];
                                        const holidayName = holidayParts?.[1];

                                        return (
                                            <div className="bg-[#1E293B] rounded-xl border border-slate-700 shadow-2xl p-4 min-w-[180px] backdrop-blur-sm bg-opacity-95">
                                                <p className="text-slate-400 text-xs font-medium mb-1">{d.date}</p>
                                                {/* ✅ แก้ไข: ดึงค่าจาก d.value */}
                                                <p className="text-white text-lg font-black tracking-tight flex items-baseline gap-1">{formatCurrency(Number(d.value))}</p>
                                                
                                                {holidayType && holidayName && iconMap[holidayType] && (
                                                    <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                                        {iconMap[holidayType]}
                                                        <span className="text-amber-400 text-sm font-bold leading-tight">{holidayName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            
                            {/* ✅ แก้ไข: เปลี่ยน dataKey="total_revenue" -> "value" และลบ strokeWidth ซ้ำ */}
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#6366F1" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorSales)" 
                                activeDot={{ r: 6, fill: '#4338CA', stroke: '#fff', strokeWidth: 2 }} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}