-- Create or replace the RPC function to update a user's wallet balance
create or replace function public.update_wallet_balance(
  p_user_id uuid,
  p_new_balance numeric
)
returns void
language plpgsql
as $$
begin
  update wallets
  set balance = p_new_balance,
      updated_at = now()
  where user_id = p_user_id;
end;
$$;

