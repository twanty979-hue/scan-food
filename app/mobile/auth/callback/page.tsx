export default function MobileAuthCallbackPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#f2fbf4',
        fontFamily: 'sans-serif',
      }}
    >
      <section style={{ maxWidth: 480, textAlign: 'center' }}>
        <h1 style={{ color: '#15803d' }}>เปิดแอป SuparPOS เพื่อดำเนินการต่อ</h1>
        <p style={{ color: '#475569', lineHeight: 1.7 }}>
          หากแอปไม่เปิดอัตโนมัติ กรุณาติดตั้งหรืออัปเดต SuparPOS
          เป็นเวอร์ชันล่าสุด แล้วลองเข้าสู่ระบบอีกครั้ง
        </p>
      </section>
    </main>
  );
}
