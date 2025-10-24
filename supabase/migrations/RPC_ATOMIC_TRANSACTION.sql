-- Function: create_transaction_atomic
-- Purpose: Safely insert a transaction and update wallet balance atomically

CREATE OR REPLACE FUNCTION public.create_transaction_atomic(
  p_user_id uuid,
  p_wallet_id uuid,
  p_amount numeric,
  p_type text,
  p_reference text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) 
RETURNS TABLE(tx_id uuid, new_balance numeric) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance numeric;
  v_tx_id uuid;
BEGIN
  -- Lock the wallet row to prevent race conditions
  SELECT balance INTO v_new_balance 
  FROM wallets 
  WHERE id = p_wallet_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found: %', p_wallet_id;
  END IF;

  -- Calculate the new balance
  v_new_balance := v_new_balance + p_amount;

  -- Insert the transaction record
  INSERT INTO transactions (
    user_id, wallet_id, amount, balance_after, type, reference, metadata, status
  )
  VALUES (
    p_user_id, p_wallet_id, p_amount, v_new_balance, p_type, p_reference, p_metadata, 'completed'
  )
  RETURNING id INTO v_tx_id;

  -- Update the wallet balance
  UPDATE wallets
  SET balance = v_new_balance, updated_at = now()
  WHERE id = p_wallet_id;

  tx_id := v_tx_id;
  new_balance := v_new_balance;
  RETURN NEXT;
END;
$$;

