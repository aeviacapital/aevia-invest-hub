-- Function: admin_adjust_balance
-- Purpose: Allow admin to credit/debit a user wallet safely

CREATE OR REPLACE FUNCTION public.admin_adjust_balance(
  p_user_id uuid,
  p_amount numeric,
  p_reason text,
  p_reference text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(tx_id uuid, new_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id uuid;
BEGIN
  -- Find and lock wallet for this user
  SELECT id INTO v_wallet_id 
  FROM wallets 
  WHERE user_id = p_user_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No wallet found for user %', p_user_id;
  END IF;

  -- Use atomic transaction function to create a new adjustment record
  RETURN QUERY
  SELECT * 
  FROM create_transaction_atomic(
    p_user_id,
    v_wallet_id,
    p_amount,
    'admin_adjustment',
    p_reference,
    jsonb_build_object('reason', p_reason)
  );
END;
$$;

