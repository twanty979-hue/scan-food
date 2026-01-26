'use client'

import { useState, useEffect } from 'react';
// ✅ Import จากไฟล์ใหม่
import { createPromptPayQRCode, checkOmisePaymentStatus } from '@/app/actions/omiseActions';

export default function PromptPayTest() {
  const [amount, setAmount] = useState(100);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [status, setStatus] = useState('waiting');

  const handleGenerateQR = async () => {
    setStatus('generating');
    // เรียกใช้ Function ใหม่
    const res = await createPromptPayQRCode(amount);
    
    if (res.success && res.qrImage) {
      setQrCode(res.qrImage);
      setChargeId(res.chargeId);
      setStatus('pending');
    } else {
      alert('Error: ' + res.error);
      setStatus('waiting');
    }
  };

  // เช็คยอดทุก 3 วิ
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (chargeId && status === 'pending') {
      interval = setInterval(async () => {
        // เรียกใช้ Function ใหม่
        const res = await checkOmisePaymentStatus(chargeId);
        if (res.success && res.status === 'successful') {
          setStatus('successful');
          clearInterval(interval);
          alert("ได้รับเงินแล้ว! 💰");
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [chargeId, status]);

  return (
    <div className="p-10 flex flex-col items-center gap-4">
      <h1 className="text-xl font-bold">ทดสอบ Omise PromptPay</h1>
      
      {!qrCode ? (
        <button onClick={handleGenerateQR} className="bg-blue-600 text-white px-4 py-2 rounded">
          สร้าง QR {amount} บาท
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <img src={qrCode} className="w-64 h-64 border p-2 rounded" />
          <p className={status === 'successful' ? "text-green-600 font-bold" : "text-slate-500"}>
            {status === 'successful' ? '✅ จ่ายเงินสำเร็จ' : '⏳ รอสแกน...'}
          </p>
        </div>
      )}
    </div>
  );
}