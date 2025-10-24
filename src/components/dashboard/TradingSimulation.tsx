// TradingSimulation.tsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Activity } from 'lucide-react';
import TradingMetrics from './TradingMetrics';

type Trade = any;

const SYMBOL_MAP: Record<string, { type: 'crypto' | 'forex'; binance?: string; tvSymbol: string; base?: string; quote?: string }> = {
  'BTC/USD': { type: 'crypto', binance: 'btcusdt', tvSymbol: 'BINANCE:BTCUSDT' },
  'ETH/USD': { type: 'crypto', binance: 'ethusdt', tvSymbol: 'BINANCE:ETHUSDT' },
  'EUR/USD': { type: 'forex', base: 'EUR', quote: 'USD', tvSymbol: 'FX:EURUSD' },
  'GBP/USD': { type: 'forex', base: 'GBP', quote: 'USD', tvSymbol: 'FX:GBPUSD' },
  'USD/JPY': { type: 'forex', base: 'USD', quote: 'JPY', tvSymbol: 'FX:USDJPY' },
};

const POLL_INTERVAL_MS = 3000;
const BINANCE_WS_URL = (symbols: string[]) =>
  `wss://stream.binance.com:9443/stream?streams=${symbols.map(s => `${s}@trade`).join('/')}`;

