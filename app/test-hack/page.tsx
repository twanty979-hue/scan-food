// app/test-hack/page.tsx
'use client';

import { useState } from 'react';
import { installThemeAction } from '@/app/actions/marketplaceDetailActions';

export default function HackerTestPage() {
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    // 🕵️‍♂️ จำลองการโจมตีแบบที่ 1: "เนียนไม่ส่งเลขบิล"
    // (แฮกเกอร์พยายามเรียกฟังก์ชันติดตั้ง โดยไม่ส่ง chargeId ไป)
    const attackNoPayment = async () => {
        addLog("🚀 Attack #1: Trying to install without Charge ID...");
        
        // 🔴 ใส่ ID ธีมที่มีราคา > 0 ของคุณลงไปตรงนี้
        const THEME_ID = "2cc67650-7b41-41e3-9bb6-c6c509a83390"; 

        const res = await installThemeAction(THEME_ID, null);

        if (res.success) {
            addLog("❌ HACKED SUCCEEDED! (ระบบไม่กัน)");
        } else {
            addLog(`✅ BLOCKED! Server replied: "${res.error}"`);
        }
    };

    // 🕵️‍♂️ จำลองการโจมตีแบบที่ 2: "มั่วเลขบิล (Fake ID)"
    // (แฮกเกอร์ส่งเลขมั่วๆ ไป หวังฟลุ๊คว่าระบบจะไม่เช็คกับ Omise)
const attackFakeID = async () => {
    addLog("🚀 Attack #2: Sending FAKE Charge ID...");
    
    // ✅ ใส่ ID จริงลงไป (เหมือนอันข้างบน)
    const THEME_ID = "2cc67650-7b41-41e3-9bb6-c6c509a83390"; 
    const FAKE_CHARGE_ID = "chrg_test_fake123456789";

        const res = await installThemeAction(THEME_ID, FAKE_CHARGE_ID);

        if (res.success) {
            addLog("❌ HACKED SUCCEEDED! (ระบบไม่กัน)");
        } else {
            addLog(`✅ BLOCKED! Server replied: "${res.error}"`);
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-black text-red-600">💀 HACKER SIMULATION</h1>
            <p className="text-slate-500">หน้านี้จำลองการยิงคำสั่งตรงเข้า Server โดยไม่จ่ายเงิน</p>
            
            <div className="flex gap-4">
                <button onClick={attackNoPayment} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">
                    Attack #1 (No ID)
                </button>
                <button onClick={attackFakeID} className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700">
                    Attack #2 (Fake ID)
                </button>
            </div>

            <div className="bg-black text-green-400 p-4 rounded-xl font-mono text-sm min-h-[200px]">
                {logs.length === 0 ? "> Ready to hack..." : logs.map((l, i) => <div key={i}>&gt; {l}</div>)}
            </div>
        </div>
    );
}