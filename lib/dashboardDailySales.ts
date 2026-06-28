import type { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

type DailyPaymentScope = {
  brandId: string;
  paymentCreatedAt: string;
};

export async function rebuildDashboardDailyPaymentCount(
  supabase: SupabaseClient,
  scope: DailyPaymentScope,
) {
  const { data: brand, error: brandError } = await supabase
    .from('brands')
    .select('timezone')
    .eq('id', scope.brandId)
    .maybeSingle();

  if (brandError) throw brandError;

  const brandTimezone = brand?.timezone || 'Asia/Bangkok';
  const reportDate = dayjs(scope.paymentCreatedAt)
    .tz(brandTimezone)
    .format('YYYY-MM-DD');
  const startUtc = dayjs.tz(reportDate, brandTimezone)
    .startOf('day')
    .utc()
    .toISOString();
  const endUtc = dayjs.tz(reportDate, brandTimezone)
    .add(1, 'day')
    .startOf('day')
    .utc()
    .toISOString();

  const { count, error: countError } = await supabase
    .from('pai_orders')
    .select('id', { count: 'exact', head: true })
    .eq('brand_id', scope.brandId)
    .gte('created_at', startUtc)
    .lt('created_at', endUtc);

  if (countError) throw countError;

  const { error: updateError } = await supabase
    .from('dashboard_daily_sales')
    .upsert(
      {
        brand_id: scope.brandId,
        report_date: reportDate,
        total_payments: count || 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'brand_id,report_date' },
    );

  if (updateError) throw updateError;
}
