// AdminTradingHistory.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, TrendingUp, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type UserProfile = { user_id: string; full_name: string; email: string; balance?: number };

const SYMBOL_MAP: Record<string, { type: 'crypto' | 'forex'; binance?: string; base?: string; quote?: string }> = {
  'BTC/USD': { type: 'crypto', binance: 'btcusdt', base: 'BTC', quote: 'USD' },
  'ETH/USD': { type: 'crypto', binance: 'ethusdt', base: 'ETH', quote: 'USD' },
  'EUR/USD': { type: 'forex', base: 'EUR', quote: 'USD' },
  'GBP/USD': { type: 'forex', base: 'GBP', quote: 'USD' },
  'USD/JPY': { type: 'forex', base: 'USD', quote: 'JPY' },
};

const POLL_INTERVAL_MS = 3000;
const BINANCE_WS_URL = (symbols: string[]) =>
  `wss://stream.binance.com:9443/stream?streams=${symbols.map(s => `${s}@trade`).join('/')}`;

export const AdminTradingHistory: React.FC = () => {
  const { toast } = useToast();
  const { user: adminUser } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [trades, setTrades] = useState<any[]>([]);
  const [editingTrade, setEditingTrade] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // create/open trade dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    user_id: '',
    symbol: 'BTC/USD',
    trade_type: 'buy',
    order_type: 'market',
    entry_price: 0,
    lot_size: 0.1,
    leverage: 1,
    stop_loss: 0,
    take_profit: 0,
    status: 'open' as 'open' | 'pending' | 'closed',
  });

  // edit form state
  const [formData, setFormData] = useState({
    profit_loss: 0,
    exit_price: 0,
    status: 'open',
  });

  // live prices
  const [prices, setPrices] = useState<Record<string, number>>({
    'BTC/USD': 0,
    'ETH/USD': 0,
    'EUR/USD': 0,
    'GBP/USD': 0,
    'USD/JPY': 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const forexTimerRef = useRef<number | null>(null);

  // -------------------------
  // Live price setup
  // -------------------------
  useEffect(() => {
    initPrices();
    startBinanceWS();
    startForexPolling();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      stopForexPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initPrices = async () => {
    const next = { ...prices };
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
      } catch (err) {
        // ignore
      }
    }));
    setPrices(next);
  };

  const startBinanceWS = () => {
    const cryptoSymbols = Object.values(SYMBOL_MAP).filter(v => v.type === 'crypto' && v.binance).map(v => v.binance!);
    if (cryptoSymbols.length === 0) return;
    try {
      const ws = new WebSocket(BINANCE_WS_URL(cryptoSymbols));
      wsRef.current = ws;
      ws.onmessage = ev => {
        try {
          const payload = JSON.parse(ev.data);
          const stream: string = payload.stream;
          const data = payload.data;
          if (!stream || !data) return;
          const key = Object.entries(SYMBOL_MAP).find(([, v]) => v.binance === stream.split('@')[0])?.[0];
          if (!key) return;
          const price = parseFloat(data.p ?? data.price ?? 0);
          if (!isNaN(price) && price > 0) {
            setPrices(prev => ({ ...prev, [key]: price }));
          }
        } catch (err) {}
      };
      ws.onerror = () => {
        if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      };
      ws.onclose = () => {
        wsRef.current = null;
        setTimeout(startBinanceWS, 3000);
      };
    } catch (err) {
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
          } catch (err) { /* ignore */ }
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
  // Fetch users and trades
  // -------------------------
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchTrades(selectedUserId);
      // subscribe to trades & profiles for realtime updates for selected user
      const tradesChannel = supabase
        .channel(`public:trades:user=${selectedUserId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${selectedUserId}` }, () => fetchTrades(selectedUserId))
        .subscribe();

      const profileChannel = supabase
        .channel(`public:profiles:user=${selectedUserId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${selectedUserId}` }, () => fetchUsers())
        .subscribe();

      return () => {
        try { supabase.removeChannel(tradesChannel); } catch (e) {}
        try { supabase.removeChannel(profileChannel); } catch (e) {}
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('user_id, full_name, email, balance').order('full_name');
    if (error) {
      console.error('fetchUsers error', error);
      return;
    }
    setUsers(data || []);
  };

  const fetchTrades = async (userId?: string) => {
    if (!userId && !selectedUserId) return;
    const uid = userId ?? selectedUserId;
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchTrades error', error);
      return;
    }
    setTrades(data || []);
  };

  // -------------------------
  // Admin actions: open/create/close trade
  // -------------------------
  const calculateMarginUsed = (entry_price: number, lot_size: number, leverage: number) => {
    // basic margin = (entry_price * lot_size) / leverage
    return (entry_price * lot_size) / (leverage || 1);
  };

  // Open a trade (immediately active) — deduct margin_used from user profile
  const openTradeForUser = async (payload: {
    user_id: string;
    symbol: string;
    trade_type: string;
    order_type: string;
    entry_price: number;
    lot_size: number;
    leverage: number;
    stop_loss?: number | null;
    take_profit?: number | null;
  }) => {
    setIsLoading(true);
    try {
      // compute margin
      const margin_used = calculateMarginUsed(payload.entry_price, payload.lot_size, payload.leverage);

      // fetch user's profile balance
      const { data: profileData, error: profileError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', payload.user_id)
        .single();

      if (profileError) throw profileError;
      const currentBalance = Number(profileData?.balance ?? 0);

      // Check available balance (optional: enforce)
      if (currentBalance < margin_used) {
        toast({ title: 'Insufficient balance', description: 'User does not have enough balance to open this trade', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      // 1) insert trade as open, set margin_used
      console.log("checking userid"); 
      console.log(payload.user_id); 
      const { error: insertError } = await supabase.from('trades').insert({
        user_id: payload.user_id,
        symbol: payload.symbol,
        trade_type: payload.trade_type,
        market_type: SYMBOL_MAP[payload.symbol]?.type ?? 'crypto',
        order_type: payload.order_type,
        entry_price: payload.entry_price,
        lot_size: payload.lot_size,
        leverage: Number(Math.floor(payload.leverage || 1)),
        stop_loss: payload.stop_loss ?? null,
        take_profit: payload.take_profit ?? null,
        margin_used,
        status: 'open',
        created_at: new Date().toISOString()
      }).select().single();

      if (insertError) throw insertError;
     // 2) deduct margin_used from profile.balance
      const newBalance = currentBalance - margin_used;
      await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', payload.user_id);

          // 3) audit log
      await supabase.from('audit_logs').insert({
        admin_id: adminUser?.id,
        action_type: 'open_trade_by_admin',
        target_user_id: payload.user_id,
        target_table: 'trades',
        target_id: (insertError ? null : (insertError ? null : undefined)), // best-effort: row id already created above
        old_value: { balance: currentBalance },
        new_value: { balance: newBalance, margin_used },
        description: `Admin opened an active trade for user ${payload.user_id} ${payload.symbol} @ ${payload.entry_price}`
      });

      toast({ title: 'Trade opened', description: `Opened ${payload.symbol} for user` });
      fetchTrades(payload.user_id);
      fetchUsers();
    } catch (err: any) {
      console.error('openTradeForUser error', err);
      toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Insert pending trade (no margin deduction)
  const insertPendingTradeForUser = async (payload: {
    user_id: string;
    symbol: string;
    trade_type: string;
    order_type: string;
    entry_price: number;
    lot_size: number;
    leverage: number;
    stop_loss?: number | null;
    take_profit?: number | null;
  }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('trades').insert({
        user_id: payload.user_id,
        symbol: payload.symbol,
        trade_type: payload.trade_type,
        market_type: SYMBOL_MAP[payload.symbol]?.type ?? 'crypto',
        order_type: payload.order_type,
        entry_price: payload.entry_price,
        lot_size: payload.lot_size,
        leverage: Number(Math.floor(payload.leverage || 1)),
        stop_loss: payload.stop_loss ?? null,
        take_profit: payload.take_profit ?? null,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        admin_id: adminUser?.id,
        action_type: 'insert_pending_trade_by_admin',
        target_user_id: payload.user_id,
        target_table: 'trades',
        new_value: payload,
        description: `Admin inserted pending trade for user ${payload.user_id} ${payload.symbol} @ ${payload.entry_price}`
      });

      toast({ title: 'Pending order saved', description: `Saved pending ${payload.symbol}` });
      fetchTrades(payload.user_id);
    } catch (err: any) {
      console.error('insertPendingTradeForUser error', err);
      toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Close trade as admin (release margin_used + apply profit/loss)
  const closeTradeForUser = async (tradeRow: any, exitPrice?: number, profitLossOverride?: number | null) => {
    setIsLoading(true);
    try {
      const curExit = typeof exitPrice === 'number' && exitPrice > 0 ? exitPrice : Number(tradeRow.current_price ?? exitPrice ?? tradeRow.entry_price ?? 0);
      // compute profit/loss if not provided: simple formula as used elsewhere:
      // For buy: (exit - entry) * lot * leverage
      // For sell: (entry - exit) * lot * leverage
      const entry = Number(tradeRow.entry_price || 0);
      const lot = Number(tradeRow.lot_size || 0);
      const lev = Number(tradeRow.leverage || 1) || 1;

      let computedPL = 0;
      if (typeof profitLossOverride === 'number') {
        computedPL = profitLossOverride;
      } else {
        const diff = tradeRow.trade_type === 'buy' ? (curExit - entry) : (entry - curExit);
        computedPL = +(diff * lot * lev);
      }

      const marginUsed = Number(tradeRow.margin_used || 0);

      // Update trade row: set status closed, exit_price, profit_loss, closed_at
      const { error: updateTradeError } = await supabase.from('trades').update({
        status: 'closed',
        exit_price: curExit,
        profit_loss: computedPL,
        closed_at: new Date().toISOString()
      }).eq('id', tradeRow.id);

      if (updateTradeError) throw updateTradeError;

      // update user balance: return margin_used + apply profit/loss
      const { data: profileData, error: profileError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', tradeRow.user_id)
        .single();

      if (profileError) throw profileError;
      const currentBalance = Number(profileData?.balance ?? 0);

      // when we opened the trade we deducted margin_used. On close we return margin_used + profit_loss.
      const newBalance = currentBalance + marginUsed + computedPL;

      const { error: updateProfileError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', tradeRow.user_id);

      if (updateProfileError) throw updateProfileError;

      // audit log
      await supabase.from('audit_logs').insert({
        admin_id: adminUser?.id,
        action_type: 'close_trade_by_admin',
        target_user_id: tradeRow.user_id,
        target_table: 'trades',
        target_id: tradeRow.id,
        old_value: { status: tradeRow.status, profit_loss: tradeRow.profit_loss, margin_used: tradeRow.margin_used },
        new_value: { status: 'closed', profit_loss: computedPL, exit_price: curExit },
        description: `Admin closed trade ${tradeRow.id} for user ${tradeRow.user_id}. P&L ${computedPL >= 0 ? '+' : ''}${computedPL}, margin returned ${marginUsed}`
      });

      toast({ title: 'Trade closed', description: `Trade closed. P&L ${computedPL >= 0 ? '+' : ''}${computedPL.toFixed(2)}` });
      fetchTrades(tradeRow.user_id);
      fetchUsers();
    } catch (err: any) {
      console.error('closeTradeForUser error', err);
      toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete trade (admin)
  const deleteTrade = async (tradeId: string, userId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('trades').delete().eq('id', tradeId);
      if (error) throw error;
      await supabase.from('audit_logs').insert({
        admin_id: adminUser?.id,
        action_type: 'delete_trade_by_admin',
        target_user_id: userId,
        target_table: 'trades',
        target_id: tradeId,
        description: `Admin deleted trade ${tradeId} for user ${userId}`
      });
      toast({ title: 'Deleted', description: 'Trade deleted' });
      fetchTrades(userId);
    } catch (err: any) {
      console.error('deleteTrade error', err);
      toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // Edit handling — preserve existing behavior but ensure balance adjustments on status change
  // -------------------------
  const handleEdit = (trade: any) => {
    setEditingTrade(trade);
    setFormData({
      profit_loss: trade.profit_loss || 0,
      exit_price: trade.exit_price || trade.current_price || 0,
      status: trade.status,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrade) return;
    setIsLoading(true);

    try {
      const oldValues = {
        profit_loss: editingTrade.profit_loss,
        exit_price: editingTrade.exit_price,
        status: editingTrade.status,
      };

      // Update trade row
      const { error: tradeError } = await supabase
        .from('trades')
        .update({
          profit_loss: formData.profit_loss,
          exit_price: formData.exit_price,
          status: formData.status,
          closed_at: formData.status === 'closed' ? new Date().toISOString() : null,
        })
        .eq('id', editingTrade.id);

      if (tradeError) throw tradeError;

      // Log audit trail
      await supabase.from('audit_logs').insert({
        admin_id: adminUser?.id,
        action_type: 'update_trade',
        target_user_id: editingTrade.user_id,
        target_table: 'trades',
        target_id: editingTrade.id,
        old_value: oldValues,
        new_value: formData,
        description: `Admin modified trade for user ${editingTrade.user_id}`,
      });

      // If the trade was changed to closed and previously wasn't closed, update user's balance accordingly
      if (formData.status === 'closed' && editingTrade.status !== 'closed') {
        // fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', editingTrade.user_id)
          .single();

        if (profileError) throw profileError;
        const currentBalance = Number(profileData?.balance ?? 0);

        // Ensure margin_used present
        const marginUsed = Number(editingTrade.margin_used ?? 0);

        // new balance: return margin_used and apply provided profit_loss
        const newBalance = currentBalance + marginUsed + Number(formData.profit_loss || 0);

        await supabase
          .from('wallets')
          .update({ balance: newBalance })
          .eq('user_id', editingTrade.user_id);

        // Log balance update
        await supabase.from('audit_logs').insert({
          admin_id: adminUser?.id,
          action_type: 'update_user_balance',
          target_user_id: editingTrade.user_id,
          target_table: 'wallets',
          old_value: { balance: profileData?.balance },
          new_value: { balance: newBalance },
          description: `Balance updated due to admin closing trade: ${formData.profit_loss >= 0 ? '+' : ''}$${formData.profit_loss}`,
        });
      }

      toast({
        title: 'Success',
        description: 'Trade updated successfully',
      });

      fetchTrades(editingTrade.user_id);
      setEditingTrade(null);
    } catch (error: any) {
      console.error('handleSubmit error', error);
      toast({
        title: 'Error',
        description: error.message || String(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // Create trade dialog submit
  // -------------------------
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.user_id) {
      toast({ title: 'Select user', description: 'Please choose a user to create trade for', variant: 'destructive' });
      return;
    }

    const payload = {
      user_id: createForm.user_id,
      symbol: createForm.symbol,
      trade_type: createForm.trade_type,
      order_type: createForm.order_type,
      entry_price: Number(createForm.entry_price || prices[createForm.symbol] || 0),
      lot_size: Number(createForm.lot_size || 0.1),
      leverage: Number(Math.floor(Number(createForm.leverage) || 1)),
      stop_loss: createForm.stop_loss || null,
      take_profit: createForm.take_profit || null,
    };

    if (!payload.entry_price || payload.entry_price <= 0) {
      toast({ title: 'Invalid entry', description: 'Entry price required', variant: 'destructive' });
      return;
    }

    if (createForm.status === 'open') {
      await openTradeForUser(payload);
    } else if (createForm.status === 'pending') {
      await insertPendingTradeForUser(payload);
    } else {
      // If admin chooses to create closed trade history item, insert closed row and adjust balance accordingly:
      setIsLoading(true);
      try {
        const margin_used = calculateMarginUsed(payload.entry_price, payload.lot_size, payload.leverage);
        // compute profit/loss from entry vs current (best-effort) or 0
        const cur = prices[payload.symbol] ?? payload.entry_price;
        const diff = payload.trade_type === 'buy' ? (cur - payload.entry_price) : (payload.entry_price - cur);
        const profit_loss = +(diff * payload.lot_size * payload.leverage);

        // insert closed trade
        const { error } = await supabase.from('trades').insert({
          user_id: payload.user_id,
          symbol: payload.symbol,
          trade_type: payload.trade_type,
          market_type: SYMBOL_MAP[payload.symbol]?.type ?? 'crypto',
          order_type: payload.order_type,
          entry_price: payload.entry_price,
          exit_price: cur,
          lot_size: payload.lot_size,
          leverage: payload.leverage,
          stop_loss: payload.stop_loss,
          take_profit: payload.take_profit,
          margin_used,
          profit_loss,
          status: 'closed',
          created_at: new Date().toISOString(),
          closed_at: new Date().toISOString()
        });

        if (error) throw error;

        // update profile balance: add margin_used + profit_loss (assumes margin_used was not deducted earlier)
        const { data: profileData, error: profileError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', payload.user_id)
          .single();

        if (profileError) throw profileError;
        const currentBalance = Number(profileData?.balance ?? 0);
        const newBalance = currentBalance + margin_used + profit_loss;

        await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', payload.user_id);

        await supabase.from('audit_logs').insert({
          admin_id: adminUser?.id,
          action_type: 'insert_closed_trade_by_admin',
          target_user_id: payload.user_id,
          target_table: 'trades',
          new_value: { symbol: payload.symbol, profit_loss, margin_used },
          description: `Admin inserted closed trade into history for ${payload.user_id}`,
        });

        toast({ title: 'Closed trade inserted', description: 'History entry added and balance adjusted' });
        fetchTrades(payload.user_id);
        fetchUsers();
      } catch (err: any) {
        console.error('create closed trade error', err);
        toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }

    setOpenCreateDialog(false);
  };

  // -------------------------
  // Small helpers
  // -------------------------
  const formatMoney = (n: number) => {
    if (!isFinite(n)) return '$0.00';
    return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // -------------------------
  // JSX (keeps your UI layout intact; adds create/open dialog + open/close buttons)
  // -------------------------
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Trading History Management
          </CardTitle>
          <CardDescription>View and modify user trading records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>Select User</Label>
                <Select value={selectedUserId} onValueChange={(v) => {
                  setSelectedUserId(v);
                  setCreateForm(prev => ({ ...prev, user_id: v }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.full_name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={() => {
                  if (!selectedUserId) {
                    toast({ title: 'Select user first', description: 'Please choose a user before creating a trade', variant: 'destructive' });
                    return;
                  }
                  setOpenCreateDialog(true);
                  setCreateForm(prev => ({ ...prev, user_id: selectedUserId, entry_price: prices[prev.symbol] || prev.entry_price }));
                }}>
                  Open / Create Trade
                </Button>
              </div>
            </div>

            {selectedUserId && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Entry Price</TableHead>
                      <TableHead>Exit Price</TableHead>
                      <TableHead>P&L</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No trades found for this user
                        </TableCell>
                      </TableRow>
                    ) : (
                      trades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell className="font-medium">{trade.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={trade.trade_type === 'buy' ? 'default' : 'secondary'}>
                              {trade.trade_type}
                            </Badge>
                          </TableCell>
                          <TableCell>${Number(trade.entry_price || 0)}</TableCell>
                          <TableCell>
                            ${trade.exit_price || trade.current_price || '-'}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                (Number(trade.profit_loss || 0)) >= 0
                                  ? 'text-success font-semibold'
                                  : 'text-destructive font-semibold'
                              }
                            >
                              {(Number(trade.profit_loss || 0)) >= 0 ? '+' : ''}$
                              {(Number(trade.profit_loss || 0)).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                trade.status === 'closed'
                                  ? 'secondary'
                                  : trade.status === 'open'
                                  ? 'default'
                                  : 'destructive'
                              }
                            >
                              {trade.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(trade.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(trade)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            {trade.status === 'open' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => closeTradeForUser(trade)}
                              >
                                Close
                              </Button>
                            )}

                            {trade.status === 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  // Activate pending (open) with current live price and deduct margin
                                  const livePrice = Number(prices[trade.symbol] || trade.entry_price || 0);
                                  if (!livePrice || livePrice <= 0) {
                                    toast({ title: 'No live price', description: 'Cannot activate order - price unavailable', variant: 'destructive' });
                                    return;
                                  }
                                  // call openTradeForUser but we need to convert existing DB pending entry into an open trade:
                                  setIsLoading(true);
                                  try {
                                    // compute margin
                                    const margin_used = calculateMarginUsed(livePrice, Number(trade.lot_size || 0), Number(trade.leverage || 1));
                                    // update trade row to open with margin_used and entry_price=livePrice
                                    const { error } = await supabase.from('trades').update({
                                      status: 'open',
                                      entry_price: livePrice,
                                      margin_used,
                                    }).eq('id', trade.id);
                                    if (error) throw error;

                                    // deduct margin from profile
                                    const { data: profileData, error: pErr } = await supabase.from('wallets').select('balance').eq('user_id', trade.user_id).single();
                                    if (pErr) throw pErr;
                                    const currentBalance = Number(profileData?.balance ?? 0);
                                    if (currentBalance < margin_used) {
                                      toast({ title: 'Insufficient funds', description: 'User cannot afford margin to activate this order', variant: 'destructive' });
                                      // rollback trade to pending
                                      await supabase.from('trades').update({ status: 'pending', margin_used: 0 }).eq('id', trade.id);
                                      setIsLoading(false);
                                      return;
                                    }
                                    await supabase.from('profiles').update({ balance: currentBalance - margin_used }).eq('user_id', trade.user_id);

                                    await supabase.from('audit_logs').insert({
                                      admin_id: adminUser?.id,
                                      action_type: 'activate_pending_by_admin',
                                      target_user_id: trade.user_id,
                                      target_table: 'trades',
                                      target_id: trade.id,
                                      new_value: { status: 'open', margin_used, entry_price: livePrice },
                                      description: `Admin activated pending trade ${trade.id}`,
                                    });

                                    toast({ title: 'Activated', description: 'Pending order activated and margin deducted' });
                                    fetchTrades(trade.user_id);
                                    fetchUsers();
                                  } catch (err: any) {
                                    console.error('activate pending error', err);
                                    toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' });
                                  } finally {
                                    setIsLoading(false);
                                  }
                                }}
                              >
                                Activate
                              </Button>
                            )}

                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => deleteTrade(trade.id, trade.user_id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog (keeps your original edit dialog) */}
      {editingTrade && (
        <Dialog open={!!editingTrade} onOpenChange={() => setEditingTrade(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Trade</DialogTitle>
              <DialogDescription>
                Modify trade details. Changes will be logged and may affect user balance.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-medium">{editingTrade.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entry Price:</span>
                  <span className="font-medium">${editingTrade.entry_price}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exit_price">Exit Price ($)</Label>
                <Input
                  id="exit_price"
                  type="number"
                  step="0.01"
                  value={formData.exit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, exit_price: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profit_loss">Profit/Loss ($)</Label>
                <Input
                  id="profit_loss"
                  type="number"
                  step="0.01"
                  value={formData.profit_loss}
                  onChange={(e) =>
                    setFormData({ ...formData, profit_loss: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  ⚠️ Changes will be logged and tracked. Closing a trade will update the user's
                  balance.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingTrade(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Create / Open Trade Dialog */}
      <Dialog open={openCreateDialog} onOpenChange={(open) => setOpenCreateDialog(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create / Open Trade</DialogTitle>
            <DialogDescription>
              Create a new trade for the selected user. Choose 'open' to deduct margin immediately, 'pending' to save a trigger order, or 'closed' to insert history entry.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>User</Label>
                <div className="p-2 bg-muted rounded">{users.find(u => u.user_id === createForm.user_id)?.full_name || '—'}</div>
              </div>

              <div>
                <Label>Symbol</Label>
                <Select value={createForm.symbol} onValueChange={(v) => setCreateForm(prev => ({ ...prev, symbol: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(SYMBOL_MAP).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Trade Type</Label>
                <Select value={createForm.trade_type} onValueChange={(v) => setCreateForm(prev => ({ ...prev, trade_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Order Type</Label>
                <Select value={createForm.order_type} onValueChange={(v) => setCreateForm(prev => ({ ...prev, order_type: v }))}>
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

              <div>
                <Label>Entry Price</Label>
                <Input type="number" step="0.0001" value={createForm.entry_price || prices[createForm.symbol] || ''} onChange={(e) => setCreateForm(prev => ({ ...prev, entry_price: Number(e.target.value) }))} placeholder={`${prices[createForm.symbol] ? 'Live: ' + prices[createForm.symbol] : ''}`} />
              </div>

              <div>
                <Label>Lot Size</Label>
                <Input type="number" step="0.01" value={createForm.lot_size} onChange={(e) => setCreateForm(prev => ({ ...prev, lot_size: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>Leverage</Label>
                <Input type="number" step="1" value={createForm.leverage} onChange={(e) => setCreateForm(prev => ({ ...prev, leverage: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>Stop Loss</Label>
                <Input type="number" step="0.0001" value={createForm.stop_loss || ''} onChange={(e) => setCreateForm(prev => ({ ...prev, stop_loss: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>Take Profit</Label>
                <Input type="number" step="0.0001" value={createForm.take_profit || ''} onChange={(e) => setCreateForm(prev => ({ ...prev, take_profit: Number(e.target.value) }))} />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={createForm.status} onValueChange={(v) => setCreateForm(prev => ({ ...prev, status: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open (deduct margin)</SelectItem>
                    <SelectItem value="pending">Pending (no deduction)</SelectItem>
                    <SelectItem value="closed">Closed (history entry)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>{isLoading ? 'Processing...' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTradingHistory;

