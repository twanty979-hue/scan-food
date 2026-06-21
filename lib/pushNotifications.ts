import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

type ProfilePushOptions = {
  profileIds: string[];
  title: string;
  message: string;
  type: string;
  data?: Record<string, string>;
};

export async function sendProfilePush({
  profileIds,
  title,
  message,
  type,
  data = {},
}: ProfilePushOptions) {
  try {
    const uniqueProfileIds = [...new Set(profileIds.filter(Boolean))];
    if (uniqueProfileIds.length === 0) return { success: false, reason: 'no_recipients' };

    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('fcm_token, fcm_token_web')
      .in('id', uniqueProfileIds);

    if (error) throw error;

    const tokens = [
      ...new Set(
        (profiles || [])
          .flatMap((profile) => [profile.fcm_token, profile.fcm_token_web])
          .filter(Boolean) as string[],
      ),
    ];

    if (tokens.length === 0) return { success: false, reason: 'no_tokens' };

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body: message },
      android: {
        priority: 'high',
        notification: {
          channelId: 'general_notifications',
          priority: 'high',
          sound: 'default',
          defaultVibrateTimings: true,
        },
      },
      apns: { payload: { aps: { sound: 'default' } } },
      webpush: { notification: { title, body: message } },
      data: {
        title,
        body: message,
        type,
        ...data,
      },
    });

    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('Failed to send profile push notification:', error);
    return { success: false, reason: 'send_failed' };
  }
}
