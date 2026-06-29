import 'server-only';
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

type NotificationInput = {
  brandId: string;
  message?: string;
  type?: string;
  title?: string;
  orderData?: unknown;
  excludeToken?: string | string[];
};

const db = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

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

export async function sendBrandNotification(input: NotificationInput) {
  const {
    brandId,
    message,
    type = 'NEW_ORDER',
    title = 'มีออเดอร์ใหม่!',
    orderData,
    excludeToken,
  } = input;
  if (!brandId) throw new Error('Missing brandId');

  const client = db();
  const [{ data: tokenRows, error: tokenError }, { data: profiles, error: profileError }] =
    await Promise.all([
      client.from('profile_fcm_tokens').select('token').eq('brand_id', brandId),
      client
        .from('profiles')
        .select('fcm_token, fcm_token_web')
        .eq('brand_id', brandId),
    ]);

  if (tokenError && profileError) throw tokenError;

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
    return { success: false, sent: 0, failed: 0, totalTokens: 0 };
  }

  const isSilentSync = type === 'ORDER_PAID';
  const notificationData: Record<string, string> = {
    title,
    body: message || 'กรุณาตรวจสอบหน้าจอ POS',
    type,
    brandId,
  };
  if (orderData) {
    notificationData.orderData =
      typeof orderData === 'string' ? orderData : JSON.stringify(orderData);
  }

  const invalidTokens: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (const tokenChunk of chunk(tokens, 500)) {
    const payload: admin.messaging.MulticastMessage = {
      tokens: tokenChunk,
      android: { priority: 'high' },
      apns: {
        headers: isSilentSync
          ? { 'apns-push-type': 'background', 'apns-priority': '5' }
          : undefined,
        payload: {
          aps: isSilentSync
            ? { 'content-available': 1 }
            : { sound: 'default' },
        },
      },
      data: notificationData,
    };

    if (!isSilentSync) {
      payload.notification = {
        title,
        body: notificationData.body,
      };
      payload.android = {
        priority: 'high',
        notification: {
          channelId: 'orders_urgent_v3',
          priority: 'high',
          sound: 'foodscan_order',
          defaultVibrateTimings: true,
        },
      };
      payload.webpush = {
        notification: {
          title,
          body: notificationData.body,
        },
      };
    }

    const response = await admin.messaging().sendEachForMulticast(payload);
    successCount += response.successCount;
    failureCount += response.failureCount;
    response.responses.forEach((result, index) => {
      if (!result.success && isInvalidFcmToken(result.error)) {
        invalidTokens.push(tokenChunk[index]);
      }
    });
  }

  if (invalidTokens.length > 0) {
    await client
      .from('profile_fcm_tokens')
      .delete()
      .in('token', [...new Set(invalidTokens)]);
  }

  return {
    success: true,
    sent: successCount,
    failed: failureCount,
    totalTokens: tokens.length,
    invalidTokensRemoved: [...new Set(invalidTokens)].length,
    silent: isSilentSync,
  };
}
