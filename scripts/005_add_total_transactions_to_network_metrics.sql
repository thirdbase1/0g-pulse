-- Add total_transactions column to network_metrics table
ALTER TABLE network_metrics 
ADD COLUMN IF NOT EXISTS total_transactions INTEGER DEFAULT 0;

-- Update existing records to calculate total transactions from wallets
UPDATE network_metrics nm
SET total_transactions = (
  SELECT COALESCE(SUM(w.total_transactions), 0)
  FROM wallets w
);
