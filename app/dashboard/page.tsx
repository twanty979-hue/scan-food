'use client';

import { useState, useEffect } from 'react';
import { getDashboardDataAction } from '@/app/actions/dashboardActions';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Import Components
import StatCard from './components/StatCard';
import DashboardChart from './components/DashboardChart';

dayjs.extend(localizedFormat);

// Icons
const IconTrending = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconBill = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const IconAvg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const IconCrown = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>;
const IconCalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconChevronDown = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconChartLine = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>;

export default function DashboardPage() {
    const [viewMode, setViewMode] = useState<string>('month'); 
    const [selectedDate, setSelectedDate] = useState({
        from: dayjs().format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
    });

    const [mobileTab, setMobileTab] = useState<'chart' | 'products'>('chart');
    const [showFilter, setShowFilter] = useState(false);
    const [filterTab, setFilterTab] = useState('month'); 
    const [tempDate, setTempDate] = useState({
        date: dayjs().format('YYYY-MM-DD'),
        month: dayjs().format('YYYY-MM'),
        year: dayjs().year(),
        rangeFrom: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        rangeTo: dayjs().format('YYYY-MM-DD')
    });

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [viewMode, selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        const res = await getDashboardDataAction(viewMode, selectedDate.from, selectedDate.to);
        if (res.success) setData(res);
        setLoading(false);
    };

    const handleConfirmFilter = () => {
        if (filterTab === 'date') {
            setViewMode('today');
            setSelectedDate({ from: tempDate.date, to: tempDate.date });
        } else if (filterTab === 'month') {
            setViewMode('month');
            setSelectedDate({ from: `${tempDate.month}-01`, to: `${tempDate.month}-01` }); 
        } else if (filterTab === 'year') {
            setViewMode('year');
            setSelectedDate({ from: `${tempDate.year}-01-01`, to: `${tempDate.year}-01-01` });
        } else if (filterTab === 'range') {
            setViewMode('custom');
            setSelectedDate({ from: tempDate.rangeFrom, to: tempDate.rangeTo });
        } else if (filterTab === 'all') {
            setViewMode('all');
            setSelectedDate({ from: dayjs().format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD') });
        }
        setShowFilter(false); 
    };

    const RANK_COLORS = ['bg-amber-100 text-amber-700', 'bg-slate-200 text-slate-700', 'bg-orange-100 text-orange-700', 'bg-slate-50 text-slate-500', 'bg-slate-50 text-slate-500'];

    const getDisplayLabel = () => {
        const d = dayjs(selectedDate.from).locale('th');
        // ✅ ปรับรูปแบบวันที่ให้สั้นลง
        if (viewMode === 'all') return 'ทั้งหมด';
        if (viewMode === 'year') return `ปี ${d.format('BBBB')}`;
        if (viewMode === 'month') return `เดือน ${d.format('MMM YY')}`;
        if (viewMode === 'today') return `${d.format('D MMM YY')}`;
        if (viewMode === 'custom') return `${d.format('D MMM')} - ${dayjs(selectedDate.to).locale('th').format('D MMM')}`;
        return 'Overview';
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-3 lg:p-10 font-sans pb-20 lg:pb-10">
            <div className="max-w-7xl mx-auto space-y-4 lg:space-y-8">
                
                {/* Header & Filter */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 lg:bg-transparent lg:shadow-none lg:border-none lg:p-0">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                        <div className="flex justify-between w-full items-center">
                            <div>
                                <h1 className="text-lg lg:text-3xl font-black text-slate-900 tracking-tight">ภาพรวมร้าน</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] lg:text-base text-slate-400 font-medium">ช่วงเวลา:</span>
                                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-[11px] lg:text-base border border-indigo-100 whitespace-nowrap">
                                        {getDisplayLabel()}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="relative z-20">
                                <button onClick={() => setShowFilter(!showFilter)} className="flex items-center justify-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all font-bold text-slate-600 text-xs">
                                    <IconCalendar /><span className="hidden sm:inline">เปลี่ยน</span><IconChevronDown />
                                </button>

                                {showFilter && (
                                    <div className="absolute right-0 top-full mt-2 w-[280px] lg:w-[340px] bg-white rounded-2xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-30">
                                        <div className="flex p-1 bg-slate-100 rounded-lg mb-3">
                                            {['date', 'month', 'year', 'range'].map(tab => (
                                                <button key={tab} onClick={() => setFilterTab(tab)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${filterTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{tab === 'date' ? 'วัน' : tab === 'month' ? 'เดือน' : tab === 'year' ? 'ปี' : 'ช่วง'}</button>
                                            ))}
                                        </div>
                                        <div className="space-y-3">
                                            {filterTab === 'date' && (<div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">เลือกวันที่</label><input type="date" value={tempDate.date} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setTempDate({...tempDate, date: e.target.value})} /></div>)}
                                            {filterTab === 'month' && (<div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">เลือกเดือน</label><input type="month" value={tempDate.month} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setTempDate({...tempDate, month: e.target.value})} /></div>)}
                                            {filterTab === 'year' && (<div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">เลือกปี (ค.ศ.)</label><select value={tempDate.year} onChange={(e) => setTempDate({...tempDate, year: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium">{[0,1,2,3,4,5].map(offset => { const y = dayjs().year() - offset; return <option key={y} value={y}>{y}</option> })}</select></div>)}
                                            {filterTab === 'range' && (<div className="space-y-2"><div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">จากวันที่</label><input type="date" value={tempDate.rangeFrom} onChange={(e) => setTempDate({...tempDate, rangeFrom: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium" /></div><div><label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">ถึงวันที่</label><input type="date" value={tempDate.rangeTo} onChange={(e) => setTempDate({...tempDate, rangeTo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium" /></div></div>)}
                                            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                                                <button onClick={handleConfirmFilter} className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-slate-800 transition-all shadow-md active:scale-95 text-xs">ตกลง / ค้นหา</button>
                                                <button onClick={() => { setFilterTab('all'); setViewMode('all'); setSelectedDate({ from: dayjs().format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD') }); setShowFilter(false); }} className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-indigo-600 py-1">ดูยอดรวมทั้งหมด (All Time)</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <StatCard title="ยอดขาย" value={loading ? 0 : (data?.summary?.totalRevenue || 0)} type="currency" icon={<IconTrending />} color="bg-indigo-600" subtext={getDisplayLabel()} loading={loading} />
                    <StatCard title="ออเดอร์" value={loading ? 0 : (data?.summary?.totalOrders || 0)} type="number" unit="บิล" icon={<IconBill />} color="bg-pink-600" subtext="สำเร็จ" loading={loading} />
                    <div className="col-span-2 lg:col-span-1">
                        <StatCard title="ยอดต่อบิล (AOV)" value={loading ? 0 : ((data?.summary?.totalOrders || 0) > 0 ? ((data?.summary?.totalRevenue || 0) / (data?.summary?.totalOrders || 1)) : 0)} type="currency" icon={<IconAvg />} color="bg-emerald-500" subtext="เฉลี่ยต่อลูกค้า" loading={loading} />
                    </div>
                </div>

                {/* Mobile Tabs Switcher */}
                <div className="lg:hidden bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex">
                    <button onClick={() => setMobileTab('chart')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${mobileTab === 'chart' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><IconChartLine /> กราฟรายได้</button>
                    <button onClick={() => setMobileTab('products')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${mobileTab === 'products' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><IconCrown /> เมนูขายดี</button>
                </div>

                {/* Charts & Products Container */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    
                    {/* ✅✅✅ แก้ส่วนนี้: เอาระบบเลื่อนออก และใช้ DashboardChart ที่แก้แล้ว */}
                    <div className={`${mobileTab === 'chart' ? 'block' : 'hidden'} lg:block lg:col-span-2`}>
                        <DashboardChart data={data?.salesTrend} loading={loading} />
                    </div>

                    {/* Top Products Section */}
                    <div className={`${mobileTab === 'products' ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
                        <div className="bg-white p-5 lg:p-8 rounded-[24px] lg:rounded-[32px] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-[350px] lg:h-[450px]">
                            <h3 className="font-bold text-lg lg:text-xl text-slate-800 mb-4 lg:mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-5 lg:h-6 bg-amber-500 rounded-full"></div>
                                เมนูยอดฮิต Top 5
                            </h3>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 lg:space-y-4 custom-scrollbar">
                                {loading ? ([1,2,3,4,5].map(i => <div key={i} className="h-12 lg:h-14 bg-slate-50 animate-pulse rounded-2xl"/>)) : data?.topProducts.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3"><IconCrown /><span className="text-sm">ยังไม่มีข้อมูลการขาย</span></div>) : (
                                    data?.topProducts.map((p: any, idx: number) => (
                                        <div key={idx} className="group flex items-center gap-3 lg:gap-4 p-2 rounded-xl lg:rounded-2xl hover:bg-slate-50 transition-colors">
                                            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center font-black text-xs lg:text-sm shadow-sm shrink-0 ${RANK_COLORS[idx] || RANK_COLORS[4]}`}>{idx + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1 lg:mb-2">
                                                    <p className="font-bold text-slate-700 truncate text-xs lg:text-sm">{p.name}</p>
                                                    <div className="text-right"><p className="font-black text-slate-900 text-xs lg:text-sm">{p.qty} <span className="text-[10px] lg:text-xs text-slate-400 font-normal">ชิ้น</span></p></div>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 lg:h-2 overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-amber-500' : 'bg-slate-400/70'}`} style={{ width: `${(p.qty / (data?.topProducts[0].qty || 1)) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}