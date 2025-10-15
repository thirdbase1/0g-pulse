-- Create token_metadata table for caching token information
CREATE TABLE IF NOT EXISTS token_metadata (
  mint_address TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimals INTEGER DEFAULT 9,
  logo_uri TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_token_metadata_mint ON token_metadata(mint_address);
