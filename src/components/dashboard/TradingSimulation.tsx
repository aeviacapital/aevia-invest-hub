// TradingSimulation.tsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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

type AssetType = 'crypto' | 'forex' | 'metals' | 'stocks';

interface SymbolMeta {
  type: AssetType;
  binance?: string;
  tvSymbol: string;
  base?: string;
  quote?: string;
  basePrice?: number; // for simulated prices
  volatility?: number; // for simulated price fluctuation
}

const SYMBOL_MAP: Record<string, SymbolMeta> = {
  // --- CRYPTO PAIRS ---
  'BTC/USD': { type: 'crypto', binance: 'btcusdt', tvSymbol: 'BINANCE:BTCUSDT' },
  'ETH/USD': { type: 'crypto', binance: 'ethusdt', tvSymbol: 'BINANCE:ETHUSDT' },
  'BNB/USD': { type: 'crypto', binance: 'bnbusdt', tvSymbol: 'BINANCE:BNBUSDT' },
  'SOL/USD': { type: 'crypto', binance: 'solusdt', tvSymbol: 'BINANCE:SOLUSDT' },
  'XRP/USD': { type: 'crypto', binance: 'xrpusdt', tvSymbol: 'BINANCE:XRPUSDT' },
  'ADA/USD': { type: 'crypto', binance: 'adausdt', tvSymbol: 'BINANCE:ADAUSDT' },
  'DOGE/USD': { type: 'crypto', binance: 'dogeusdt', tvSymbol: 'BINANCE:DOGEUSDT' },
  'AVAX/USD': { type: 'crypto', binance: 'avaxusdt', tvSymbol: 'BINANCE:AVAXUSDT' },
  'DOT/USD': { type: 'crypto', binance: 'dotusdt', tvSymbol: 'BINANCE:DOTUSDT' },
  'LINK/USD': { type: 'crypto', binance: 'linkusdt', tvSymbol: 'BINANCE:LINKUSDT' },
  'MATIC/USD': { type: 'crypto', binance: 'maticusdt', tvSymbol: 'BINANCE:MATICUSDT' },
  'TRX/USD': { type: 'crypto', binance: 'trxusdt', tvSymbol: 'BINANCE:TRXUSDT' },
  'LTC/USD': { type: 'crypto', binance: 'ltcusdt', tvSymbol: 'BINANCE:LTCUSDT' },
  'BCH/USD': { type: 'crypto', binance: 'bchusdt', tvSymbol: 'BINANCE:BCHUSDT' },
  'XLM/USD': { type: 'crypto', binance: 'xlmusdt', tvSymbol: 'BINANCE:XLMUSDT' },
  'ATOM/USD': { type: 'crypto', binance: 'atomusdt', tvSymbol: 'BINANCE:ATOMUSDT' },
  'ETC/USD': { type: 'crypto', binance: 'etcusdt', tvSymbol: 'BINANCE:ETCUSDT' },
  'FIL/USD': { type: 'crypto', binance: 'filusdt', tvSymbol: 'BINANCE:FILUSDT' },
  'APT/USD': { type: 'crypto', binance: 'aptusdt', tvSymbol: 'BINANCE:APTUSDT' },
  'ARB/USD': { type: 'crypto', binance: 'arbusdt', tvSymbol: 'BINANCE:ARBUSDT' },
  'OP/USD': { type: 'crypto', binance: 'opusdt', tvSymbol: 'BINANCE:OPUSDT' },
  'NEAR/USD': { type: 'crypto', binance: 'nearusdt', tvSymbol: 'BINANCE:NEARUSDT' },
  'SUI/USD': { type: 'crypto', binance: 'suiusdt', tvSymbol: 'BINANCE:SUIUSDT' },
  'TON/USD': { type: 'crypto', binance: 'tonusdt', tvSymbol: 'BINANCE:TONUSDT' },
  'PEPE/USD': { type: 'crypto', binance: 'pepeusdt', tvSymbol: 'BINANCE:PEPEUSDT' },
  'SHIB/USD': { type: 'crypto', binance: 'shibusdt', tvSymbol: 'BINANCE:SHIBUSDT' },

  // --- FOREX PAIRS ---
  'EUR/USD': { type: 'forex', tvSymbol: 'FX:EURUSD', basePrice: 1.0850, volatility: 0.00015 },
  'GBP/USD': { type: 'forex', tvSymbol: 'FX:GBPUSD', basePrice: 1.2650, volatility: 0.00018 },
  'USD/JPY': { type: 'forex', tvSymbol: 'FX:USDJPY', basePrice: 154.50, volatility: 0.00012 },
  'USD/CHF': { type: 'forex', tvSymbol: 'FX:USDCHF', basePrice: 0.8920, volatility: 0.00014 },
  'USD/CAD': { type: 'forex', tvSymbol: 'FX:USDCAD', basePrice: 1.3650, volatility: 0.00013 },
  'AUD/USD': { type: 'forex', tvSymbol: 'FX:AUDUSD', basePrice: 0.6550, volatility: 0.00016 },
  'NZD/USD': { type: 'forex', tvSymbol: 'FX:NZDUSD', basePrice: 0.6150, volatility: 0.00017 },
  'EUR/GBP': { type: 'forex', tvSymbol: 'FX:EURGBP', basePrice: 0.8580, volatility: 0.00012 },
  'EUR/JPY': { type: 'forex', tvSymbol: 'FX:EURJPY', basePrice: 167.60, volatility: 0.00014 },
  'GBP/JPY': { type: 'forex', tvSymbol: 'FX:GBPJPY', basePrice: 195.40, volatility: 0.00018 },

  // --- METALS ---
  'XAU/USD': { type: 'metals', tvSymbol: 'TVC:GOLD', basePrice: 2650.00, volatility: 0.0003 },
  'XAG/USD': { type: 'metals', tvSymbol: 'TVC:SILVER', basePrice: 31.50, volatility: 0.0005 },
  'XPT/USD': { type: 'metals', tvSymbol: 'TVC:PLATINUM', basePrice: 1020.00, volatility: 0.0004 },
  'XPD/USD': { type: 'metals', tvSymbol: 'TVC:PALLADIUM', basePrice: 980.00, volatility: 0.0004 },

  // --- STOCKS ---
  'AAPL': { type: 'stocks', tvSymbol: 'NASDAQ:AAPL', basePrice: 195.00, volatility: 0.0008 },
  'MSFT': { type: 'stocks', tvSymbol: 'NASDAQ:MSFT', basePrice: 420.00, volatility: 0.0007 },
  'TSLA': { type: 'stocks', tvSymbol: 'NASDAQ:TSLA', basePrice: 250.00, volatility: 0.0015 },
  'AMZN': { type: 'stocks', tvSymbol: 'NASDAQ:AMZN', basePrice: 185.00, volatility: 0.0008 },
  'NVDA': { type: 'stocks', tvSymbol: 'NASDAQ:NVDA', basePrice: 880.00, volatility: 0.0012 },
  'GOOGL': { type: 'stocks', tvSymbol: 'NASDAQ:GOOGL', basePrice: 155.00, volatility: 0.0007 },
};

