-- =========================================================================
-- 1. อัปเดตตาราง Payment Stats ให้รวม "CASH" และ "cash" เป็นอันเดียวกัน
-- =========================================================================
WITH payment_counts AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date as report_date,
    LOWER(payment.payment_method) as payment_method_lower,
    COUNT(*)::integer as total_payments
  FROM public.pai_orders as payment
  JOIN public.brands as brand ON brand.id = payment.brand_id
  GROUP BY payment.brand_id, (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date, LOWER(payment.payment_method)
)
UPDATE public.dashboard_payment_stats d
SET total_payments = pc.total_payments, updated_at = now()
FROM payment_counts pc
WHERE d.brand_id = pc.brand_id AND d.report_date = pc.report_date AND LOWER(d.payment_method) = pc.payment_method_lower;

-- =========================================================================
-- 2. เพิ่มคอลัมน์ total_payments ให้ตาราง Table Stats
-- =========================================================================
ALTER TABLE public.dashboard_table_stats ADD COLUMN IF NOT EXISTS total_payments integer not null default 0;

-- เคลียร์ของเก่าเพื่อคำนวณใหม่
UPDATE public.dashboard_table_stats SET total_payments = 0;

-- Backfill ข้อมูล Table Stats จากตาราง pai_orders
WITH table_counts AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date as report_date,
    o.type as order_type,
    o.table_label,
    COUNT(*)::integer as total_payments
  FROM public.pai_orders as payment
  JOIN public.brands as brand ON brand.id = payment.brand_id
  JOIN public.orders as o ON o.id = payment.order_id
  GROUP BY payment.brand_id, (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date, o.type, o.table_label
)
UPDATE public.dashboard_table_stats d
SET total_payments = tc.total_payments, updated_at = now()
FROM table_counts tc
WHERE d.brand_id = tc.brand_id AND d.report_date = tc.report_date 
  AND d.order_type = tc.order_type AND d.table_label = tc.table_label;


-- =========================================================================
-- 3. อัปเดตฟังก์ชัน Trigger ตัวเก่า ให้ครอบคลุม Table Stats ด้วย
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
  v_order_type text;
  v_table_label text;
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

  -- 4. Table Stats (ดึงข้อมูลโต๊ะจากตาราง orders)
  SELECT type, table_label INTO v_order_type, v_table_label
  FROM public.orders WHERE id = NEW.order_id;
  
  IF v_order_type IS NOT NULL THEN
    INSERT INTO public.dashboard_table_stats (
      brand_id, report_date, order_type, table_label, total_revenue, total_payments, updated_at
    ) VALUES (
      NEW.brand_id, v_report_date, v_order_type, COALESCE(v_table_label, ''), 0, 1, now()
    )
    ON CONFLICT (brand_id, report_date, order_type, table_label)
    DO UPDATE SET
      total_payments = dashboard_table_stats.total_payments + 1,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$function$;
