// app/dashboard/settings/components/PaymentQrModal.tsx

interface Props {
  isOpen: boolean;
  onClose: () => void;
  qrImage: string | null;
}

export default function PaymentQrModal({ isOpen, onClose, qrImage }: Props) {
  if (!isOpen) return null;

  return (
     <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
         <div className="bg-white rounded-[32px] w-full max-w-[340px] relative z-10 p-8 text-center shadow-2xl animate-in zoom-in-95">
             <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tight">ชำระเงิน</h3>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-inner mb-6 flex justify-center">
                {qrImage ? (
                    <img src={qrImage} alt="QR" className="w-44 h-44 object-contain" />
                ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-300 animate-pulse">สร้าง QR...</div>
                )}
             </div>
             <button onClick={onClose} className="w-full h-12 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors">ยกเลิก</button>
         </div>
     </div>
  );
}