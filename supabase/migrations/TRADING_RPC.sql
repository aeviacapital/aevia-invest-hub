-- 1) open_trade rpc: insert trade and deduct margin from wallets atomically
create or replace function public.open_trade(
  p_user_id uuid,
  p_symbol text,
  p_trade_type text,
  p_market_type text,
  p_entry_price numeric,
  p_lot_size numeric,
  p_leverage integer,
  p_stop_loss numeric,
  p_take_profit numeric
) returns table(trade_id uuid) as $$
declare
  v_trade_value numeric := p_entry_price * p_lot_size;
  v_margin numeric := v_trade_value / p_leverage;
  v_wallet_balance numeric;
  v_trade_id uuid;
begin
  select balance into v_wallet_balance from wallets where user_id = p_user_id for update;
  if not found then
    raise exception 'wallet not found for user %', p_user_id;
  end if;

  if v_wallet_balance < v_margin then
    raise exception 'insufficient balance';
  end if;

  -- deduct margin
  update wallets set balance = balance - v_margin where user_id = p_user_id;

  -- insert trade
  insert into trades (
    user_id, symbol, trade_type, market_type, entry_price, current_price,
    lot_size, leverage, margin_used, stop_loss, take_profit, unrealized_pnl, status, created_at
  ) values (
    p_user_id, p_symbol, p_trade_type, p_market_type, p_entry_price, p_entry_price,
    p_lot_size, p_leverage, v_margin, p_stop_loss, p_take_profit, 0, 'open', now()
  ) returning id into v_trade_id;

  trade_id := v_trade_id;
  return next;
end;
$$ language plpgsql security definer;

-- 2) close_trade rpc: close a trade, compute P&L, return margin + pnl to wallet atomically
create or replace function public.close_trade(
  p_trade_id uuid,
  p_exit_price numeric
) returns table(success boolean, profit_loss numeric) as $$
declare
  r record;
  v_price_diff numeric;
  v_profit_loss numeric;
  v_wallet_balance numeric;
begin
  select * into r from trades where id = p_trade_id for update;
  if not found then
    raise exception 'trade not found';
  end if;
  if r.status <> 'open' then
    return query select false, 0;
  end if;

  -- calculate profit/loss depending on trade_type
  if r.trade_type = 'buy' then
    v_price_diff := p_exit_price - r.entry_price;
  else
    v_price_diff := r.entry_price - p_exit_price;
  end if;

  v_profit_loss := v_price_diff * r.lot_size * r.leverage;

  -- update trade
  update trades set
    exit_price = p_exit_price,
    profit_loss = v_profit_loss,
    current_price = p_exit_price,
    status = 'closed',
    closed_at = now()
  where id = p_trade_id;

  -- return margin + pnl to wallet
  update wallets set balance = balance + r.margin_used + v_profit_loss where user_id = r.user_id;

  return query select true, v_profit_loss;
end;
$$ language plpgsql security definer;

