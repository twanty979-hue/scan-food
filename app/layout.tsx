// app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import GlobalAlertProvider from '@/components/providers/GlobalAlertProvider';

export const metadata: Metadata = {
  metadataBase: new URL('https://pos-foodscan.com'),

  // 🔥 จุดที่ 1: Title ต้องขึ้นต้นด้วยคำที่อยากให้ค้นเจอ
  title: "POS & FoodScan - ระบบ POS และ FoodScan สแกนสั่งอาหาร", 
  
  // 🔥 จุดที่ 2: Description ต้องมีคำว่า POS และ FoodScan อยู่ในประโยคแรก
  description: "POS FoodScan คือระบบ POS ร้านอาหาร และ FoodScan สำหรับสแกนสั่งอาหารที่ดีที่สุด...",
  
  // 🔥 จุดที่ 3: ใส่คำสั้นๆ โดดๆ ลงไป
  keywords: [
    "POS",          // 👈 ใส่คำเดียวโดดๆ
    "FoodScan",     // 👈 ใส่คำเดียวโดดๆ
    "Food Scan",    // 👈 เผื่อคนพิมพ์เว้นวรรค
    "ระบบ POS",
    "POS System",
    "POS-FoodScan",
    "สแกนสั่งอาหาร"
  ],

  openGraph: {
    title: "POS & FoodScan",
    description: "ระบบ POS และ FoodScan ที่ใช้งานง่ายที่สุด",
    url: 'https://pos-foodscan.com',
    siteName: 'POS-FoodScan',
    locale: 'th_TH',
    type: 'website',
  },

  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased">
        <GlobalAlertProvider>{children}</GlobalAlertProvider>
      </body>
    </html>
  );
}