import type { Metadata } from "next";
import "./globals.css";
// ✅ 1. นำเข้า Provider
import GlobalAlertProvider from '@/components/providers/GlobalAlertProvider';

export const metadata: Metadata = {
  title: "Spring - Fresh Bloom System",
  description: "ระบบสั่งอาหารร้าน The Meadow Diner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        {/* ดึงไอคอน FontAwesome มาใช้ */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        {/* ✅ 2. ครอบ Provider ไว้ตรงนี้เพื่อให้ Alert ทำงานได้ทุกหน้า */}
        <GlobalAlertProvider>
          {children}
        </GlobalAlertProvider>
      </body>
    </html>
  );
}