// app/api/webhooks/beam/theme-handler.ts
import dayjs from 'dayjs';

export async function handleBuyTheme(supabaseAdmin: any, charge: any, metadata: any) {
  const { brand_id, theme_id } = metadata;
  let plan = metadata.plan || metadata.period;

  if (!plan) {
    const { data: fallbackLog } = await supabaseAdmin
      .from('payment_logs')
      .select('period')
      .eq('charge_id', charge.id)
      .single();

    if (fallbackLog?.period) plan = fallbackLog.period;
  }

  let daysToAdd = 0;
  let isValidPlan = true;
  let errorMessage: string | null = null;

  switch (plan) {
    case 'weekly':
      daysToAdd = 7;
      break;
    case 'monthly':
      daysToAdd = 30;
      break;
    case 'yearly':
      daysToAdd = 365;
      break;
    default:
      isValidPlan = false;
      errorMessage = `Invalid theme plan received: ${plan || 'missing'}`;
      console.error('[Beam Theme]', errorMessage);
  }

  await supabaseAdmin
    .from('payment_logs')
    .update({
      status: isValidPlan ? 'successful' : 'requires_action',
      payment_method: charge.payment_method || 'beam_checkout',
      type: 'buy_theme',
      plan_detail: theme_id,
      period: plan || 'unknown_missing',
      error_message: errorMessage,
    })
    .eq('charge_id', charge.id);

  if (!isValidPlan) return;

  const { data: existing } = await supabaseAdmin
    .from('themes')
    .select('expires_at')
    .eq('brand_id', brand_id)
    .eq('marketplace_theme_id', theme_id)
    .single();

  const now = dayjs();
  const baseDate = existing?.expires_at && dayjs(existing.expires_at).isAfter(now)
    ? dayjs(existing.expires_at)
    : now;
  const newExpiry = baseDate.add(daysToAdd, 'day').toISOString();

  const { error: upsertError } = await supabaseAdmin
    .from('themes')
    .upsert(
      {
        brand_id,
        marketplace_theme_id: theme_id,
        purchase_type: plan,
        expires_at: newExpiry,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'brand_id, marketplace_theme_id' }
    );

  if (upsertError) {
    console.error('[Beam Theme] DB Update Failed:', upsertError.message);
  }
}
