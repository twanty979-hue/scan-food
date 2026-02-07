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
  ChevronRight,
  Receipt
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default function App() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  dayjs.locale('th');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getPaymentHistoryAction();
        if (res.success) {
          setHistory(res.history ?? []);
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
          <span className="text-sm font-medium text-slate-500 font-sans tracking-tight">กำลังรวบรวมข้อมูลธุรกรรมของคุณ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 font-sans">
      {/* ส่วนหัวของหน้าจอ */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-500 text-sm mb-4 cursor-pointer hover:text-slate-900 transition-colors w-fit group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">กลับไปหน้าตั้งค่า</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ประวัติการชำระเงิน</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-lg leading-relaxed">
            รายการชำระเงินทั้งหมดของคุณจะถูกรวบรวมไว้ที่นี่ คุณสามารถตรวจสอบรายละเอียดธีมร้านค้าและสถานะแพ็กเกจที่ซื้อไว้ได้ตลอดเวลา
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Receipt className="text-slate-400" size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ทั้งหมด</div>
            <div className="text-lg font-black text-slate-900 leading-none mt-1">{history.length} รายการ</div>
          </div>
        </div>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">ข้อมูลธุรกรรม</th>
                <th className="px-6 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">รายละเอียดรายการ</th>
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
                      <div className="max-w-xs mx-auto">
                        <p className="text-slate-900 font-bold">ไม่พบประวัติการทำรายการ</p>
                        <p className="text-slate-400 text-xs mt-1">คุณยังไม่มีรายการชำระเงินในระบบขณะนี้</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-200 cursor-default">
                    {/* ข้อมูลธุรกรรม (Date & Time) */}
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-slate-600 group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                          <Clock size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {dayjs(item.created_at).format('DD MMM YYYY')}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                            เวลา {dayjs(item.created_at).format('HH:mm')} น.
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* รายละเอียดรายการ (แก้ไขให้แสดง displayName) */}
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${item.type === 'buy_theme' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            {item.type === 'buy_theme' ? 'Theme Asset' : 'Subscription'}
                          </span>
                        </div>
                        {/* ใช้ displayName ที่ Backend ส่งมาให้ได้เลย */}
                        <div className="text-sm font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors flex items-center gap-1">
                          {item.displayName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1.5 font-bold flex items-center gap-2">
                           <span className="flex items-center gap-1 text-slate-500">
                             <Layout size={10} strokeWidth={3} />
                             {item.period || 'Lifetime Access'}
                           </span>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                           <span className="text-slate-400 italic font-medium uppercase tracking-tighter">
                             ID: {item.charge_id ? item.charge_id.substring(0, 12) : '-'}...
                           </span>
                        </div>
                      </div>
                    </td>

                    {/* ช่องทางการชำระเงิน */}
                    <td className="px-6 py-6 text-center">
                      <div className="inline-flex flex-col items-center gap-1 p-2 rounded-xl border border-transparent group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-sm transition-all min-w-[70px]">
                        {item.payment_method === 'credit_card' ? (
                          <>
                            <CreditCard size={18} strokeWidth={2} className="text-slate-700" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Card</span>
                          </>
                        ) : (
                          <>
                            <QrCode size={18} strokeWidth={2} className="text-slate-700" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">QR Pay</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* ยอดชำระ */}
                    <td className="px-6 py-6 text-right whitespace-nowrap">
                      <div className="text-sm font-black text-slate-900 tabular-nums">
                        ฿{(item.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Thai Baht</div>
                    </td>

                    {/* สถานะธุรกรรม */}
                    <td className="px-6 py-6 text-center whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50/30 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                อัปเดตข้อมูลล่าสุดเมื่อ: {dayjs().format('HH:mm')} น.
              </span>
           </div>
           {/* ... ปุ่มอื่นๆ เหมือนเดิม ... */}
        </div>
      </div>
      
      {/* ข้อความเพิ่มเติมด้านล่าง */}
      <div className="mt-8 p-6 rounded-2xl bg-blue-50/30 border border-blue-100/50 shadow-sm">
        <div className="flex gap-4">
           <div className="p-2 bg-blue-50 rounded-xl text-blue-600 h-fit">
              <AlertCircle size={20} />
           </div>
           <div>
              <p className="text-sm font-bold text-slate-900 mb-1 leading-none">คำชี้แจงเกี่ยวกับใบเสร็จรับเงิน</p>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                ระบบจะใช้เวลาประมวลผลภายใน 5-10 นาทีหลังจากการชำระเงินสำเร็จ หากคุณไม่พบรายการที่ชำระไปแล้ว 
                หรือสถานะไม่ถูกต้อง กรุณาติดต่อฝ่ายบริการลูกค้าพร้อมแจ้ง Charge ID เพื่อทำการตรวจสอบ
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}