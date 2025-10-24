-- Add missing trading columns if they don't exist
ALTER TABLE trades
ADD COLUMN IF NOT EXISTS entry_price numeric(18,6),
ADD COLUMN IF NOT EXISTS exit_price numeric(18,6),
ADD COLUMN IF NOT EXISTS stop_loss numeric(18,6),
ADD COLUMN IF NOT EXISTS take_profit numeric(18,6),
ADD COLUMN IF NOT EXISTS leverage integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS lot_size numeric(18,6) DEFAULT 0.01,
ADD COLUMN IF NOT EXISTS profit_loss numeric(18,6) DEFAULT 0,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'open',
ADD COLUMN IF NOT EXISTS market_type text,
ADD COLUMN IF NOT EXISTS trade_type text,
ADD COLUMN IF NOT EXISTS symbol text,
ADD COLUMN IF NOT EXISTS closed_at timestamptz;

