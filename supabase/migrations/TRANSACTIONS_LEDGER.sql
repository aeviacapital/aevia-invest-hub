CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount numeric(24,8) NOT NULL,
  balance_after numeric(24,8),            -- optional snapshot after txn
  type text NOT NULL,                     -- deposit, withdrawal, trade_open, trade_close, investment_debit, investment_credit, referral, admin_adjustment, etc.
  reference text,                         -- external reference / order id
  metadata jsonb DEFAULT '{}'::jsonb,     -- arbitrary extra data
  status text NOT NULL DEFAULT 'completed', -- pending, completed, failed, reversed
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);

