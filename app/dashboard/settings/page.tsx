// app/dashboard/settings/page.tsx
'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useSettings } from '@/hooks/useSettings';

// ✅ เพิ่ม IconHistory เข้าไปใน import
import { IconShop, IconSave, IconUsers, IconLock, IconCrown, IconHistory } from './components/Icons'; 
import ShopSettingsForm from './components/ShopSettingsForm';
import CurrentPlanCard from './components/CurrentPlanCard';
import UpgradePlanModal from './components/UpgradePlanModal';
import PaymentQrModal from './components/PaymentQrModal';

export default function SettingsPage() {
  const {
    loading, submitting, isOwner, formData, setFormData,
    qrInputRef, getImageUrl, handleUpload, handleSave, 
    handleUpgradePlan, paymentModal, closePaymentModal,
    period, setPeriod
  } = useSettings();

  const [showUpgradePanel, setShowUpgradePanel] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'promptpay'>('promptpay');

  const currentPlan = formData.plan || 'free';
  const canManageStaff = ['pro', 'ultimate'].includes(currentPlan);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
      กำลังโหลดข้อมูล...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Script src="https://cdn.omise.co/omise.js" strategy="lazyOnload" />

      {/* Header */}
      <header className="px-6 lg:px-10 h-20 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer group">
              <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10 group-hover:scale-105 transition-transform">
                  <IconShop size={20} />
              </div>
              <div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">ตั้งค่าร้านค้า</h1>
                  <p className="text-slate-500 text-xs font-medium group-hover:text-indigo-600 transition-colors">จัดการข้อมูลและแพ็กเกจ</p>
              </div>
          </Link>

          <div className="flex items-center gap-3">
              {/* ✅ 1. ปุ่มประวัติการชำระเงิน (เพิ่มใหม่ตรงนี้) */}
              <Link href="/dashboard/settings/billing" className="hidden md:flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm hover:border-indigo-200 hover:text-indigo-600 group">
                <IconHistory size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span>ประวัติการชำระเงิน</span>
              </Link>

              {/* ปุ่มจัดการพนักงาน (Logic เดิม) */}
              {canManageStaff ? (
                  <Link href="/dashboard/settings/staff" className="flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm hover:border-indigo-200 hover:text-indigo-600 group">
                    <IconUsers size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span>จัดการพนักงาน</span>
                  </Link>
              ) : (
                  <button onClick={() => setShowUpgradePanel(true)} className="flex items-center gap-2 bg-slate-50 text-slate-400 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 hover:bg-slate-100 hover:text-slate-500 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-2 -mt-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rotate-45 transform translate-x-2 translate-y-[-50%]"></div>
                    <IconLock size={16} className="text-slate-400 group-hover:text-slate-600" />
                    <span>จัดการพนักงาน</span>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded ml-1 flex items-center gap-0.5 shadow-sm"><IconCrown size={10} /> PRO</span>
                  </button>
              )}

              <button onClick={handleSave} disabled={submitting} className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-slate-200 hover:shadow-indigo-500/20">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <IconSave size={18} />}
                <span>บันทึก</span>
              </button>
          </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-6">
                <ShopSettingsForm 
                    formData={formData} setFormData={setFormData} isOwner={isOwner} 
                    qrInputRef={qrInputRef} getImageUrl={getImageUrl} handleUpload={handleUpload as any}
                />
            </div>
            <div className="lg:col-span-4 h-full">
                <CurrentPlanCard currentPlanKey={formData.plan || 'free'} setShowUpgradePanel={setShowUpgradePanel} expiryDate={formData.expiry} />
            </div>
        </div>
      </main>

      {/* Modals */}
      <UpgradePlanModal 
        show={showUpgradePanel} onClose={() => setShowUpgradePanel(false)} period={period} setPeriod={setPeriod as any}
        paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} currentPlanKey={formData.plan || 'free'}
        submitting={submitting} handleUpgradePlan={handleUpgradePlan as any}
      />
      <PaymentQrModal isOpen={paymentModal.isOpen} onClose={closePaymentModal} qrImage={paymentModal.qrImage} />
    </div>
  );
}