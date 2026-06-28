alter table public.dashboard_daily_sales
  add column if not exists total_payments integer not null default 0;

-- Clear stale summary values before rebuilding from the payment source of truth.
update public.dashboard_daily_sales
set
  total_payments = 0,
  updated_at = now();

with payment_counts as (
  select
    payment.brand_id,
    (
      payment.created_at at time zone coalesce(brand.timezone, 'Asia/Bangkok')
    )::date as report_date,
    count(*)::integer as total_payments
  from public.pai_orders as payment
  join public.brands as brand
    on brand.id = payment.brand_id
  group by
    payment.brand_id,
    (
      payment.created_at at time zone coalesce(brand.timezone, 'Asia/Bangkok')
    )::date
)
insert into public.dashboard_daily_sales (
  brand_id,
  report_date,
  total_payments,
  updated_at
)
select
  brand_id,
  report_date,
  total_payments,
  now()
from payment_counts
on conflict (brand_id, report_date)
do update set
  total_payments = excluded.total_payments,
  updated_at = now();
