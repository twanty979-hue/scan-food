// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import GlobalAlertProvider from '@/components/providers/GlobalAlertProvider';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://pos-foodscan.com'),
  title: "ระบบ POS ร้านอาหาร พร้อม QR Code สแกนสั่งอาหาร | POS FoodScan",
  description: "POS FoodScan คือระบบ POS ร้านอาหาร และสแกนสั่งอาหาร QR Code ที่ดีที่สุด ใช้งานง่าย ลดต้นทุน พนักงานไม่ต้องจด เริ่มต้นใช้งานฟรีวันนี้",
  keywords: [
    "POS", "FoodScan", "Food Scan", "ระบบ POS", "POS System",
    "POS-FoodScan", "สแกนสั่งอาหาร", "ระบบสแกนสั่งอาหารผ่าน QR Code"
  ],
  openGraph: {
    title: "POS & FoodScan - ระบบร้านอาหารยุคใหม่",
    description: "ลดต้นทุนร้านอาหาร พนักงานไม่ต้องจดออเดอร์ เริ่มต้นใช้งานฟรี",
    url: 'https://pos-foodscan.com',
    siteName: 'POS-FoodScan',
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'POS FoodScan Preview',
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <head>
        {/* 1. Font Awesome (ที่นายมีอยู่แล้ว) */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        
        {/* 🔥 2. Flaticon UIcons (ต้องเพิ่มอันนี้! ไม่งั้นไอคอนแมวไม่ขึ้น) */}
        <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.1.0/uicons-regular-rounded/css/uicons-regular-rounded.css' />
        <link rel='stylesheet' href='https://cdn-uicons.flaticon.com/2.1.0/uicons-solid-rounded/css/uicons-solid-rounded.css' />
        
        {/* 🔥 3. Animate.css (เพื่อให้พวก wobble/bounce ในธีมทำงาน) */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
      </head>
      <body className="antialiased">
        <GlobalAlertProvider>
          {/* ห่อ children ด้วย div เปล่าๆ ไม่ต้องใส่สีพื้นหลังตรงนี้ เพื่อให้ลายจุดจากธีมทะลุขึ้นมาได้ */}
          <div className="min-h-screen">
            {children}
          </div>
        </GlobalAlertProvider>
      </body>
    </html>
  );
}