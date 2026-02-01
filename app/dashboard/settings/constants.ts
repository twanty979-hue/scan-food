export const PLANS = {
  free: { 
    name: 'Starter', 
    price: 'ฟรี', 
    period: 'ตลอดชีพ', 
    themes: '2 ธีม', 
    orders: '30 ออเดอร์/เดือน', 
    features: [
       
      'เลือกได้ 2 ธีม',
      'รองรับ 30 ออเดอร์/เดือน',
      
      
    ], 
    color: 'border-slate-200', 
    btnColor: 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
  },
  basic: { 
    name: 'Basic', 
    price: '399', 
    period: 'บาท/เดือน', 
    themes: '10 ธีม', 
    orders: 'ไม่จำกัด', 
    features: [
    'การจัดโปรโมชั้น',
      'ออเดอร์ไม่จำกัด', 
      'สร้างQrCode ไม่จำกัด',
      'คิดเงินได้ไม่จำกัด',
      'ฟรี 10 ธีม', 
      
      
    ], 
    color: 'border-blue-200', 
    btnColor: 'bg-blue-600 text-white hover:bg-blue-700' 
  },
  pro: { 
    name: 'Pro', 
    price: '1,299', 
    period: 'บาท/เดือน', 
    themes: '15 ธีม', 
    orders: 'ไม่จำกัด', 
    features: [
        'การจัดโปรโมชั้น',
      'ออเดอร์ไม่จำกัด', 
      'สร้างQrCode ไม่จำกัด',
      'คิดเงินได้ไม่จำกัด',
        'เพิ่มพนักงาน แก้ไข',
      'ระบบจัดการพนักงาน', 
      'กำหนดสิทธ์พนักงาน', 
      'เลือกได้ 15 ธีม',
      
    ], 
    color: 'border-indigo-200', 
    btnColor: 'bg-indigo-600 text-white hover:bg-indigo-700' 
  },
  ultimate: { 
    name: 'ULTIMATE', 
    price: '1,999', 
    period: 'บาท/เดือน', 
    themes: '25 ธีม', 
    orders: 'ไม่จำกัด', 
    features: [
        'การจัดโปรโมชั้น',
      'ออเดอร์ไม่จำกัด', 
      'สร้างQrCode ไม่จำกัด',
      'คิดเงินได้ไม่จำกัด',
      'ระบบจัดการพนักงาน', 
      'เพิ่มพนักงาน แก้ไข',
      'กำหนดสิทธ์พนักงาน', 
      'เลือกได้ 30 ธีม',
      
      
    ], 
    color: 'border-purple-500 shadow-purple-200', 
    btnColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30', 
    isPopular: true 
  }
};