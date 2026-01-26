'use client';

import React, { createContext, useContext, useState, useRef } from 'react';

// --- Icons ---
const IconCheck = () => <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const IconX = () => <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const IconInfo = () => <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconQuestion = () => <svg className="w-12 h-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

type AlertType = 'success' | 'error' | 'info' | 'confirm';

interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (type: 'success' | 'error' | 'info', title: string, message?: string) => Promise<void>;
  showConfirm: (title: string, message?: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function GlobalAlertProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<AlertType>('info');
  const [config, setConfig] = useState<AlertOptions>({ title: '', message: '' });
  
  // ใช้เก็บ Promise resolve function เพื่อให้รอคำตอบได้ (เหมือน window.confirm)
  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string = '') => {
    return new Promise<void>((resolve) => {
      setType(type);
      setConfig({ title, message });
      setIsOpen(true);
      resolveRef.current = () => {
        setIsOpen(false);
        resolve();
      };
    });
  };

  const showConfirm = (title: string, message: string = '', confirmText = 'ยืนยัน', cancelText = 'ยกเลิก') => {
    return new Promise<boolean>((resolve) => {
      setType('confirm');
      setConfig({ title, message, confirmText, cancelText });
      setIsOpen(true);
      resolveRef.current = (result: boolean) => {
        setIsOpen(false);
        resolve(result);
      };
    });
  };

  const handleClose = (result: boolean) => {
    if (resolveRef.current) {
      resolveRef.current(result);
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* --- UI Modal --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" 
            onClick={() => type !== 'confirm' && handleClose(false)} // ถ้าไม่ใช่ confirm กดพื้นหลังปิดได้
          ></div>

          {/* Card */}
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200 border-4 border-white">
            
            {/* Icon */}
            <div className={`mx-auto w-20 h-20 flex items-center justify-center rounded-full mb-6 border-4 shadow-sm ${
                type === 'success' ? 'bg-green-50 border-green-100' :
                type === 'error' ? 'bg-red-50 border-red-100' :
                type === 'info' ? 'bg-blue-50 border-blue-100' :
                'bg-indigo-50 border-indigo-100'
            }`}>
                {type === 'success' && <IconCheck />}
                {type === 'error' && <IconX />}
                {type === 'info' && <IconInfo />}
                {type === 'confirm' && <IconQuestion />}
            </div>

            {/* Content */}
            <h3 className="text-2xl font-black text-slate-800 mb-2">{config.title}</h3>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">{config.message}</p>

            {/* Buttons */}
            <div className={`flex gap-4 justify-center ${type === 'confirm' ? '' : ''}`}>
                {type === 'confirm' ? (
                    <>
                        <button 
                            onClick={() => handleClose(false)}
                            className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            {config.cancelText}
                        </button>
                        <button 
                            onClick={() => handleClose(true)}
                            className="flex-1 py-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95"
                        >
                            {config.confirmText}
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => handleClose(true)}
                        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                            type === 'success' ? 'bg-green-500 hover:bg-green-600 shadow-green-200' :
                            type === 'error' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' :
                            'bg-blue-500 hover:bg-blue-600 shadow-blue-200'
                        }`}
                    >
                        รับทราบ
                    </button>
                )}
            </div>

          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

// Custom Hook เพื่อเรียกใช้
export function useGlobalAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useGlobalAlert must be used within a GlobalAlertProvider');
  }
  return context;
}