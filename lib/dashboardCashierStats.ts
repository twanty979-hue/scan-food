import type { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

type CashierStatsScope = {
  brandId: string;
  cashierId: string;
  paymentCreatedAt: string;
};

export async function rebuildDashboardCashierStats(
  supabase: SupabaseClient,
  scope: CashierStatsScope,
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

  const { data: payments, error: paymentsError } = await supabase
    .from('pai_orders')
    .select('id, order_id, total_amount')
    .eq('brand_id', scope.brandId)
    .eq('cashier_id', scope.cashierId)
    .gte('created_at', startUtc)
    .lt('created_at', endUtc);

  if (paymentsError) throw paymentsError;

  const orderIds = Array.from(
    new Set((payments || []).map((payment) => payment.order_id).filter(Boolean)),
  );

  let cancelledOrderIds = new Set<string>();
  if (orderIds.length > 0) {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('brand_id', scope.brandId)
      .in('id', orderIds);

    if (ordersError) throw ordersError;
    cancelledOrderIds = new Set(
      (orders || [])
        .filter((order) => order.status === 'cancelled')
        .map((order) => String(order.id)),
    );
  }

  const completedPayments = (payments || []).filter(
    (payment) => !cancelledOrderIds.has(String(payment.order_id)),
  );

  const totalRevenue = completedPayments.reduce(
    (sum, payment) => sum + Number(payment.total_amount || 0),
    0,
  );

  const { error: statsError } = await supabase
    .from('dashboard_cashier_stats')
    .upsert(
      {
        brand_id: scope.brandId,
        report_date: reportDate,
        cashier_id: scope.cashierId,
        total_revenue: totalRevenue,
        total_orders: completedPayments.length,
        cancelled_bills: (payments || []).length - completedPayments.length,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'brand_id,report_date,cashier_id' },
    );

  if (statsError) throw statsError;
}
