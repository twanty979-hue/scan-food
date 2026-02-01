'use client';

import { useState, useEffect } from 'react';
import { getDashboardDataAction } from '@/app/actions/dashboardActions';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Import Components ที่เราแยกออกมา
import StatCard from './components/StatCard';
import DashboardChart from './components/DashboardChart';

dayjs.extend(localizedFormat);

// Icons
const IconTrending = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconBill = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const IconAvg = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const IconCrown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>;
const IconCalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconChevronDown = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

export default function DashboardPage() {
    const [viewMode, setViewMode] = useState<string>('month'); 
    const [selectedDate, setSelectedDate] = useState({
        from: dayjs().format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD')
    });

    // Filter Logic
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
        if (viewMode === 'all') return 'ทั้งหมด (ตั้งแต่เริ่มใช้งาน)';
        if (viewMode === 'year') return `ปี ${d.format('YYYY')}`;
        if (viewMode === 'month') return `เดือน${d.format('MMMM YYYY')}`;
        if (viewMode === 'today') return `วันที่ ${d.format('D MMMM YYYY')}`;
        if (viewMode === 'custom') return `${dayjs(selectedDate.from).locale('th').format('D MMM')} - ${dayjs(selectedDate.to).locale('th').format('D MMM')}`;
        return 'Overview';
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header & Filter */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview Dashboard</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-500 font-medium">กำลังแสดงข้อมูล:</span>
                            <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-0.5 rounded-lg border border-indigo-100">{getDisplayLabel()}</span>
                        </div>
                    </div>
                    
                    {/* Filter Button */}
                    <div className="relative z-20">
                        <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all font-bold text-slate-700">
                            <IconCalendar /><span>เปลี่ยนช่วงเวลา</span><IconChevronDown />
                        </button>

                        {showFilter && (
                            <div className="absolute right-0 top-full mt-3 w-[340px] bg-white rounded-3xl shadow-xl border border-slate-100 p-5 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
                                    {['date', 'month', 'year', 'range'].map(tab => (
                                        <button key={tab} onClick={() => setFilterTab(tab)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${filterTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{tab === 'date' ? 'วัน' : tab === 'month' ? 'เดือน' : tab === 'year' ? 'ปี' : 'ช่วง'}</button>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    {filterTab === 'date' && (<div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">เลือกวันที่</label><input type="date" value={tempDate.date} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setTempDate({...tempDate, date: e.target.value})} /></div>)}
                                    {filterTab === 'month' && (<div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">เลือกเดือน</label><input type="month" value={tempDate.month} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setTempDate({...tempDate, month: e.target.value})} /></div>)}
                                    {filterTab === 'year' && (<div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">เลือกปี (ค.ศ.)</label><select value={tempDate.year} onChange={(e) => setTempDate({...tempDate, year: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500">{[0,1,2,3,4,5].map(offset => { const y = dayjs().year() - offset; return <option key={y} value={y}>{y}</option> })}</select></div>)}
                                    {filterTab === 'range' && (<div className="space-y-3"><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">จากวันที่</label><input type="date" value={tempDate.rangeFrom} onChange={(e) => setTempDate({...tempDate, rangeFrom: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium" /></div><div><label className="text-xs font-bold text-slate-400 uppercase mb-1 block">ถึงวันที่</label><input type="date" value={tempDate.rangeTo} onChange={(e) => setTempDate({...tempDate, rangeTo: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium" /></div></div>)}
                                    <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                                        <button onClick={handleConfirmFilter} className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95">ตกลง / ค้นหา</button>
                                        <button onClick={() => { setFilterTab('all'); setViewMode('all'); setSelectedDate({ from: dayjs().format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD') }); setShowFilter(false); }} className="w-full text-center text-xs font-bold text-slate-400 hover:text-indigo-600 py-1">ดูยอดรวมทั้งหมด (All Time)</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="ยอดขายรวม" value={loading ? 0 : (data?.summary?.totalRevenue || 0)} type="currency" icon={<IconTrending />} color="bg-indigo-600" subtext={getDisplayLabel()} loading={loading} />
                    <StatCard title="จำนวนออเดอร์" value={loading ? 0 : (data?.summary?.totalOrders || 0)} type="number" unit="บิล" icon={<IconBill />} color="bg-pink-600" subtext="ที่ชำระเงินสำเร็จ" loading={loading} />
                    <StatCard title="ยอดต่อบิลเฉลี่ย (AOV)" value={loading ? 0 : ((data?.summary?.totalOrders || 0) > 0 ? ((data?.summary?.totalRevenue || 0) / (data?.summary?.totalOrders || 1)) : 0)} type="currency" icon={<IconAvg />} color="bg-emerald-500" subtext="รายได้เฉลี่ยต่อลูกค้า 1 ราย" loading={loading} />
                </div>

                {/* Charts & Products */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* ✅ เรียกใช้ Component กราฟที่เราแยกไว้ */}
                    <DashboardChart data={data?.salesTrend} loading={loading} />

                    {/* Top Products */}
                    <div className="bg-white p-8 rounded-[32px] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-[450px]">
                        <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                            เมนูยอดฮิต Top 5
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                            {loading ? ([1,2,3,4,5].map(i => <div key={i} className="h-14 bg-slate-50 animate-pulse rounded-2xl"/>)) : data?.topProducts.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3"><IconCrown /><span className="text-sm">ยังไม่มีข้อมูลการขาย</span></div>) : (
                                data?.topProducts.map((p: any, idx: number) => (
                                    <div key={idx} className="group flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm shrink-0 ${RANK_COLORS[idx] || RANK_COLORS[4]}`}>{idx + 1}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="font-bold text-slate-700 truncate text-sm">{p.name}</p>
                                                <div className="text-right"><p className="font-black text-slate-900 text-sm">{p.qty} <span className="text-xs text-slate-400 font-normal">ชิ้น</span></p></div>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div className={`h-2 rounded-full transition-all duration-500 ${idx === 0 ? 'bg-amber-500' : 'bg-slate-400/70'}`} style={{ width: `${(p.qty / (data?.topProducts[0].qty || 1)) * 100}%` }}></div>
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
    );
}