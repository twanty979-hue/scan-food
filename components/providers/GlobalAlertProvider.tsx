'use client';

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

// --- Icons ---
const IconCheck = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IconAlert = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconInfo = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const IconWallet = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;

interface AlertContextType {
  showAlert: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => Promise<void>;
  showConfirm: (title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useGlobalAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useGlobalAlert must be used within a GlobalAlertProvider');
  return context;
}

export default function GlobalAlertProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    isOpen: boolean;
    mode: 'alert' | 'confirm';
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    resolve?: (value: boolean) => void;
  }>({
    isOpen: false,
    mode: 'alert',
    type: 'info',
    title: '',
    message: '',
    confirmText: 'ตกลง',
    cancelText: 'ยกเลิก',
  });

  const showAlert = async (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string = '') => {
    return new Promise<void>((resolve) => {
      setState({
        isOpen: true,
        mode: 'alert',
        type,
        title,
        message,
        confirmText: 'ตกลง',
        cancelText: '',
        resolve: () => resolve(),
      });
    });
  };

  const showConfirm = async (title: string, message: string, confirmText: string = 'ยืนยัน', cancelText: string = 'ยกเลิก') => {
    return new Promise<boolean>((resolve) => {
      setState({
        isOpen: true,
        mode: 'confirm',
        type: 'info', // Default type for confirm
        title,
        message,
        confirmText,
        cancelText,
        resolve,
      });
    });
  };

  const handleClose = (result: boolean) => {
    setState((prev) => ({ ...prev, isOpen: false }));
    if (state.resolve) {
      if (state.mode === 'confirm') state.resolve(result);
      else state.resolve(true);
    }
  };

  // --- Logic ตรวจจับว่าเป็น "การชำระเงิน" หรือไม่ ---
  const isPayment = state.title.includes('ชำระ') || state.message.includes('บาท');
  
  // ดึงตัวเลขเงินออกมา (ถ้ามี)
  const extractPrice = (text: string) => {
    const match = text.match(/([\d,]+\.?\d*)\s*บาท/);
    return match ? match[1] : null;
  };
  const price = extractPrice(state.message);
  
  // ตัดข้อความส่วนที่เป็นราคาออก เพื่อไม่ให้ซ้ำซ้อน
  const displayMessage = state.message.replace(/ยอดชำระ:.*บาท/, '').trim();

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {state.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-[360px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300"
            role="dialog"
            aria-modal="true"
          >
            {/* Header / Icon Area */}
            <div className={`pt-8 pb-4 flex justify-center ${isPayment ? 'bg-indigo-50/50' : ''}`}>
               <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4 border-white
                 ${isPayment ? 'bg-indigo-100 text-indigo-600' : 
                   (state.type === 'success' ? 'bg-emerald-100' : 
                   state.type === 'error' ? 'bg-red-100 text-red-500' : 
                   state.type === 'warning' ? 'bg-amber-100' : 'bg-slate-100')}
               `}>
                 {isPayment ? <IconWallet /> : 
                   (state.type === 'success' ? <IconCheck /> : 
                   state.type === 'error' ? <IconAlert className="text-red-500" /> : 
                   state.type === 'warning' ? <IconAlert /> : <IconInfo />)
                 }
               </div>
            </div>

            {/* Content Area */}
            <div className="px-6 pb-6 text-center">
              <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
                {state.title}
              </h3>
              
              {/* ถ้ามีราคา ให้โชว์ตัวใหญ่ๆ */}
              {isPayment && price && (
                <div className="my-4 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">ยอดชำระ (Total)</p>
                    <p className="text-3xl font-black text-indigo-600 tracking-tight">฿{price}</p>
                </div>
              )}

              <p className="text-slate-500 font-medium text-sm leading-relaxed whitespace-pre-line">
                {isPayment && price ? displayMessage : state.message}
              </p>
            </div>

            {/* Actions Area */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              {state.mode === 'confirm' && (
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-800 transition-all active:scale-95 shadow-sm"
                >
                  {state.cancelText}
                </button>
              )}
              
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2
                  ${isPayment 
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-indigo-200 hover:shadow-indigo-300' 
                    : (state.type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200')
                  }
                `}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}