// app/layout.tsx
import type { Metadata, Viewport } from "next"; // 👈 เพิ่ม Viewport เข้ามา
import "./globals.css";
import GlobalAlertProvider from '@/components/providers/GlobalAlertProvider';

// แยกส่วน Viewport ออกมา (เป็นมาตรฐานใหม่ของ Next.js)
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
    "POS",
    "FoodScan",
    "Food Scan",
    "ระบบ POS",
    "POS System",
    "POS-FoodScan",
    "สแกนสั่งอาหาร",
    "ระบบสแกนสั่งอาหารผ่าน QR Code" // 👈 แก้ Qr เป็น QR (ตัวใหญ่) ให้ดูโปรครับ
  ],

  openGraph: {
    title: "POS & FoodScan - ระบบร้านอาหารยุคใหม่", // 👈 ปรับให้ยาวขึ้นนิดนึง
    description: "ลดต้นทุนร้านอาหาร พนักงานไม่ต้องจดออเดอร์ เริ่มต้นใช้งานฟรี",
    url: 'https://pos-foodscan.com',
    siteName: 'POS-FoodScan',
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png', // 🔥 ต้องมีรูปนี้นะครับ!
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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="antialiased">
        <GlobalAlertProvider>{children}</GlobalAlertProvider>
      </body>
    </html>
  );
}