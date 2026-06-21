'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { DEFAULT_POS_SETTINGS, loadPosSettings, PosDisplaySettings, savePosSettings } from '@/lib/posSettings';

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button type="button" role="switch" aria-checked={enabled} onClick={onChange} className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${enabled ? 'justify-end bg-orange-500' : 'justify-start bg-slate-200'}`}>
    <span className="block h-5 w-5 rounded-full bg-white shadow-sm" />
  </button>
);

function PosSettingsContent() {
  const { loading, submitting, formData, setFormData, handleSave } = useSettings();
  const [settings, setSettings] = useState<PosDisplaySettings>(DEFAULT_POS_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void loadPosSettings().then(value => {
      if (active) setSettings(value);
    });
    return () => { active = false; };
  }, []);

  const updateSetting = <K extends keyof PosDisplaySettings>(key: K, value: PosDisplaySettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    void savePosSettings(next).then(() => {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1200);
    });
  };

  const saveAll = async () => {
    await savePosSettings(settings);
    await handleSave({ preventDefault() {} } as FormEvent);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">กำลังโหลดการตั้งค่า...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-600 hover:bg-slate-50">‹</Link>
            <div><h1 className="text-lg font-black text-slate-900 md:text-2xl">ตั้งค่าหน้าคิดเงิน</h1><p className="text-xs text-slate-400">หน้าตา การพิมพ์ และ QR โต๊ะ</p></div>
          </div>
          <button type="button" onClick={saveAll} disabled={submitting} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-lg disabled:opacity-50">{submitting ? 'กำลังบันทึก...' : saved ? 'บันทึกแล้ว ✓' : 'บันทึก'}</button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 p-4 md:p-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-black text-slate-800">การแสดงผลหน้าขาย</h2><p className="mt-1 text-xs text-slate-400">ปรับหน้ารายการอาหารให้เหมาะกับความเร็วในการขาย</p></div>
          <div className="flex items-center justify-between gap-4 p-5">
            <div><p className="text-sm font-bold text-slate-700">แสดงรูปอาหาร</p><p className="mt-1 text-xs leading-relaxed text-slate-400">เปิดเพื่อแสดงรูปบนปุ่มสินค้า ปิดเพื่อแสดงรายการแบบกระชับ</p></div>
            <Toggle enabled={settings.showProductImages} onChange={() => updateSetting('showProductImages', !settings.showProductImages)} />
          </div>
          {settings.showProductImages && (
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-orange-50/40 p-5">
              <div><p className="text-sm font-bold text-slate-700">ไม่แสดงชื่ออาหาร</p><p className="mt-1 text-xs leading-relaxed text-slate-400">ใช้รูปภาพและราคาเท่านั้น เหมาะกับเมนูที่รูปชัดเจน</p></div>
              <Toggle enabled={settings.hideProductNames} onChange={() => updateSetting('hideProductNames', !settings.hideProductNames)} />
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-black text-slate-800">ใบเสร็จและการพิมพ์</h2><p className="mt-1 text-xs text-slate-400">ใช้กับการพิมพ์ผ่านแอป FoodScan บน Android</p></div>
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
            <div><p className="text-sm font-bold text-slate-700">พิมพ์ออเดอร์อัตโนมัติเมื่อเข้ามา</p><p className="mt-1 text-xs text-slate-400">รับออเดอร์ใหม่และพิมพ์ใบเข้าครัวผ่านแอปทันที</p></div>
            <Toggle enabled={settings.autoPrintOrders} onChange={() => updateSetting('autoPrintOrders', !settings.autoPrintOrders)} />
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
            <div><p className="text-sm font-bold text-slate-700">พิมพ์ใบเสร็จอัตโนมัติ</p><p className="mt-1 text-xs text-slate-400">พิมพ์ทันทีหลังรับชำระเงินสำเร็จ</p></div>
            <Toggle enabled={settings.autoPrintReceipt} onChange={() => updateSetting('autoPrintReceipt', !settings.autoPrintReceipt)} />
          </div>
          <div className="p-5">
            <p className="mb-1 text-sm font-bold text-slate-700">จำนวนใบต่อการพิมพ์</p>
            <p className="mb-3 text-xs text-slate-400">ใช้กับใบออเดอร์เข้าครัวและใบเสร็จเท่านั้น ไม่รวม QR โต๊ะ</p>
            <div className="grid grid-cols-2 gap-3">
              {([1, 2] as const).map(copies => <button key={copies} type="button" onClick={() => updateSetting('receiptCopies', copies)} className={`rounded-2xl border-2 p-4 text-left transition-all ${settings.receiptCopies === copies ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}><span className="block text-lg font-black">{copies} ใบ</span><span className="text-xs opacity-70">{copies === 1 ? 'สำหรับลูกค้า' : 'ลูกค้าและสำเนาร้าน'}</span></button>)}
            </div>
            <Link href="/dashboard/settings/printer" className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 p-4 text-white transition hover:bg-slate-800"><div><p className="text-sm font-black">ตั้งค่าเครื่องพิมพ์</p><p className="mt-0.5 text-xs text-slate-300">เลือก Bluetooth หรือกำหนด IP เครื่องพิมพ์</p></div><span className="text-xl">›</span></Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4"><h2 className="font-black text-slate-800">โหมด QR โต๊ะ</h2><p className="mt-1 text-xs text-slate-400">เลือกวิธีใช้งาน QR สำหรับลูกค้าสแกนสั่งอาหารที่โต๊ะ</p></div>
          <div className="grid gap-3 md:grid-cols-2">
            <button type="button" onClick={() => setFormData({ ...formData, qr_mode: 'static' })} className={`rounded-2xl border-2 p-4 text-left transition-all ${formData.qr_mode === 'static' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600'}`}><span className="block text-sm font-black">QR ติดโต๊ะ</span><span className="mt-1 block text-xs leading-relaxed opacity-75">ลิงก์เดิม ใช้ได้ตลอด เหมาะกับการพิมพ์ติดโต๊ะ</span></button>
            <button type="button" onClick={() => setFormData({ ...formData, qr_mode: 'rotating' })} className={`rounded-2xl border-2 p-4 text-left transition-all ${formData.qr_mode !== 'static' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'}`}><span className="block text-sm font-black">QR เปลี่ยนทุกรอบ</span><span className="mt-1 block text-xs leading-relaxed opacity-75">ปลอดภัยกว่า ลิงก์เก่าหมดอายุเมื่อรีเซ็ตรอบโต๊ะ</span></button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function PosSettingsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">Loading settings...</div>}>
      <PosSettingsContent />
    </Suspense>
  );
}
