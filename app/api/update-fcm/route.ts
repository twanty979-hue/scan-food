// app/api/update-fcm/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_TOKENS_PER_PROFILE = 5;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader || '' } } },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) throw new Error('Unauthorized');

    const { fcm_token, platform = 'android', device_label } = await request.json();
    const token = String(fcm_token || '').trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing fcm_token' },
        { status: 400, headers: corsHeaders },
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const db = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : supabase;

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('id, brand_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw profileError || new Error('Profile not found');
    }

    const normalizedPlatform = String(platform || 'android').slice(0, 32);
    const normalizedDeviceLabel = device_label
      ? String(device_label).slice(0, 120)
      : null;

    const { error: tokenError } = await db.from('profile_fcm_tokens').upsert(
      {
        profile_id: user.id,
        brand_id: profile.brand_id,
        platform: normalizedPlatform,
        token,
        device_label: normalizedDeviceLabel,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'profile_id,token' },
    );

    if (tokenError) throw tokenError;

    const legacyColumn =
      normalizedPlatform.toLowerCase() === 'web' ? 'fcm_token_web' : 'fcm_token';
    await db.from('profiles').update({ [legacyColumn]: token }).eq('id', user.id);

    const { data: savedTokens, error: savedTokensError } = await db
      .from('profile_fcm_tokens')
      .select('id')
      .eq('profile_id', user.id)
      .order('last_seen_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (savedTokensError) throw savedTokensError;

    const staleIds = (savedTokens || [])
      .slice(MAX_TOKENS_PER_PROFILE)
      .map((row) => row.id);

    if (staleIds.length > 0) {
      const { error: pruneError } = await db
        .from('profile_fcm_tokens')
        .delete()
        .in('id', staleIds);

      if (pruneError) throw pruneError;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'FCM Token Updated',
        kept: Math.min(savedTokens?.length || 1, MAX_TOKENS_PER_PROFILE),
        pruned: staleIds.length,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders },
    );
  }
}
