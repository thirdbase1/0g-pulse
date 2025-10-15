-- Create wallets table to store wallet information and metrics
CREATE TABLE IF NOT EXISTS wallets (
  address TEXT PRIMARY KEY,
  spendable_token_balance NUMERIC DEFAULT 0,
  native_token_balance NUMERIC DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  total_received NUMERIC DEFAULT 0,
  total_gas_fees NUMERIC DEFAULT 0,
  last_activity TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table to store all wallet transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES wallets(address) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'sent' or 'received'
  amount NUMERIC NOT NULL,
  token_address TEXT NOT NULL,
  gas_fee NUMERIC DEFAULT 0,
  to_address TEXT,
  from_address TEXT,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create daily_metrics table for 30-day graphs
CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES wallets(address) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_spent NUMERIC DEFAULT 0,
  total_received NUMERIC DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  gas_fees NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, date)
);

-- Create token_holdings table for top 4 tokens
CREATE TABLE IF NOT EXISTS token_holdings (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES wallets(address) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, token_address)
);

-- Create contract_interactions table
CREATE TABLE IF NOT EXISTS contract_interactions (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES wallets(address) ON DELETE CASCADE,
  contract_address TEXT NOT NULL,
  interaction_count INTEGER DEFAULT 1,
  last_interaction TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, contract_address)
);

-- Create frequent_recipients table
CREATE TABLE IF NOT EXISTS frequent_recipients (
  id SERIAL PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES wallets(address) ON DELETE CASCADE,
  recipient_address TEXT NOT NULL,
  send_count INTEGER DEFAULT 0,
  total_amount_sent NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(wallet_address, recipient_address)
);

-- Create network_metrics table for aggregate statistics
CREATE TABLE IF NOT EXISTS network_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_wallets INTEGER DEFAULT 0,
  daily_active_wallets INTEGER DEFAULT 0,
  total_transaction_volume NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_wallet ON daily_metrics(wallet_address);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_token_holdings_wallet ON token_holdings(wallet_address);
CREATE INDEX IF NOT EXISTS idx_contract_interactions_wallet ON contract_interactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_frequent_recipients_wallet ON frequent_recipients(wallet_address);

-- Note: RLS is not enabled for this analytics platform as it's public data
-- If user authentication is needed later, we can add RLS policies