const TradingSimulation: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const [prices, setPrices] = useState<Record<string, number>>({
    'BTC/USD': 0,
    'ETH/USD': 0,
    'EUR/USD': 0,
    'GBP/USD': 0,
    'USD/JPY': 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const forexTimerRef = useRef<number | null>(null);
  const [chartSymbol, setChartSymbol] = useState<string>(SYMBOL_MAP['BTC/USD'].tvSymbol);

  const [tradeForm, setTradeForm] = useState({
    symbol: 'BTC/USD',
    tradeType: 'buy',
    orderType: 'market',
    marketType: 'crypto',
    lotSize: 0.1,
    leverage: 1,
    entryPrice: 0,
    takeProfit: 0,
    stopLoss: 0,
  });

  // -------------------------
  // Price setup (Binance WS + optional forex polling)
  // -------------------------
  useEffect(() => {
    initPrices(); // bootstrap
    setupBinanceWS();
    startForexPolling();
    return () => {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      stopForexPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initPrices = async () => {
    const next: Record<string, number> = { ...prices };
    await Promise.all(Object.entries(SYMBOL_MAP).map(async ([key, meta]) => {
      try {
        if (meta.type === 'crypto' && meta.binance) {
          const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${meta.binance!.toUpperCase()}`);
          const j = await r.json();
          const p = parseFloat(j.price ?? 0);
          if (!isNaN(p) && p > 0) next[key] = p;
        } else if (meta.type === 'forex' && meta.base && meta.quote) {
          const r = await fetch(`https://api.exchangerate.host/latest?base=${meta.base}&symbols=${meta.quote}`);
          const j = await r.json();
          const p = j.rates?.[meta.quote];
          if (p) next[key] = Number(p);
        }
      } catch (e) {
        // ignore initial failures
      }
    }));
    setPrices(next);
  };

  const setupBinanceWS = () => {
    const cryptoSymbols = Object.values(SYMBOL_MAP).filter(v => v.type === 'crypto' && v.binance).map(v => v.binance!);
    if (cryptoSymbols.length === 0) return;
    try {
      const ws = new WebSocket(BINANCE_WS_URL(cryptoSymbols));
      wsRef.current = ws;
      ws.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          const stream: string = payload.stream;
          const data = payload.data;
          if (!stream || !data) return;
          const pairKey = Object.entries(SYMBOL_MAP).find(([, v]) => v.binance === stream.split('@')[0])?.[0];
          if (!pairKey) return;
          const price = parseFloat(data.p ?? data.price ?? 0);
          if (!isNaN(price) && price > 0) {
            setPrices(prev => ({ ...prev, [pairKey]: price }));
          }
        } catch (err) {
          // ignore parse
        }
      };
      ws.onerror = () => {
        if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      };
      ws.onclose = () => {
        wsRef.current = null;
        setTimeout(() => setupBinanceWS(), 3000);
      };
    } catch (e) {
      // ignore
    }
  };

  const startForexPolling = () => {
    stopForexPolling();
    forexTimerRef.current = window.setInterval(async () => {
      for (const [key, meta] of Object.entries(SYMBOL_MAP)) {
        if (meta.type === 'forex' && meta.base && meta.quote) {
          try {
            const r = await fetch(`https://api.exchangerate.host/latest?base=${meta.base}&symbols=${meta.quote}`);
            const j = await r.json();
            const p = j.rates?.[meta.quote];
            if (p) setPrices(prev => ({ ...prev, [key]: Number(p) }));
          } catch (err) {
            // ignore
          }
        }
      }
    }, POLL_INTERVAL_MS);
  };
  const stopForexPolling = () => {
    if (forexTimerRef.current) {
      window.clearInterval(forexTimerRef.current);
      forexTimerRef.current = null;
    }
  };

  // -------------------------
  // Fetch trades and wallet, subscribe to realtime updates
  // -------------------------
  useEffect(() => {
    if (!user) return;

    fetchWallet();
    fetchTrades();

    const tradesChannel = supabase
      .channel(`public:trades:user=${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` }, () => fetchTrades())
      .subscribe();

    const walletChannel = supabase
      .channel(`public:wallets:user=${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` }, () => fetchWallet())
      .subscribe();

    return () => {
      try { supabase.removeChannel(tradesChannel); } catch (e) {}
      try { supabase.removeChannel(walletChannel); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTrades = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) {
      console.error('fetchTrades error', error);
      return;
    }
    // Normalize fields and provide safe defaults so UI and metrics don't explode when DB column missing
    const normalized = (data || []).map((t: any) => {
      const entry_price = t.entry_price != null ? Number(t.entry_price) : 0;
      const current_price = t.current_price != null ? Number(t.current_price) : entry_price;
      const lot_size = t.lot_size != null ? Number(t.lot_size) : 0;
      const leverage = t.leverage != null ? Number(t.leverage) : 1;
      // If DB provides margin_used use it; otherwise compute a reasonable default:
      // margin_used = (entry_price * lot_size) / leverage
      const margin_used = t.margin_used != null ? Number(t.margin_used) : ((entry_price * lot_size) / (leverage || 1));
      // Protect against DB writing 0 for stop_loss/take_profit incorrectly: keep them as null when they are falsy
      const stop_loss = (t.stop_loss === null || t.stop_loss === 0) ? null : Number(t.stop_loss);
      const take_profit = (t.take_profit === null || t.take_profit === 0) ? null : Number(t.take_profit);
      const unrealized_pnl = t.unrealized_pnl != null ? Number(t.unrealized_pnl) : 0;
      const profit_loss = t.profit_loss != null ? Number(t.profit_loss) : null;
      return {
        ...t,
        entry_price,
        current_price,
        lot_size,
        leverage,
        margin_used,
        unrealized_pnl,
        profit_loss,
        stop_loss,
        take_profit,
      };
    });
    setTrades(normalized);
  };

  const fetchWallet = async () => {
    if (!user) return;
    // only selecting balance from wallets table (you said that's where you store balance)
    const { data, error } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
    if (error) {
      console.error('fetchWallet error', error);
      setWalletBalance(null);
      return;
    }
    setWalletBalance(Number(data?.balance ?? 0));
  };

  // -------------------------
  // Prefill entry / SL / TP on price change or symbol change
  // -------------------------
  useEffect(() => {
    const p = prices[tradeForm.symbol];
    if (p && p > 0) {
      const sl = tradeForm.tradeType === 'buy' ? +(p * 0.99) : +(p * 1.01);
      const tp = tradeForm.tradeType === 'buy' ? +(p * 1.02) : +(p * 0.98);
      setTradeForm(prev => ({
        ...prev,
        entryPrice: p,
        stopLoss: prev.stopLoss === 0 ? Number(sl.toFixed(6)) : prev.stopLoss,
        takeProfit: prev.takeProfit === 0 ? Number(tp.toFixed(6)) : prev.takeProfit,
      }));
      setChartSymbol(SYMBOL_MAP[tradeForm.symbol]?.tvSymbol ?? chartSymbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices, tradeForm.symbol, tradeForm.tradeType]);

  // -------------------------
  // Derived trades: compute current_price & unrealized_pnl on the fly
  // (don't mutate DB-backed `trades` state; compute a derived copy for UI & metrics)
  // -------------------------
  const derivedTrades = useMemo(() => {
    if (!trades) return [];
    return trades.map(t => {
      const entry = Number(t.entry_price ?? 0);
      const cur = prices[t.symbol] != null && Number(prices[t.symbol]) > 0 ? Number(prices[t.symbol]) : Number(t.current_price ?? entry);
      const lot = Number(t.lot_size ?? 0);
      const lev = Number(t.leverage ?? 1) || 1;
      const diff = t.trade_type === 'buy' ? (cur - entry) : (entry - cur);
      const unrealized_pnl = +(diff * lot * lev);
      // margin used: prefer DB value, fallback to calculation
      const margin_used = t.margin_used != null ? Number(t.margin_used) : ((entry * lot) / lev);
      return { ...t, current_price: cur, unrealized_pnl, margin_used };
    });
  }, [trades, prices]);

  // -------------------------
  // Price tick checks for pending activation and TP/SL auto-close
  // -------------------------
  useEffect(() => {
    const check = async () => {
      if (!derivedTrades || derivedTrades.length === 0) return;

      for (const t of derivedTrades) {
        // prefer the trade's computed current_price; fallback to live feed
        const cur = Number(t.current_price ?? prices[t.symbol] ?? 0);
        if (!cur || cur <= 0) continue;

        // If the trade was just created/opened very recently, skip auto-close logic to avoid race
        // conditions between open RPC and the price-check interval. 700ms is small but prevents
        // immediate closure when entry == current due to timing.
        const createdAt = t.created_at ? new Date(t.created_at).getTime() : 0;
        const now = Date.now();
        const ageMs = now - createdAt;
        const GRACE_MS = 700; // keep small; adjust if you need longer grace after creation
        // If trade is 'open' also check closed_at status (skip if closed)
        if (t.status === 'open' && ageMs < GRACE_MS) {
          // skip TP/SL checks for very-new trades
          continue;
        }

        if (t.status === 'pending') {
          const orderType = t.order_type || 'market';
          let shouldActivate = false;
          if (orderType === 'buy_stop' && cur >= Number(t.entry_price)) shouldActivate = true;
          if (orderType === 'sell_stop' && cur <= Number(t.entry_price)) shouldActivate = true;
          if (orderType === 'buy_limit' && cur <= Number(t.entry_price)) shouldActivate = true;
          if (orderType === 'sell_limit' && cur >= Number(t.entry_price)) shouldActivate = true;

          if (shouldActivate) {
            try {
              const { error } = await supabase.rpc('activate_pending_trade', { p_trade_id: t.id, p_current_price: cur });
              if (error) {
                console.warn('activate_pending_trade error', error);
              } else {
                await fetchTrades();
                refreshProfile?.();
              }
            } catch (err) {
              console.warn('activate_pending_trade rpc exception', err);
            }
          }
        }

        if (t.status === 'open') {
          const sl = t.stop_loss != null ? Number(t.stop_loss) : null;
          const tp = t.take_profit != null ? Number(t.take_profit) : null;
          // small epsilon tolerance to avoid float quirks
          const EPS = Math.max(cur * 1e-12, 1e-12);
          if (sl !== null) {
            if ((t.trade_type === 'buy' && cur <= sl + EPS) || (t.trade_type === 'sell' && cur >= sl - EPS)) {
              await callCloseTradeRpc(t.id, cur);
              continue;
            }
          }
          if (tp !== null) {
            if ((t.trade_type === 'buy' && cur >= tp - EPS) || (t.trade_type === 'sell' && cur <= tp + EPS)) {
              await callCloseTradeRpc(t.id, cur);
              continue;
            }
          }
        }
      }
    };

    const id = window.setInterval(check, 1200);
    check();
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedTrades, prices]);

const callCloseTradeRpc = async (tradeId: string, exitPrice: number) => {
  try {
    const { error } = await supabase.rpc('close_trade', { p_trade_id: tradeId, p_exit_price: exitPrice });
    if (error) {
      console.error('close_trade rpc error', error);
      toast({ title: 'Close trade failed', description: error.message || String(error), variant: 'destructive' });
      return;
    }

    // ✅ Get the closed trade to determine profit/loss
    const { data: closedTrade, error: fetchTradeErr } = await supabase
      .from('trades')
      .select('profit_loss')
      .eq('id', tradeId)
      .maybeSingle();

    if (fetchTradeErr) {
      console.error('fetch closed trade error', fetchTradeErr);
    } else if (closedTrade?.profit_loss != null) {
      const profitLoss = Number(closedTrade.profit_loss);

      // ✅ Fetch current wallet
      const { data: wallet, error: walletErr } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletErr) {
        console.error('fetch wallet error', walletErr);
      } else if (wallet?.balance != null) {
        const newBalance = Number(wallet.balance) + profitLoss;

        // ✅ Update wallet balance
        const { error: updateErr } = await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('user_id', user.id);

        if (updateErr) {
          console.error('wallet update error', updateErr);
        }
      }
    }

    await fetchTrades();
    await fetchWallet();
    refreshProfile?.();
    toast({ title: 'Trade closed', description: `Closed at ${exitPrice}` });
  } catch (err: any) {
    console.error('close_trade rpc exception', err);
    toast({ title: 'Close trade exception', description: String(err), variant: 'destructive' });
  }
};

    // -------------------------
  // Form handlers
  // -------------------------
  const handleInputChange = (field: string, value: any) => {
    setTradeForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'symbol') {
        const meta = SYMBOL_MAP[value];
        if (meta) next.marketType = meta.type;
      }
      return next;
    });
  };

  // Place order
  const placeOrder = async () => {
    if (!user) return;
    const symbol = tradeForm.symbol;
    const currentPrice = prices[symbol];
    if (!currentPrice || currentPrice <= 0) {
      toast({ title: 'Price unavailable', description: 'Live price not ready yet', variant: 'destructive' });
      return;
    }

    if (tradeForm.orderType === 'market') {
      setIsLoading(true);
      try {
        // NOTE: p_leverage must be integer to disambiguate overloaded functions.
        const leverageInt = Number(Math.floor(Number(tradeForm.leverage) || 1));
        const rpcPayload = {
          p_user_id: user.id,
          p_symbol: tradeForm.symbol,
          p_trade_type: tradeForm.tradeType,
          p_market_type: tradeForm.marketType,
          p_order_type: 'market',
          p_entry_price: currentPrice,
          p_lot_size: Number(tradeForm.lotSize),
          p_leverage: leverageInt, // integer
          p_stop_loss: tradeForm.stopLoss || null,
          p_take_profit: tradeForm.takeProfit || null,
        };
        const { error } = await supabase.rpc('open_trade', rpcPayload);
        if (error) throw error;

        toast({ title: 'Trade opened', description: `${tradeForm.tradeType.toUpperCase()} ${tradeForm.symbol} @ ${currentPrice}` });
        await fetchTrades();
        await fetchWallet();
        refreshProfile?.();
      } catch (err: any) {
        // surface DB error message neatly
        const msg = err?.message || String(err);
        toast({ title: 'Open trade failed', description: msg, variant: 'destructive' });
        console.error('open_trade rpc error', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // pending order insert (trigger=entryPrice)
      if (!tradeForm.entryPrice || Number(tradeForm.entryPrice) <= 0) {
        toast({ title: 'Set trigger price', description: 'Set entry/trigger price for stop/limit orders', variant: 'destructive' });
        return;
      }
      setIsLoading(true);
      try {
        const { error } = await supabase.from('trades').insert({
          user_id: user.id,
          symbol: tradeForm.symbol,
          trade_type: tradeForm.tradeType,
          market_type: tradeForm.marketType,
          entry_price: tradeForm.entryPrice,
          lot_size: tradeForm.lotSize,
          leverage: Number(Math.floor(Number(tradeForm.leverage) || 1)),
          stop_loss: tradeForm.stopLoss || null,
          take_profit: tradeForm.takeProfit || null,
          order_type: tradeForm.orderType,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        if (error) throw error;
        toast({ title: 'Order placed', description: `${tradeForm.orderType} saved (pending)` });
        await fetchTrades();
      } catch (err: any) {
        const msg = err?.message || String(err);
        toast({ title: 'Order save failed', description: msg, variant: 'destructive' });
        console.error('save pending order error', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // manual close (user clicks)
  const manualClose = async (trade: Trade) => {
    const cur = Number(trade.current_price ?? prices[trade.symbol] ?? trade.entry_price ?? 0);
    if (!cur || cur <= 0) {
      toast({ title: 'Price unavailable', description: 'Cannot determine current price', variant: 'destructive' });
      return;
    }
    await callCloseTradeRpc(trade.id, cur);
  };

  // -------------------------
  // Metrics calculations (usedMargin, unrealized, equity, free, marginLevel)
  // Use derivedTrades to ensure live values even if DB doesn't store unrealized_pnl
  // -------------------------
  const computeMetrics = () => {
    const openTrades = derivedTrades.filter(t => t.status === 'open');
    const usedMargin = openTrades.reduce((s, t) => s + Number(t.margin_used || ((Number(t.entry_price || 0) * Number(t.lot_size || 0)) / (Number(t.leverage || 1) || 1))), 0);
    const unrealized = openTrades.reduce((s, t) => s + Number(t.unrealized_pnl || 0), 0);
    const bal = Number(walletBalance ?? 0);
    const eq = bal + unrealized;
    const free = eq - usedMargin;
    const ml = usedMargin > 0 ? (eq / usedMargin) * 100 : Infinity;
    return { usedMargin, unrealized, eq, free, ml };
  };

  const { usedMargin, unrealized, eq, free, ml } = computeMetrics();

  // TradingView chart mount/update (switch symbol)
  useEffect(() => {
    const container = document.getElementById('tradingview_chart');
    if (!container) return;
    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      new TradingView.widget({
        autosize: true,
        symbol: chartSymbol,
        interval: '1',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        container_id: 'tradingview_chart',
      });
    };
    container.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartSymbol]);

  // -------------------------
  // Helpers
  // -------------------------
  const formatMoney = (n: number) => {
    if (!isFinite(n)) return '$0.00';
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // -------------------------
  // Render UI (kept unchanged)
  // -------------------------
  return (
    <div className="space-y-6">
      {/* pass live metrics into TradingMetrics */}
<TradingMetrics trades={trades} walletBalance={walletBalance} prices={prices} />
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Form */}
        <Card className="lg:col-span-1 card-glass">
          <CardHeader>
            <CardTitle className="flex items-center"><Activity className="w-5 h-5 mr-2" />Place Trade</CardTitle>
            <CardDescription>Live trading with public tickers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Market Type</Label>
              <Select value={tradeForm.marketType} onValueChange={(v) => handleInputChange('marketType', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Symbol</Label>
              <Select value={tradeForm.symbol} onValueChange={(v) => handleInputChange('symbol', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tradeForm.marketType === 'crypto' ? (
                    <>
                      <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                      <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                      <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                      <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trade Type</Label>
              <Select value={tradeForm.tradeType} onValueChange={(v) => handleInputChange('tradeType', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy (Long)</SelectItem>
                  <SelectItem value="sell">Sell (Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={tradeForm.orderType} onValueChange={(v) => setTradeForm(prev => ({ ...prev, orderType: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="buy_stop">Buy Stop</SelectItem>
                  <SelectItem value="sell_stop">Sell Stop</SelectItem>
                  <SelectItem value="buy_limit">Buy Limit</SelectItem>
                  <SelectItem value="sell_limit">Sell Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lot Size</Label>
              <Input type="number" step="0.01" min="0.01" value={tradeForm.lotSize} onChange={(e) => handleInputChange('lotSize', parseFloat(e.target.value))} />
            </div>

            <div className="space-y-2">
              <Label>Leverage</Label>
              <Select value={String(tradeForm.leverage)} onValueChange={(v) => handleInputChange('leverage', parseInt(v as any))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1:1</SelectItem>
                  <SelectItem value="2">1:2</SelectItem>
                  <SelectItem value="5">1:5</SelectItem>
                  <SelectItem value="10">1:10</SelectItem>
                  <SelectItem value="20">1:20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Entry / Trigger Price</Label>
              <div className="text-2xl font-bold text-primary">{prices[tradeForm.symbol] ? formatMoney(prices[tradeForm.symbol]) : 'Loading...'}</div>
              <p className="text-xs text-muted-foreground">If order type is Market, live price will be used. For stops/limits, set trigger below.</p>
              {tradeForm.orderType !== 'market' && (
                <Input type="number" value={tradeForm.entryPrice} onChange={(e) => setTradeForm(prev => ({ ...prev, entryPrice: Number(e.target.value) }))} placeholder="Trigger price" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Stop Loss</Label>
                <Input type="number" value={tradeForm.stopLoss} onChange={(e) => setTradeForm(prev => ({ ...prev, stopLoss: Number(e.target.value) }))} placeholder="0 = none" />
              </div>
              <div>
                <Label>Take Profit</Label>
                <Input type="number" value={tradeForm.takeProfit} onChange={(e) => setTradeForm(prev => ({ ...prev, takeProfit: Number(e.target.value) }))} placeholder="0 = none" />
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Available balance: {walletBalance !== null ? formatMoney(walletBalance) : 'Loading...'}</p>
            </div>

            <Button onClick={placeOrder} disabled={isLoading} className={`w-full ${tradeForm.tradeType === 'buy' ? 'bg-success hover:bg-success/80' : 'bg-destructive hover:bg-destructive/80'}`}>
              {isLoading ? 'Placing...' : `${tradeForm.tradeType.toUpperCase()} ${tradeForm.symbol}`}
            </Button>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2 card-glass">
          <CardHeader>
            <CardTitle>Live Chart</CardTitle>
            <CardDescription>Price feed from public tickers</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="tradingview_chart" className="h-[500px]" />
          </CardContent>
        </Card>
      </div>

      {/* Active Trades */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center"><TrendingUp className="w-5 h-5 mr-2" />Your Trades</CardTitle>
          <CardDescription>Manage your open and closed positions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open" className="w-full">
            <TabsList>
              <TabsTrigger value="open">Open Trades</TabsTrigger>
              <TabsTrigger value="pending">Pending Orders</TabsTrigger>
              <TabsTrigger value="closed">Trade History</TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="mt-4">
              <div className="space-y-4">
                {derivedTrades.filter(t => t.status === 'open').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No open trades.</div>
                ) : (
                  derivedTrades.filter(t => t.status === 'open').map((trade) => {
                    const cur = trade.current_price;
                    const entry = Number(trade.entry_price);
                    const pnl = Number(trade.unrealized_pnl || 0);
                    return (
                      <div key={trade.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant={trade.trade_type === 'buy' ? 'default' : 'destructive'}>{trade.trade_type.toUpperCase()}</Badge>
                            <span className="font-medium">{trade.symbol}</span>
                            <span className="text-muted-foreground">Lot: {trade.lot_size} | Leverage: 1:{trade.leverage}</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => callCloseTradeRpc(trade.id, cur)}>Close</Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><p className="text-muted-foreground">Entry</p><p className="font-medium">${Number(entry).toLocaleString()}</p></div>
                          <div><p className="text-muted-foreground">Current</p><p className="font-medium">${Number(cur).toLocaleString()}</p></div>
                          <div><p className="text-muted-foreground">Unrealized P&L</p><p className={`font-medium ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>${Number(pnl).toFixed(2)}</p></div>
                        </div>

                        <div className="text-xs text-muted-foreground">SL: {trade.stop_loss ?? '—'} • TP: {trade.take_profit ?? '—'} • Opened: {new Date(trade.created_at).toLocaleString()}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <div className="space-y-4">
                {derivedTrades.filter(t => t.status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No pending orders.</div>
                ) : (
                  derivedTrades.filter(t => t.status === 'pending').map((t) => (
                    <div key={t.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{(t.order_type || 'pending').toUpperCase()}</Badge>
                          <span className="font-medium">{t.symbol}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Trigger: {t.entry_price}</div>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">Placed: {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString()}</div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="closed" className="mt-4">
              <div className="space-y-4">
                {derivedTrades.filter(t => t.status === 'closed').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No closed trades yet.</div>
                ) : (
                  derivedTrades.filter(t => t.status === 'closed').map((trade) => (
                    <div key={trade.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant={trade.trade_type === 'buy' ? 'default' : 'destructive'}>{trade.trade_type.toUpperCase()}</Badge>
                          <span className="font-medium">{trade.symbol}</span>
                          <Badge variant={Number(trade.profit_loss) >= 0 ? 'default' : 'destructive'}>{Number(trade.profit_loss) >= 0 ? 'WIN' : 'LOSS'}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{new Date(trade.closed_at || trade.created_at).toLocaleDateString()}</div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div><p className="text-muted-foreground">Entry</p><p className="font-medium">{trade.entry_price}</p></div>
                        <div><p className="text-muted-foreground">Exit</p><p className="font-medium">{trade.exit_price ?? '-'}</p></div>
                        <div><p className="text-muted-foreground">Lot</p><p className="font-medium">{trade.lot_size}</p></div>
                        <div><p className="text-muted-foreground">P&L</p><p className={`font-medium ${Number(trade.profit_loss) >= 0 ? 'text-success' : 'text-destructive'}`}>{Number(trade.profit_loss ?? 0).toFixed(2)}</p></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingSimulation;

