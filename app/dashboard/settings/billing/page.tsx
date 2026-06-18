"use client"

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { 
  CreditCard, 
  QrCode, 
  ArrowLeft, 
  Clock, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Timer,
  Layout,
  Receipt,
  Wallet
} from 'lucide-react';
import { getPaymentHistoryAction } from '@/app/actions/historyActions';

/**
 * StatusBadge Component
 */
const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, any> = {
    successful: {
      label: 'Success',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      icon: <CheckCircle2 size={12} className="mr-1" />
    },
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      icon: <Timer size={12} className="mr-1" />
    },
    failed: {
      label: 'Failed',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100',
      icon: <AlertCircle size={12} className="mr-1" />
    }
  };

  const config = configs[status] || configs.failed;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default function App() {
  const [history, setHistory] = useState<any[]>([]);
  const [coinLogs, setCoinLogs] = useState<any[]>([]);
  const [coins, setCoins] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payment' | 'coins'>('payment');

  dayjs.locale('th');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getPaymentHistoryAction();
        if (res.success) {
          setHistory(res.history ?? []);
          setCoinLogs(res.coinLogs ?? []);
          setCoins(res.coins ?? 0);
        }
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500 font-sans tracking-tight">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 md:py-12 md:px-6 font-sans pb-24 md:pb-12">
      
      {/* --- Header --- */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div>
          <div 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-500 text-sm mb-4 cursor-pointer hover:text-slate-900 transition-colors w-fit group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">กลับไปหน้าตั้งค่า</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">ประวัติการทำรายการ</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-lg leading-relaxed hidden md:block">
            รายการชำระเงินและการใช้เหรียญทั้งหมดของคุณจะถูกรวบรวมไว้ที่นี่
          </p>
        </div>
        
        {/* Stat Boxes */}
        <div className="flex items-center gap-3">
            {/* Payment Count Box */}
            <div className="hidden md:flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Receipt className="text-slate-400" size={20} />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ธุรกรรม</div>
                    <div className="text-lg font-black text-slate-900 leading-none mt-1">{history.length} รายการ</div>
                </div>
            </div>

            {/* Coin Balance Box */}
            <div className="flex items-center gap-3 bg-amber-50 p-3 md:p-4 rounded-2xl border border-amber-100 shadow-sm">
                <div className="p-2 bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <img src="/cion.png" alt="Coin" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest leading-none">เหรียญคงเหลือ</div>
                    <div className="text-lg md:text-xl font-black text-amber-700 leading-none mt-1">{coins.toLocaleString()}</div>
                </div>
            </div>
        </div>
      </div>

      {/* --- Tabs --- */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
        <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'payment' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            การชำระเงิน
        </button>
        <button
            onClick={() => setActiveTab('coins')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'coins' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <img src="/cion.png" alt="Coin" className="w-4 h-4 object-contain" />
            ประวัติเหรียญ
        </button>
      </div>

      {/* --- Tab Content: Payment History --- */}
      {activeTab === 'payment' && (
          <>
            {/* Mobile View: Cards List */}
            <div className="md:hidden space-y-4">
                {history.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="text-slate-300 mb-2 mx-auto w-fit"><Package size={32} /></div>
                        <p className="text-slate-400 text-sm">ไม่พบประวัติการทำรายการ</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Clock size={14} className="text-slate-400" />
                                    <span>{dayjs(item.created_at).format('DD MMM YYYY, HH:mm')}</span>
                                </div>
                                <StatusBadge status={item.status} />
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'buy_theme' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {item.type === 'buy_theme' ? <Package size={20} /> : <Layout size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.type === 'buy_theme' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {item.type === 'buy_theme' ? 'Theme' : 'Plan'}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-slate-900 text-base leading-tight">{item.displayName}</h3>
                                    <p className="text-xs text-slate-400 mt-0.5 font-medium">ID: {item.charge_id ? item.charge_id.substring(0, 12) : '-'}...</p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                                    {item.payment_method === 'credit_card' ? <CreditCard size={14}/> : <QrCode size={14}/>}
                                    <span className="uppercase">{item.payment_method === 'credit_card' ? 'Card' : 'QR Pay'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black text-slate-900">฿{(item.amount / 100).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
                <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">ข้อมูลธุรกรรม</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">รายละเอียด</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-center">ช่องทาง</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">ยอดชำระ</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-center">สถานะ</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {history.length === 0 ? (
                        <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <Package size={32} />
                            </div>
                            <p className="text-slate-900 font-bold">ไม่พบประวัติการทำรายการ</p>
                            </div>
                        </td>
                        </tr>
                    ) : (
                        history.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                            <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Clock size={18} />
                                </div>
                                <div>
                                <div className="text-sm font-bold text-slate-900">{dayjs(item.created_at).format('DD MMM YYYY')}</div>
                                <div className="text-[11px] font-medium text-slate-400 mt-0.5">{dayjs(item.created_at).format('HH:mm')} น.</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-6">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${item.type === 'buy_theme' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                    {item.type === 'buy_theme' ? 'Theme' : 'Plan'}
                                </span>
                                </div>
                                <div className="text-sm font-black text-slate-900 leading-tight">{item.displayName}</div>
                                <div className="text-[11px] text-slate-400 mt-1.5 font-bold flex items-center gap-2">
                                <span className="flex items-center gap-1 text-slate-500"><Layout size={10} /> {item.period || 'Lifetime'}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span className="text-slate-400 italic">ID: {item.charge_id?.substring(0, 12)}...</span>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-6 text-center">
                            <div className="inline-flex flex-col items-center gap-1 p-2 rounded-xl border border-transparent group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-sm transition-all min-w-[70px]">
                                {item.payment_method === 'credit_card' ? <CreditCard size={18} className="text-slate-700" /> : <QrCode size={18} className="text-slate-700" />}
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.payment_method === 'credit_card' ? 'Card' : 'QR Pay'}</span>
                            </div>
                            </td>
                            <td className="px-6 py-6 text-right whitespace-nowrap">
                            <div className="text-sm font-black text-slate-900">฿{(item.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">THB</div>
                            </td>
                            <td className="px-6 py-6 text-center whitespace-nowrap">
                            <StatusBadge status={item.status} />
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>
            </div>
            
            <div className="mt-6 md:mt-8 p-4 md:p-6 rounded-2xl bg-blue-50/30 border border-blue-100/50 shadow-sm flex gap-4 items-start">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600 shrink-0"><AlertCircle size={20} /></div>
                <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">คำชี้แจง</p>
                    <p className="text-xs md:text-[13px] text-slate-500 leading-relaxed">
                    ระบบจะใช้เวลาประมวลผล 5-10 นาที หากไม่พบรายการ กรุณาติดต่อฝ่ายบริการลูกค้า
                    </p>
                </div>
            </div>
          </>
      )}

      {/* --- Tab Content: Coin Logs --- */}
      {activeTab === 'coins' && (
          <>
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {coinLogs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="text-slate-300 mb-2 mx-auto w-fit"><Wallet size={32} /></div>
                        <p className="text-slate-400 text-sm">ไม่พบประวัติการใช้เหรียญ</p>
                    </div>
                ) : (
                    coinLogs.map((log) => (
                        <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Clock size={14} className="text-slate-400" />
                                    <span>{dayjs(log.created_at).format('DD MMM YYYY, HH:mm')}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${log.action === 'buy_theme' ? 'bg-amber-50' : 'bg-slate-50'}`}>
                                    <img src="/cion.png" alt="Coin" className="w-6 h-6 object-contain" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-700">
                                            {log.action}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-slate-900 text-base leading-tight mt-1">{log.details || 'ไม่ระบุรายละเอียด'}</h3>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-50 flex justify-end items-center">
                                <div className="text-right flex items-center gap-2">
                                    <span className={`text-lg font-black ${log.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()}
                                    </span>
                                    <img src="/cion.png" alt="Coin" className="w-4 h-4 object-contain" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
                <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">วันที่/เวลา</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">ประเภท</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">รายละเอียด</th>
                        <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">จำนวนเหรียญ</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {coinLogs.length === 0 ? (
                        <tr>
                        <td colSpan={4} className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                <Wallet size={32} />
                            </div>
                            <p className="text-slate-900 font-bold">ไม่พบประวัติการใช้เหรียญ</p>
                            </div>
                        </td>
                        </tr>
                    ) : (
                        coinLogs.map((log) => (
                        <tr key={log.id} className="group hover:bg-slate-50/50 transition-all duration-200">
                            <td className="px-6 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                <Clock size={18} />
                                </div>
                                <div>
                                <div className="text-sm font-bold text-slate-900">{dayjs(log.created_at).format('DD MMM YYYY')}</div>
                                <div className="text-[11px] font-medium text-slate-400 mt-0.5">{dayjs(log.created_at).format('HH:mm')} น.</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-6 whitespace-nowrap">
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-100 text-slate-700">
                                    {log.action}
                                </span>
                            </td>
                            <td className="px-6 py-6">
                                <div className="text-sm font-bold text-slate-900">{log.details || '-'}</div>
                            </td>
                            <td className="px-6 py-6 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                    <span className={`text-lg font-black ${log.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                        {log.amount > 0 ? '+' : ''}{log.amount.toLocaleString()}
                                    </span>
                                    <img src="/cion.png" alt="Coin" className="w-5 h-5 object-contain" />
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>
            </div>
          </>
      )}

    </div>
  );
}