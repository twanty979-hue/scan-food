// app/api/send-notification/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

function createDbClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey);
}

function uniqueTokens(tokens: unknown[], excludedTokens: Set<string>) {
  return [
    ...new Set(
      tokens
        .filter(Boolean)
        .map((token) => String(token).trim())
        .filter((token) => token && !excludedTokens.has(token)),
    ),
  ];
}

function isInvalidFcmToken(error?: { code?: string }) {
  const code = error?.code || '';
  return (
    code === 'messaging/invalid-registration-token' ||
    code === 'messaging/registration-token-not-registered' ||
    code === 'messaging/invalid-argument'
  );
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export async function POST(request: Request) {
  try {
    const {
      brandId,
      message,
      type = 'NEW_ORDER',
      title = 'มีออเดอร์ใหม่!',
      orderData,
      excludeToken,
    } = await request.json();

    if (!brandId) {
      return NextResponse.json(
        { success: false, message: 'Missing brandId' },
        { status: 400 },
      );
    }

    const notificationTitle = String(title || 'มีออเดอร์ใหม่!');
    const notificationBody = String(
      message || 'กรุณาตรวจสอบหน้าจอ POS',
    );

    const db = createDbClient();
    const [{ data: tokenRows, error: tokenError }, { data: profiles, error: profileError }] =
      await Promise.all([
        db
          .from('profile_fcm_tokens')
          .select('token')
          .eq('brand_id', brandId),
        db
          .from('profiles')
          .select('fcm_token, fcm_token_web')
          .eq('brand_id', brandId),
      ]);

    if (tokenError && profileError) {
      throw tokenError;
    }

    const excludedTokens = new Set(
      [excludeToken]
        .flat()
        .filter(Boolean)
        .map((token) => String(token)),
    );

    const tokens = uniqueTokens(
      [
        ...(tokenRows || []).map((row) => row.token),
        ...(profiles || []).flatMap((profile) => [
          profile.fcm_token,
          profile.fcm_token_web,
        ]),
      ],
      excludedTokens,
    );

    if (tokens.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'ไม่พบ Token สำหรับส่งแจ้งเตือน',
      });
    }

    const notificationData: { [key: string]: string } = {
      title: notificationTitle,
      body: notificationBody,
      type: String(type),
      brandId: String(brandId),
    };

    if (orderData) {
      notificationData.orderData =
        typeof orderData === 'string' ? orderData : JSON.stringify(orderData);
    }

    const isSilentSync = String(type) === 'ORDER_PAID';
    const invalidTokens: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const tokenChunk of chunk(tokens, 500)) {
      const messagePayload: admin.messaging.MulticastMessage = {
        tokens: tokenChunk,
        android: { priority: 'high' },
        apns: {
          headers: isSilentSync
            ? {
                'apns-push-type': 'background',
                'apns-priority': '5',
              }
            : undefined,
          payload: {
            aps: {
              ...(isSilentSync
                ? { 'content-available': 1 }
                : { sound: 'default' }),
            },
          },
        },
        data: notificationData,
      };

      if (!isSilentSync) {
        messagePayload.notification = {
          title: notificationTitle,
          body: notificationBody,
        };
        messagePayload.android = {
          priority: 'high',
          notification: {
            channelId: 'orders_urgent_v3',
            priority: 'high',
            sound: 'foodscan_order',
            defaultVibrateTimings: true,
          },
        };
        messagePayload.webpush = {
          notification: {
            title: notificationTitle,
            body: notificationBody,
          },
        };
      }

      const response = await admin
        .messaging()
        .sendEachForMulticast(messagePayload);

      successCount += response.successCount;
      failureCount += response.failureCount;

      response.responses.forEach((result, index) => {
        if (!result.success && isInvalidFcmToken(result.error)) {
          invalidTokens.push(tokenChunk[index]);
        }
      });
    }

    if (invalidTokens.length > 0) {
      await db
        .from('profile_fcm_tokens')
        .delete()
        .in('token', [...new Set(invalidTokens)]);
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      invalidTokensRemoved: [...new Set(invalidTokens)].length,
      totalTokens: tokens.length,
      silent: isSilentSync,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 },
    );
  }
}
