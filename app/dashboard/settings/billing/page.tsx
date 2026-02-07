// app/(dashboard)/settings/billing/history/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { getPaymentHistoryAction } from '@/app/actions/historyActions'; // Import Action ที่สร้างเมื่อกี้
import dayjs from 'dayjs';
import 'dayjs/locale/th'; 

// ตั้งค่าให้แสดงภาษาไทย (Optional)
dayjs.locale('th');

export default function PaymentHistoryPage({ params }: { params: { brandId: string } }) { // หรือรับ brandId ตาม context ของคุณ
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // สมมติว่าคุณมี brandId (อาจจะมาจาก Context หรือ Props)
  // ในที่นี้ผม Hardcode ให้เห็นภาพ แต่จริงๆ ต้องดึงจาก User Profile
  const brandId = '...ใส่ ID ร้านค้าตรงนี้...'; 

  useEffect(() => {
    async function fetchData() {
      const res = await getPaymentHistoryAction(brandId);
      if (res.success) {
        setHistory(res.history ?? []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📜 ประวัติการชำระเงิน</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm uppercase">
              <th className="p-4 border-b">วันที่ / เวลา</th>
              <th className="p-4 border-b">รายการ</th>
              <th className="p-4 border-b text-center">ช่องทาง</th>
              <th className="p-4 border-b text-right">ยอดเงิน</th>
              <th className="p-4 border-b text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  ยังไม่มีประวัติการชำระเงิน
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 border-b last:border-0 transition">
                  {/* 1. วันที่ */}
                  <td className="p-4 text-sm text-gray-700">
                    <div className="font-semibold">{dayjs(item.created_at).format('DD MMM YYYY')}</div>
                    <div className="text-xs text-gray-500">{dayjs(item.created_at).format('HH:mm')} น.</div>
                  </td>

                  {/* 2. รายการ */}
                  <td className="p-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.type === 'upgrade_plan' ? 'อัปเกรดแพ็กเกจ' : 'ซื้อธีมร้านค้า'}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {item.plan_detail} ({item.period || 'Lifetime'})
                    </div>
                  </td>

                  {/* 3. ช่องทาง */}
                  <td className="p-4 text-center">
                    {item.payment_method === 'credit_card' ? (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">บัตรเครดิต</span>
                    ) : (
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">QR PromptPay</span>
                    )}
                  </td>

                  {/* 4. ยอดเงิน (แปลงหน่วยสตางค์เป็นบาท) */}
                  <td className="p-4 text-right font-bold text-gray-800">
                    ฿{(item.amount / 100).toLocaleString()}
                  </td>

                  {/* 5. สถานะ */}
                  <td className="p-4 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Component ย่อยสำหรับแสดงสีปุ่มสถานะ
function StatusBadge({ status }: { status: string }) {
  if (status === 'successful') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✅ สำเร็จ
      </span>
    );
  } else if (status === 'pending') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        ⏳ รอชำระ
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ❌ ล้มเหลว
      </span>
    );
  }
}