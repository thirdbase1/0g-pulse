-- Add columns for wallet metadata and caching
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS first_transaction_date TIMESTAMP;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS wallet_age_days INTEGER DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_volume NUMERIC DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS net_balance NUMERIC DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS active_days INTEGER DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS inactive_days INTEGER DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS rank_position INTEGER;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS rank_title TEXT;

-- Add token metadata table for caching real token names
CREATE TABLE IF NOT EXISTS token_metadata (
  address TEXT PRIMARY KEY,
  name TEXT,
  symbol TEXT,
  decimals INTEGER,
  logo_uri TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add wallet processing queue for background jobs
CREATE TABLE IF NOT EXISTS wallet_processing_queue (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_wallet_processing_status ON wallet_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_wallet_processing_priority ON wallet_processing_queue(priority DESC);
CREATE INDEX IF NOT EXISTS idx_token_metadata_updated ON token_metadata(updated_at);
