-- Seed historical network metrics data for charts
-- This creates 30 days of sample data based on current wallet data

INSERT INTO network_metrics (
  date,
  total_wallets,
  daily_active_wallets,
  total_transaction_volume,
  total_transactions
)
SELECT 
  (CURRENT_DATE - (n || ' days')::interval)::date as date,
  GREATEST(1, (SELECT COUNT(*) FROM wallets) - FLOOR(RANDOM() * 3)::int) as total_wallets,
  GREATEST(0, FLOOR(RANDOM() * (SELECT COUNT(*) FROM wallets) + 1)::int) as daily_active_wallets,
  GREATEST(0, (SELECT COALESCE(SUM(total_spent + total_received), 0) FROM wallets) * (0.7 + RANDOM() * 0.6)) as total_transaction_volume,
  GREATEST(0, (SELECT COALESCE(SUM(total_transactions), 0) FROM wallets) * (0.7 + RANDOM() * 0.6))::int as total_transactions
FROM generate_series(0, 29) as n
ON CONFLICT (date) DO UPDATE SET
  total_wallets = EXCLUDED.total_wallets,
  daily_active_wallets = EXCLUDED.daily_active_wallets,
  total_transaction_volume = EXCLUDED.total_transaction_volume,
  total_transactions = EXCLUDED.total_transactions;
