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
    const {
      brandId,
      message,
      type = 'NEW_ORDER',
      title = 'มีออเดอร์ใหม่!',
      orderData,
    } = await request.json();

    const notificationTitle = String(title || 'มีออเดอร์ใหม่!');
    const notificationBody = String(message || 'กรุณาตรวจสอบหน้าจอ POS');

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('fcm_token, fcm_token_web')
      .eq('brand_id', brandId);

    if (error || !profiles || profiles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบข้อมูลพนักงาน',
      });
    }

    const tokens = [
      ...new Set(
        profiles
          .flatMap((profile) => [profile.fcm_token, profile.fcm_token_web])
          .filter(Boolean) as string[],
      ),
    ];

    if (tokens.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบ Token ใดๆ สำหรับส่งแจ้งเตือน',
      });
    }

    const notificationData: { [key: string]: string } = {
      title: notificationTitle,
      body: notificationBody,
      type: String(type),
    };

    if (orderData) {
      notificationData.orderData =
        typeof orderData === 'string' ? orderData : JSON.stringify(orderData);
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'orders_urgent_v3',
          priority: 'high',
          sound: 'foodscan_order',
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      webpush: {
        notification: {
          title: notificationTitle,
          body: notificationBody,
        },
      },
      data: notificationData,
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 },
    );
  }
}
