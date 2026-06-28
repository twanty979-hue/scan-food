-- 1. เพิ่มคอลัมน์ total_payments ลงในตาราง Advanced Dashboard
ALTER TABLE public.dashboard_cashier_stats ADD COLUMN IF NOT EXISTS total_payments integer not null default 0;
ALTER TABLE public.dashboard_hourly_sales ADD COLUMN IF NOT EXISTS total_payments integer not null default 0;
ALTER TABLE public.dashboard_payment_stats ADD COLUMN IF NOT EXISTS total_payments integer not null default 0;

-- 2. Backfill: รีเซ็ตข้อมูล total_payments เป็น 0 ก่อนคำนวณใหม่
UPDATE public.dashboard_cashier_stats SET total_payments = 0;
UPDATE public.dashboard_hourly_sales SET total_payments = 0;
UPDATE public.dashboard_payment_stats SET total_payments = 0;

-- 3. Backfill: คำนวณจำนวน total_payments ย้อนหลังสำหรับ Cashier Stats
WITH payment_counts AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date as report_date,
    payment.cashier_id,
    COUNT(*)::integer as total_payments
  FROM public.pai_orders as payment
  JOIN public.brands as brand ON brand.id = payment.brand_id
  WHERE payment.cashier_id IS NOT NULL
  GROUP BY payment.brand_id, (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date, payment.cashier_id
)
UPDATE public.dashboard_cashier_stats d
SET total_payments = pc.total_payments, updated_at = now()
FROM payment_counts pc
WHERE d.brand_id = pc.brand_id AND d.report_date = pc.report_date AND d.cashier_id = pc.cashier_id;

-- 4. Backfill: คำนวณจำนวน total_payments ย้อนหลังสำหรับ Hourly Sales
WITH payment_counts AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date as report_date,
    EXTRACT(HOUR FROM (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok')))::integer as report_hour,
    COUNT(*)::integer as total_payments
  FROM public.pai_orders as payment
  JOIN public.brands as brand ON brand.id = payment.brand_id
  GROUP BY payment.brand_id, (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date, EXTRACT(HOUR FROM (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok')))
)
UPDATE public.dashboard_hourly_sales d
SET total_payments = pc.total_payments, updated_at = now()
FROM payment_counts pc
WHERE d.brand_id = pc.brand_id AND d.report_date = pc.report_date AND d.report_hour = pc.report_hour;

-- 5. Backfill: คำนวณจำนวน total_payments ย้อนหลังสำหรับ Payment Stats
WITH payment_counts AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date as report_date,
    payment.payment_method,
    COUNT(*)::integer as total_payments
  FROM public.pai_orders as payment
  JOIN public.brands as brand ON brand.id = payment.brand_id
  GROUP BY payment.brand_id, (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date, payment.payment_method
)
UPDATE public.dashboard_payment_stats d
SET total_payments = pc.total_payments, updated_at = now()
FROM payment_counts pc
WHERE d.brand_id = pc.brand_id AND d.report_date = pc.report_date AND d.payment_method = pc.payment_method;


-- =========================================================================
-- 6. อัปเดตฟังก์ชัน update_dashboard_stats() (Daily Dashboard)
-- สำหรับตาราง dashboard_daily_sales
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_dashboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_timezone text;
  v_report_date date;
BEGIN
  IF NEW.brand_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get brand timezone
  SELECT timezone INTO v_timezone FROM public.brands WHERE id = NEW.brand_id;
  IF v_timezone IS NULL THEN
    v_timezone := 'Asia/Bangkok';
  END IF;

  v_report_date := (NEW.created_at AT TIME ZONE v_timezone)::date;

  INSERT INTO public.dashboard_daily_sales (
    brand_id, report_date, total_revenue, total_payments, total_cash, total_transfer, updated_at
  )
  VALUES (
    NEW.brand_id,
    v_report_date,
    NEW.total_amount,
    1,
    CASE WHEN NEW.payment_method = 'cash' THEN NEW.total_amount ELSE 0 END,
    CASE WHEN NEW.payment_method = 'transfer' THEN NEW.total_amount ELSE 0 END,
    now()
  )
  ON CONFLICT (brand_id, report_date)
  DO UPDATE SET
    total_revenue = dashboard_daily_sales.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_daily_sales.total_payments + 1,
    total_cash = dashboard_daily_sales.total_cash + EXCLUDED.total_cash,
    total_transfer = dashboard_daily_sales.total_transfer + EXCLUDED.total_transfer,
    updated_at = now();

  RETURN NEW;
END;
$function$;

-- =========================================================================
-- 7. อัปเดตฟังก์ชัน sync_advanced_dashboard_stats() (Advanced Dashboard)
-- สำหรับตารางย่อย (Hourly, Payment, Cashier)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.sync_advanced_dashboard_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_timezone text;
  v_local_time timestamp;
  v_report_date date;
  v_report_hour integer;
BEGIN
  IF NEW.brand_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get brand timezone
  SELECT timezone INTO v_timezone FROM public.brands WHERE id = NEW.brand_id;
  IF v_timezone IS NULL THEN
    v_timezone := 'Asia/Bangkok';
  END IF;

  v_local_time := NEW.created_at AT TIME ZONE v_timezone;
  v_report_date := v_local_time::date;
  v_report_hour := extract(hour from v_local_time)::integer;

  -- 1. Hourly Sales
  INSERT INTO public.dashboard_hourly_sales (
    brand_id, report_date, report_hour, total_revenue, total_payments, updated_at
  ) VALUES (
    NEW.brand_id, v_report_date, v_report_hour, NEW.total_amount, 1, now()
  )
  ON CONFLICT (brand_id, report_date, report_hour)
  DO UPDATE SET
    total_revenue = dashboard_hourly_sales.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_hourly_sales.total_payments + 1,
    updated_at = now();

  -- 2. Payment Stats
  INSERT INTO public.dashboard_payment_stats (
    brand_id, report_date, payment_method, total_revenue, total_payments, updated_at
  ) VALUES (
    NEW.brand_id, v_report_date, NEW.payment_method, NEW.total_amount, 1, now()
  )
  ON CONFLICT (brand_id, report_date, payment_method)
  DO UPDATE SET
    total_revenue = dashboard_payment_stats.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_payment_stats.total_payments + 1,
    updated_at = now();

  -- 3. Cashier Stats
  IF NEW.cashier_id IS NOT NULL THEN
    INSERT INTO public.dashboard_cashier_stats (
      brand_id, report_date, cashier_id, total_revenue, total_payments, updated_at
    ) VALUES (
      NEW.brand_id, v_report_date, NEW.cashier_id, NEW.total_amount, 1, now()
    )
    ON CONFLICT (brand_id, report_date, cashier_id)
    DO UPDATE SET
      total_revenue = dashboard_cashier_stats.total_revenue + EXCLUDED.total_revenue,
      total_payments = dashboard_cashier_stats.total_payments + 1,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$function$;
