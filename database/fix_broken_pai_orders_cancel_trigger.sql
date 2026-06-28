-- Cancellation status belongs to orders, not pai_orders.
-- This trigger calls NEW.status on pai_orders, which has no status column and
-- causes idempotent POS sync retries to fail with PostgreSQL error 42703.
drop trigger if exists trigger_sync_cancelled_dashboard_stats
on public.pai_orders;
