-- 1. อัปเดต Trigger ให้บันทึกการชำระเงินเป็นตัวเล็กเสมอ ป้องกันการเบิ้ล (CASH vs cash)
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

  SELECT timezone INTO v_timezone FROM public.brands WHERE id = NEW.brand_id;
  IF v_timezone IS NULL THEN v_timezone := 'Asia/Bangkok'; END IF;

  v_local_time := NEW.created_at AT TIME ZONE v_timezone;
  v_report_date := v_local_time::date;
  v_report_hour := extract(hour from v_local_time)::integer;

  -- Hourly Sales
  INSERT INTO public.dashboard_hourly_sales (brand_id, report_date, report_hour, total_revenue, total_payments, updated_at) 
  VALUES (NEW.brand_id, v_report_date, v_report_hour, NEW.total_amount, 1, now())
  ON CONFLICT (brand_id, report_date, report_hour)
  DO UPDATE SET
    total_revenue = dashboard_hourly_sales.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_hourly_sales.total_payments + 1,
    updated_at = now();

  -- Payment Stats (ใช้ LOWER(NEW.payment_method) เสมอ)
  INSERT INTO public.dashboard_payment_stats (brand_id, report_date, payment_method, total_revenue, total_payments, updated_at) 
  VALUES (NEW.brand_id, v_report_date, LOWER(NEW.payment_method), NEW.total_amount, 1, now())
  ON CONFLICT (brand_id, report_date, payment_method)
  DO UPDATE SET
    total_revenue = dashboard_payment_stats.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_payment_stats.total_payments + 1,
    updated_at = now();

  -- Cashier Stats
  IF NEW.cashier_id IS NOT NULL THEN
    INSERT INTO public.dashboard_cashier_stats (brand_id, report_date, cashier_id, total_revenue, total_payments, updated_at) 
    VALUES (NEW.brand_id, v_report_date, NEW.cashier_id, NEW.total_amount, 1, now())
    ON CONFLICT (brand_id, report_date, cashier_id)
    DO UPDATE SET
      total_revenue = dashboard_cashier_stats.total_revenue + EXCLUDED.total_revenue,
      total_payments = dashboard_cashier_stats.total_payments + 1,
      updated_at = now();
  END IF;

  -- Table Stats
  SELECT type, table_label INTO v_order_type, v_table_label
  FROM public.orders WHERE id = NEW.order_id;
  
  IF v_order_type IS NOT NULL THEN
    INSERT INTO public.dashboard_table_stats (brand_id, report_date, order_type, table_label, total_revenue, total_payments, updated_at) 
    VALUES (NEW.brand_id, v_report_date, v_order_type, COALESCE(v_table_label, ''), 0, 1, now())
    ON CONFLICT (brand_id, report_date, order_type, table_label)
    DO UPDATE SET
      total_payments = dashboard_table_stats.total_payments + 1,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$function$;


-- 2. รวบรวมข้อมูลรายได้และจำนวนบิลที่ซ้ำซ้อนกัน (เช่น CASH และ cash) มารวมกัน
WITH duplicate_stats AS (
  SELECT
    brand_id, report_date, LOWER(payment_method) as method,
    SUM(total_revenue) as sum_rev, MAX(total_payments) as max_payments, SUM(total_orders) as sum_orders
  FROM public.dashboard_payment_stats
  GROUP BY brand_id, report_date, LOWER(payment_method)
  HAVING COUNT(*) > 1
)
UPDATE public.dashboard_payment_stats d
SET 
  total_revenue = ds.sum_rev,
  total_orders = ds.sum_orders,
  total_payments = ds.max_payments,
  updated_at = now()
FROM duplicate_stats ds
WHERE d.brand_id = ds.brand_id AND d.report_date = ds.report_date AND d.payment_method = ds.method;


-- 3. ลบแถวที่เป็นตัวพิมพ์ใหญ่ที่ถูกรวมไปแล้วทิ้ง (ลบตัวซ้ำ)
DELETE FROM public.dashboard_payment_stats WHERE payment_method != LOWER(payment_method);
