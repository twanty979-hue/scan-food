-- =========================================================================
-- 1. อัปเดต Trigger ให้กลับมาดึงข้อมูลลงตาราง dashboard_product_stats (เมนูขายดี)
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
  item record;
BEGIN
  IF NEW.brand_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT timezone INTO v_timezone FROM public.brands WHERE id = NEW.brand_id;
  IF v_timezone IS NULL THEN v_timezone := 'Asia/Bangkok'; END IF;

  v_local_time := NEW.created_at AT TIME ZONE v_timezone;
  v_report_date := v_local_time::date;
  v_report_hour := extract(hour from v_local_time)::integer;

  -- 1. Hourly Sales
  INSERT INTO public.dashboard_hourly_sales (brand_id, report_date, report_hour, total_revenue, total_payments, updated_at) 
  VALUES (NEW.brand_id, v_report_date, v_report_hour, NEW.total_amount, 1, now())
  ON CONFLICT (brand_id, report_date, report_hour)
  DO UPDATE SET
    total_revenue = dashboard_hourly_sales.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_hourly_sales.total_payments + 1,
    updated_at = now();

  -- 2. Payment Stats
  INSERT INTO public.dashboard_payment_stats (brand_id, report_date, payment_method, total_revenue, total_payments, updated_at) 
  VALUES (NEW.brand_id, v_report_date, LOWER(NEW.payment_method), NEW.total_amount, 1, now())
  ON CONFLICT (brand_id, report_date, payment_method)
  DO UPDATE SET
    total_revenue = dashboard_payment_stats.total_revenue + EXCLUDED.total_revenue,
    total_payments = dashboard_payment_stats.total_payments + 1,
    updated_at = now();

  -- 3. Cashier Stats
  IF NEW.cashier_id IS NOT NULL THEN
    INSERT INTO public.dashboard_cashier_stats (brand_id, report_date, cashier_id, total_revenue, total_payments, updated_at) 
    VALUES (NEW.brand_id, v_report_date, NEW.cashier_id, NEW.total_amount, 1, now())
    ON CONFLICT (brand_id, report_date, cashier_id)
    DO UPDATE SET
      total_revenue = dashboard_cashier_stats.total_revenue + EXCLUDED.total_revenue,
      total_payments = dashboard_cashier_stats.total_payments + 1,
      updated_at = now();
  END IF;

  -- 4. Table Stats
  SELECT type, table_label INTO v_order_type, v_table_label
  FROM public.orders WHERE id = NEW.order_id;
  
  IF v_order_type IS NOT NULL THEN
    INSERT INTO public.dashboard_table_stats (brand_id, report_date, order_type, table_label, total_revenue, total_payments, updated_at) 
    VALUES (NEW.brand_id, v_report_date, v_order_type, COALESCE(v_table_label, ''), NEW.total_amount, 1, now())
    ON CONFLICT (brand_id, report_date, order_type, table_label)
    DO UPDATE SET
      total_revenue = dashboard_table_stats.total_revenue + EXCLUDED.total_revenue,
      total_payments = dashboard_table_stats.total_payments + 1,
      updated_at = now();
  END IF;

  -- 5. Product Stats (เมนูขายดี)
  FOR item IN 
    SELECT product_id, product_name, quantity, price, discount
    FROM public.order_items
    WHERE order_id = NEW.order_id
  LOOP
    INSERT INTO public.dashboard_product_stats (
      brand_id, report_date, product_id, product_name, total_quantity, total_revenue, updated_at
    ) VALUES (
      NEW.brand_id, 
      v_report_date, 
      item.product_id, 
      COALESCE(item.product_name, 'Unknown'), 
      item.quantity, 
      (item.quantity * item.price) - COALESCE(item.discount, 0), 
      now()
    )
    ON CONFLICT (brand_id, report_date, product_id)
    DO UPDATE SET
      total_quantity = dashboard_product_stats.total_quantity + EXCLUDED.total_quantity,
      total_revenue = dashboard_product_stats.total_revenue + EXCLUDED.total_revenue,
      updated_at = now();
  END LOOP;

  RETURN NEW;
END;
$function$;

-- =========================================================================
-- 2. Backfill: สรุปข้อมูลเมนูขายดีใหม่ทั้งหมด (เพื่อดึงยอดที่หายไปในช่วงที่ผ่านมากลับมา)
-- =========================================================================
-- รีเซ็ตค่าเดิมให้เป็น 0 ก่อน เพื่อป้องกันยอดซ้ำซ้อน
UPDATE public.dashboard_product_stats SET total_quantity = 0, total_revenue = 0;

WITH product_counts AS (
  SELECT
    payment.brand_id,
    (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date as report_date,
    item.product_id,
    MAX(item.product_name) as product_name,
    SUM(item.quantity)::integer as total_qty,
    SUM((item.quantity * item.price) - COALESCE(item.discount, 0)) as total_rev
  FROM public.pai_orders as payment
  JOIN public.brands as brand ON brand.id = payment.brand_id
  JOIN public.order_items as item ON item.order_id = payment.order_id
  GROUP BY payment.brand_id, (payment.created_at AT TIME ZONE COALESCE(brand.timezone, 'Asia/Bangkok'))::date, item.product_id
)
INSERT INTO public.dashboard_product_stats (
  brand_id, report_date, product_id, product_name, total_quantity, total_revenue, updated_at
)
SELECT 
  brand_id, report_date, product_id, COALESCE(product_name, 'Unknown'), total_qty, total_rev, now()
FROM product_counts
ON CONFLICT (brand_id, report_date, product_id)
DO UPDATE SET
  total_quantity = EXCLUDED.total_quantity,
  total_revenue = EXCLUDED.total_revenue,
  product_name = EXCLUDED.product_name,
  updated_at = now();

-- ลบรายการที่เป็น 0 ทิ้งเพื่อประหยัดพื้นที่ฐานข้อมูล
DELETE FROM public.dashboard_product_stats WHERE total_quantity = 0 AND total_revenue = 0;
