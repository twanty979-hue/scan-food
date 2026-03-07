// app/api/send-notification/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: Request) {
  try {
    const { brandId, message } = await request.json();

    // 🌟 1. ดึงมาทั้ง fcm_token (แอป) และ fcm_token_web (เว็บ)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('fcm_token, fcm_token_web')
      .eq('brand_id', brandId);

    if (error || !profiles || profiles.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบข้อมูลพนักงาน' });
    }

    // 🌟 2. นำ Token จากทั้ง 2 คอลัมน์มารวมกัน (ข้ามค่า null หรือว่างเปล่า)
    const tokens = profiles.flatMap(p => [p.fcm_token, p.fcm_token_web]).filter(Boolean) as string[];

    if (tokens.length === 0) {
      return NextResponse.json({ success: false, message: 'ไม่พบ Token ใดๆ สำหรับส่งแจ้งเตือน' });
    }

    // 3. ยิงแจ้งเตือนแบบ Data-Only
    const response = await admin.messaging().sendEachForMulticast({ 
      tokens: tokens,
      android: {
        priority: 'high', 
      },
      data: {
        title: 'มีออเดอร์ใหม่!',
        body: message || 'กรุณาตรวจสอบหน้าจอ POS',
        type: 'NEW_ORDER' 
      }
    });

    return NextResponse.json({ success: true, response });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
}