const SYMBOLS_BY_TYPE: Record<AssetType, string[]> = {
  crypto: Object.entries(SYMBOL_MAP).filter(([, v]) => v.type === 'crypto').map(([k]) => k),
  forex: Object.entries(SYMBOL_MAP).filter(([, v]) => v.type === 'forex').map(([k]) => k),
  metals: Object.entries(SYMBOL_MAP).filter(([, v]) => v.type === 'metals').map(([k]) => k),
  stocks: Object.entries(SYMBOL_MAP).filter(([, v]) => v.type === 'stocks').map(([k]) => k),
};

const BINANCE_WS_URL = (symbols: string[]) =>
  `wss://stream.binance.com:9443/stream?streams=${symbols.map(s => `${s}@trade`).join('/')}`;

const TradingSimulation: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Initialize prices - crypto starts at 0 (filled by WS), others get base prices
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const [key, meta] of Object.entries(SYMBOL_MAP)) {
      initial[key] = meta.basePrice || 0;
    }
    return initial;
  });

  const wsRef = useRef<WebSocket | null>(null);
  const simTimerRef = useRef<number | null>(null);
  const pricesRef = useRef(prices);
  pricesRef.current = prices;

  const [chartSymbol, setChartSymbol] = useState<string>(SYMBOL_MAP['BTC/USD'].tvSymbol);

  const [tradeForm, setTradeForm] = useState({
    symbol: 'BTC/USD',
    tradeType: 'buy',
    orderType: 'market',
    marketType: 'crypto' as AssetType,
    lotSize: 0.1,
    leverage: 1,
    entryPrice: 0,
    takeProfit: 0,
    stopLoss: 0,
  });

  // -------------------------
  // Price setup
  // -------------------------
  useEffect(() => {
    initCryptoPrices();
    setupBinanceWS();
    startSimulatedPrices();
    return () => {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      stopSimulatedPrices();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initCryptoPrices = async () => {
    const next: Record<string, number> = { ...pricesRef.current };
    const cryptoEntries = Object.entries(SYMBOL_MAP).filter(([, m]) => m.type === 'crypto' && m.binance);
    await Promise.all(cryptoEntries.map(async ([key, meta]) => {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${meta.binance!.toUpperCase()}`);
        const j = await r.json();
        const p = parseFloat(j.price ?? 0);
        if (!isNaN(p) && p > 0) next[key] = p;
      } catch { /* ignore */ }
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
        } catch { /* ignore */ }
      };
      ws.onerror = () => { if (wsRef.current) { wsRef.current.close(); wsRef.current = null; } };
      ws.onclose = () => { wsRef.current = null; setTimeout(setupBinanceWS, 3000); };
    } catch { /* ignore */ }
  };

  // Simulated price ticks for forex, metals, stocks
  const startSimulatedPrices = () => {
    stopSimulatedPrices();
    simTimerRef.current = window.setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        for (const [key, meta] of Object.entries(SYMBOL_MAP)) {
          if (meta.type !== 'crypto' && meta.basePrice) {
            const currentPrice = prev[key] || meta.basePrice;
            const vol = meta.volatility || 0.0002;
            const change = (Math.random() - 0.5) * 2 * vol * currentPrice;
            next[key] = Math.max(currentPrice + change, currentPrice * 0.5); // floor at 50% of current
          }
        }
        return next;
      });
    }, 1500);
  };

  const stopSimulatedPrices = () => {
    if (simTimerRef.current) {
      window.clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
  };

  // -------------------------
  // Fetch trades and wallet
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
      try { supabase.removeChannel(tradesChannel); } catch {}
      try { supabase.removeChannel(walletChannel); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTrades = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) { console.error('fetchTrades error', error); return; }
    const normalized = (data || []).map((t: any) => {
      const entry_price = t.entry_price != null ? Number(t.entry_price) : 0;
      const current_price = t.current_price != null ? Number(t.current_price) : entry_price;
      const lot_size = t.lot_size != null ? Number(t.lot_size) : 0;
      const leverage = t.leverage != null ? Number(t.leverage) : 1;
      const margin_used = t.margin_used != null ? Number(t.margin_used) : ((entry_price * lot_size) / (leverage || 1));
      const stop_loss = (t.stop_loss === null || t.stop_loss === 0) ? null : Number(t.stop_loss);
      const take_profit = (t.take_profit === null || t.take_profit === 0) ? null : Number(t.take_profit);
      const unrealized_pnl = t.unrealized_pnl != null ? Number(t.unrealized_pnl) : 0;
      const profit_loss = t.profit_loss != null ? Number(t.profit_loss) : null;
      return { ...t, entry_price, current_price, lot_size, leverage, margin_used, unrealized_pnl, profit_loss, stop_loss, take_profit };
    });
    setTrades(normalized);
  };

  const fetchWallet = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
    if (error) { console.error('fetchWallet error', error); setWalletBalance(null); return; }
    setWalletBalance(Number(data?.balance ?? 0));
  };

  // -------------------------
  // Prefill entry / SL / TP
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
  // Derived trades with live prices
  // -------------------------
  const derivedTrades = useMemo(() => {
    if (!trades) return [];
    return trades.map((t: any) => {
      const entry = Number(t.entry_price ?? 0);
      const cur = prices[t.symbol] != null && Number(prices[t.symbol]) > 0 ? Number(prices[t.symbol]) : Number(t.current_price ?? entry);
      const lot = Number(t.lot_size ?? 0);
      const lev = Number(t.leverage ?? 1) || 1;
      const diff = t.trade_type === 'buy' ? (cur - entry) : (entry - cur);
      const unrealized_pnl = +(diff * lot * lev);
      const margin_used = t.margin_used != null ? Number(t.margin_used) : ((entry * lot) / lev);
      return { ...t, current_price: cur, unrealized_pnl, margin_used };
    });
  }, [trades, prices]);

  // -------------------------
  // TP/SL auto-close & pending activation
  // -------------------------
  useEffect(() => {
    const check = async () => {
      if (!derivedTrades || derivedTrades.length === 0) return;
      for (const t of derivedTrades) {
        const cur = Number(t.current_price ?? prices[t.symbol] ?? 0);
        if (!cur || cur <= 0) continue;
        const createdAt = t.created_at ? new Date(t.created_at).getTime() : 0;
        const ageMs = Date.now() - createdAt;
        if (t.status === 'open' && ageMs < 700) continue;

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
              if (!error) { await fetchTrades(); refreshProfile?.(); }
            } catch {}
          }
        }

        if (t.status === 'open') {
          const sl = t.stop_loss != null ? Number(t.stop_loss) : null;
          const tp = t.take_profit != null ? Number(t.take_profit) : null;
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
      if (field === 'marketType') {
        // Auto-select first symbol of the new market type
        const symbols = SYMBOLS_BY_TYPE[value as AssetType];
        if (symbols && symbols.length > 0) {
          next.symbol = symbols[0];
          next.stopLoss = 0;
          next.takeProfit = 0;
        }
      }
      if (field === 'symbol') {
        next.stopLoss = 0;
        next.takeProfit = 0;
      }
      return next;
    });
  };

  // Place order - with timeout protection to prevent infinite loading
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
        const leverageInt = Math.floor(Number(tradeForm.leverage) || 1);
        const stopLossVal = Number(tradeForm.stopLoss) || 0;
        const takeProfitVal = Number(tradeForm.takeProfit) || 0;

        const rpcPayload = {
          p_user_id: user.id,
          p_symbol: tradeForm.symbol,
          p_trade_type: tradeForm.tradeType,
          p_market_type: tradeForm.marketType,
          p_order_type: 'market',
          p_entry_price: currentPrice,
          p_lot_size: Number(tradeForm.lotSize),
          p_leverage: leverageInt,
          p_stop_loss: stopLossVal,
          p_take_profit: takeProfitVal,
        };

        // Add timeout protection
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Trade request timed out. Please try again.')), 15000)
        );

        const rpcPromise = supabase.rpc('open_trade', rpcPayload as any);
        const { error } = await Promise.race([rpcPromise, timeoutPromise]) as any;
        if (error) throw error;

        toast({ title: 'Trade opened', description: `${tradeForm.tradeType.toUpperCase()} ${tradeForm.symbol} @ ${currentPrice.toFixed(4)}` });
        await fetchTrades();
        await fetchWallet();
        refreshProfile?.();
      } catch (err: any) {
        const msg = err?.message || String(err);
        toast({ title: 'Open trade failed', description: msg, variant: 'destructive' });
        console.error('open_trade rpc error', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Pending order
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
          leverage: Math.floor(Number(tradeForm.leverage) || 1),
          stop_loss: Number(tradeForm.stopLoss) || 0,
          take_profit: Number(tradeForm.takeProfit) || 0,
          order_type: tradeForm.orderType,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        if (error) throw error;
        toast({ title: 'Order placed', description: `${tradeForm.orderType} saved (pending)` });
        await fetchTrades();
      } catch (err: any) {
        toast({ title: 'Order save failed', description: err?.message || String(err), variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const manualClose = async (trade: Trade) => {
    const cur = Number(trade.current_price ?? prices[trade.symbol] ?? trade.entry_price ?? 0);
    if (!cur || cur <= 0) {
      toast({ title: 'Price unavailable', description: 'Cannot determine current price', variant: 'destructive' });
      return;
    }
    await callCloseTradeRpc(trade.id, cur);
  };

  // -------------------------
  // Metrics
  // -------------------------
  const computeMetrics = () => {
    const openTrades = derivedTrades.filter((t: any) => t.status === 'open');
    const usedMargin = openTrades.reduce((s: number, t: any) => s + Number(t.margin_used || 0), 0);
    const unrealized = openTrades.reduce((s: number, t: any) => s + Number(t.unrealized_pnl || 0), 0);
    const bal = Number(walletBalance ?? 0);
    const eq = bal + unrealized;
    const free = eq - usedMargin;
    const ml = usedMargin > 0 ? (eq / usedMargin) * 100 : Infinity;
    return { usedMargin, unrealized, eq, free, ml };
  };

  const { usedMargin, unrealized, eq, free, ml } = computeMetrics();

  // TradingView chart
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

  const formatMoney = (n: number) => {
    if (!isFinite(n)) return '$0.00';
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPrice = (n: number) => {
    if (!n) return '0.00';
    if (n >= 100) return n.toFixed(2);
    if (n >= 1) return n.toFixed(4);
    return n.toFixed(6);
  };

  // Get current symbols for selected market type
  const currentSymbols = SYMBOLS_BY_TYPE[tradeForm.marketType] || [];

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="space-y-6">
      <TradingMetrics trades={trades} walletBalance={walletBalance} prices={prices} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Form */}
        <Card className="lg:col-span-1 card-glass">
          <CardHeader>
            <CardTitle className="flex items-center"><Activity className="w-5 h-5 mr-2" />Place Trade</CardTitle>
            <CardDescription>Live trading across multiple asset classes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Market Type</Label>
              <Select value={tradeForm.marketType} onValueChange={(v) => handleInputChange('marketType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="metals">Metals</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Symbol</Label>
              <Select value={tradeForm.symbol} onValueChange={(v) => handleInputChange('symbol', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {currentSymbols.map((sym) => (
                    <SelectItem key={sym} value={sym}>{sym}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Trade Type</Label>
              <Select value={tradeForm.tradeType} onValueChange={(v) => handleInputChange('tradeType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy (Long)</SelectItem>
                  <SelectItem value="sell">Sell (Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select value={tradeForm.orderType} onValueChange={(v) => setTradeForm(prev => ({ ...prev, orderType: v }))}>
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
              <Select value={String(tradeForm.leverage)} onValueChange={(v) => handleInputChange('leverage', parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1:1</SelectItem>
                  <SelectItem value="2">1:2</SelectItem>
                  <SelectItem value="5">1:5</SelectItem>
                  <SelectItem value="10">1:10</SelectItem>
                  <SelectItem value="20">1:20</SelectItem>
                  <SelectItem value="50">1:50</SelectItem>
                  <SelectItem value="100">1:100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Entry / Trigger Price</Label>
              <div className="text-2xl font-bold text-primary">
                {prices[tradeForm.symbol] ? `$${formatPrice(prices[tradeForm.symbol])}` : 'Loading...'}
              </div>
              <p className="text-xs text-muted-foreground">
                {tradeForm.orderType === 'market' ? 'Live price will be used' : 'Set trigger price below'}
              </p>
              {tradeForm.orderType !== 'market' && (
                <Input type="number" onChange={(e) => setTradeForm(prev => ({ ...prev, entryPrice: Number(e.target.value) }))} placeholder={String(tradeForm.entryPrice)} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Stop Loss</Label>
                <Input type="number" onChange={(e) => setTradeForm(prev => ({ ...prev, stopLoss: Number(e.target.value) }))} placeholder={String(tradeForm.stopLoss)} />
              </div>
              <div>
                <Label>Take Profit</Label>
                <Input type="number" onChange={(e) => setTradeForm(prev => ({ ...prev, takeProfit: Number(e.target.value) }))} placeholder={String(tradeForm.takeProfit)} />
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
            <CardDescription>{tradeForm.symbol} — {tradeForm.marketType.toUpperCase()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div id="tradingview_chart" className="h-[500px]" />
          </CardContent>
        </Card>
      </div>

      {/* Active Trades */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center text-base md:text-xl">
            <TrendingUp className="w-5 h-5 mr-2 md:w-6 md:h-6" />
            Your Trades
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Manage your open and closed positions
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="open" className="w-full">
            <TabsList className="flex flex-wrap gap-2 justify-center sm:justify-start sm:gap-4 overflow-x-auto pb-2">
              <TabsTrigger value="open">Open Trades</TabsTrigger>
              <TabsTrigger value="pending">Pending Orders</TabsTrigger>
              <TabsTrigger value="closed">Trade History</TabsTrigger>
            </TabsList>

            {/* OPEN TRADES */}
            <TabsContent value="open" className="mt-4">
              <div className="space-y-4">
                {derivedTrades.filter((t: any) => t.status === 'open').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm sm:text-base">No open trades.</div>
                ) : (
                  derivedTrades.filter((t: any) => t.status === 'open').map((trade: any) => {
                    const cur = trade.current_price;
                    const entry = Number(trade.entry_price);
                    const pnl = Number(trade.unrealized_pnl || 0);
                    return (
                      <div key={trade.id} className="border rounded-xl p-3 sm:p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Badge variant={trade.trade_type === 'buy' ? 'default' : 'destructive'}>{trade.trade_type.toUpperCase()}</Badge>
                            <span className="font-semibold text-base">{trade.symbol}</span>
                            <Badge variant="outline" className="text-xs">{trade.market_type}</Badge>
                            <span className="text-muted-foreground text-xs sm:text-sm">Lot: {trade.lot_size} | Lev: 1:{trade.leverage}</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => callCloseTradeRpc(trade.id, cur)} className="w-full sm:w-auto text-sm">Close</Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="min-w-0">
                            <p className="text-muted-foreground truncate">Entry</p>
                            <p className="font-medium truncate">${formatPrice(entry)}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-muted-foreground truncate">Current</p>
                            <p className="font-medium truncate">${formatPrice(cur)}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-muted-foreground truncate">Unrealized P&L</p>
                            <p className={`font-medium truncate ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>${pnl.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground break-words pt-1 border-t border-dashed mt-3">
                          SL: {trade.stop_loss ?? '—'} • TP: {trade.take_profit ?? '—'} • Opened: {new Date(trade.created_at).toLocaleString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* PENDING ORDERS */}
            <TabsContent value="pending" className="mt-4">
              <div className="space-y-4">
                {derivedTrades.filter((t: any) => t.status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm sm:text-base">No pending orders.</div>
                ) : (
                  derivedTrades.filter((t: any) => t.status === 'pending').map((t: any) => (
                    <div key={t.id} className="border rounded-xl p-3 sm:p-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <Badge variant="outline">{(t.order_type || 'pending').toUpperCase()}</Badge>
                          <span className="font-semibold text-base">{t.symbol}</span>
                          <Badge variant="outline" className="text-xs">{t.market_type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">Trigger: {t.entry_price}</div>
                      </div>
                      <div className="text-xs text-muted-foreground pt-1 border-t border-dashed mt-3">
                        Placed: {new Date(t.created_at).toLocaleDateString()} {new Date(t.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* CLOSED TRADES */}
            <TabsContent value="closed" className="mt-4">
              <div className="space-y-4">
                {derivedTrades.filter((t: any) => t.status === 'closed').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm sm:text-base">No closed trades yet.</div>
                ) : (
                  derivedTrades.filter((t: any) => t.status === 'closed').map((trade: any) => (
                    <div key={trade.id} className="border rounded-xl p-3 sm:p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Badge variant={trade.trade_type === 'buy' ? 'default' : 'destructive'}>{trade.trade_type.toUpperCase()}</Badge>
                          <span className="font-semibold text-base">{trade.symbol}</span>
                          <Badge variant="outline" className="text-xs">{trade.market_type}</Badge>
                          <Badge variant={Number(trade.profit_loss) >= 0 ? 'default' : 'destructive'}>{Number(trade.profit_loss) >= 0 ? 'WIN' : 'LOSS'}</Badge>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Closed: {new Date(trade.closed_at || trade.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="min-w-0">
                          <p className="text-muted-foreground truncate">Entry</p>
                          <p className="font-medium truncate">{trade.entry_price}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-muted-foreground truncate">Exit</p>
                          <p className="font-medium truncate">{trade.exit_price ?? '-'}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-muted-foreground truncate">Lot</p>
                          <p className="font-medium truncate">{trade.lot_size}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-muted-foreground truncate">P&L</p>
                          <p className={`font-medium truncate ${Number(trade.profit_loss) >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {Number(trade.profit_loss ?? 0).toFixed(2)}
                          </p>
                        </div>
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
