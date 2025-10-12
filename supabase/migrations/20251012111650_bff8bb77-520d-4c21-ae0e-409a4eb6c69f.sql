-- Grant admin role to the specified email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'aeviacapital6@gmail.com'
ON CONFLICT DO NOTHING;

-- Add real-time trading simulation fields to trades table
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS current_price numeric DEFAULT 0;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS unrealized_pnl numeric DEFAULT 0;
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS margin_used numeric DEFAULT 0;

-- Create a function to update realtime price (admin controlled)
CREATE OR REPLACE FUNCTION public.update_trade_price(
  trade_id uuid,
  new_current_price numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trade_record RECORD;
  price_diff numeric;
  new_pnl numeric;
BEGIN
  SELECT * INTO trade_record FROM trades WHERE id = trade_id;
  
  IF trade_record.trade_type = 'buy' THEN
    price_diff := new_current_price - trade_record.entry_price;
  ELSE
    price_diff := trade_record.entry_price - new_current_price;
  END IF;
  
  new_pnl := price_diff * trade_record.lot_size * trade_record.leverage;
  
  UPDATE trades
  SET 
    current_price = new_current_price,
    unrealized_pnl = new_pnl
  WHERE id = trade_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_trade_price TO authenticated;