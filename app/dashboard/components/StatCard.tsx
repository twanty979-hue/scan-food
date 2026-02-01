'use client';

const formatCurrency = (val: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(val);

interface StatCardProps {
    title: string;
    value: number;
    type: 'currency' | 'number';
    unit?: string;
    icon: React.ReactNode;
    color: string;
    subtext: string;
    loading: boolean;
}

export default function StatCard({ title, value, type, unit, icon, color, subtext, loading }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-[28px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-44 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${color} blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            
            <div className="flex justify-between items-start z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${color}`}>
                    {icon}
                </div>
                {loading && <div className="w-4 h-4 bg-slate-200 rounded-full animate-ping"></div>}
            </div>

            <div className="z-10 mt-4">
                <p className="text-sm font-bold text-slate-400 mb-1">{title}</p>
                {loading ? (
                    <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-lg"/>
                ) : (
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                            {type === 'currency' ? formatCurrency(value) : value}
                        </h2>
                        {unit && <span className="text-lg font-bold text-slate-400">{unit}</span>}
                    </div>
                )}
                <p className="text-xs font-medium text-slate-400 mt-2 opacity-80">{subtext}</p>
            </div>
        </div>
    );
}