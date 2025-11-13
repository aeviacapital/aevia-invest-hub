import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Copy, Star, UserCheck } from 'lucide-react';

const CopyTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [traders, setTraders] = useState<any[]>([]);
  const [copyTrades, setCopyTrades] = useState<any[]>([]);
  const [copyAmount, setCopyAmount] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [liveProfits, setLiveProfits] = useState<{ [key: string]: number }>({});
  const simulationIntervals = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const cryptoPairs = [
    'BTC/USD', 'ETH/USD', 'BNB/USD', 'SOL/USD', 'XRP/USD', 
    'ADA/USD', 'DOGE/USD', 'AVAX/USD', 'LINK/USD', 'MATIC/USD'
  ];

  useEffect(() => {
    fetchTraders();
    fetchCopyTrades();
  }, [user]);

  useEffect(() => {
    copyTrades.filter(ct => ct.is_active).forEach(startTradeSimulation);
    return stopAllSimulations;
  }, [copyTrades]);

  const fetchTraders = async () => {
    const { data } = await supabase
      .from('trader_profiles')
      .select('*')
      .eq('is_active', true)
      .order('roi_percentage', { ascending: false });
    setTraders(data || []);
  };

  const fetchCopyTrades = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('copy_trading')
      .select(`*, trader_profiles(*)`)
      .eq('user_id', user.id);
    setCopyTrades(data || []);
  };

  const updateWalletBalance = async (profit: number) => {
    if (!user) return;
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    if (!wallet) return;
    const newBalance = Number(wallet.balance) + profit;
    await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);
  };

  const startTradeSimulation = (copyTrade: any) => {
    if (simulationIntervals.current[copyTrade.id]) return;
    simulationIntervals.current[copyTrade.id] = setInterval(async () => {
      const randomPair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
      const isWin = Math.random() < 0.9;
      const changePercent = Math.random() * (isWin ? 0.03 : 0.015);
      const profit = isWin ? copyTrade.copy_amount * changePercent : -copyTrade.copy_amount * changePercent;
      setLiveProfits(prev => ({
        ...prev,
        [copyTrade.id]: (prev[copyTrade.id] || 0) + profit,
      }));
      await supabase
        .from('copy_trading')
        .update({
          total_profit: (parseFloat(copyTrade.total_profit || 0) + profit).toFixed(2),
          last_trade_symbol: randomPair,
          last_profit: profit.toFixed(2),
        })
        .eq('id', copyTrade.id);
      if (Math.random() < 0.25) {
        toast({
          title: isWin ? '📈 Trade Won!' : '📉 Trade Lost!',
          description: `${randomPair} ${isWin ? 'profit' : 'loss'}: $${profit.toFixed(2)}`,
        });
      }
      fetchCopyTrades();
    }, 5000);
  };

  const stopAllSimulations = () => {
    Object.values(simulationIntervals.current).forEach(clearInterval);
    simulationIntervals.current = {};
  };

  const handleCopyTrader = async (traderId: string, amount: number) => {
    if (!user || !amount || amount <= 0) return;
    setIsLoading(true);
    try {
      const trader = traders.find(t => t.id === traderId);
      if (amount < trader.min_copy_amount || amount > trader.max_copy_amount) {
        throw new Error(`Amount must be between $${trader.min_copy_amount} and $${trader.max_copy_amount}`);
      }

      const existing = await supabase
        .from('copy_trading')
        .select('id')
        .eq('user_id', user.id)
        .eq('trader_id', traderId)
        .single();

      if (existing.data) {
        await supabase
          .from('copy_trading')
          .update({ copy_amount: amount, is_active: true })
          .eq('id', existing.data.id);
      } else {
        await supabase
          .from('copy_trading')
          .insert({
            user_id: user.id,
            trader_id: traderId,
            copy_amount: amount,
            is_active: true,
            total_profit: 0,
          });
      }

      await supabase
        .from('trader_profiles')
        .update({ followers_count: trader.followers_count + 1 })
        .eq('id', traderId);

      toast({
        title: 'Success',
        description: `You are now copying ${trader.username} with $${amount.toLocaleString()}`,
      });

      fetchTraders();
      fetchCopyTrades();
      setCopyAmount(prev => ({ ...prev, [traderId]: 0 }));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleStopCopying = async (copyTradeId: string, traderId: string) => {
    try {
      clearInterval(simulationIntervals.current[copyTradeId]);
      delete simulationIntervals.current[copyTradeId];
      const profit = liveProfits[copyTradeId] || 0;
      await updateWalletBalance(profit);
      const { error } = await supabase
        .from('copy_trading')
        .update({ is_active: false })
        .eq('id', copyTradeId);
      if (error) throw error;
      const trader = traders.find(t => t.id === traderId);
      if (trader) {
        await supabase
          .from('trader_profiles')
          .update({ followers_count: Math.max(0, trader.followers_count - 1) })
          .eq('id', traderId);
      }
      toast({
        title: 'Stopped',
        description: 'Stopped copying trader. Final balance updated.',
      });
      setLiveProfits(prev => {
        const updated = { ...prev };
        delete updated[copyTradeId];
        return updated;
      });
      fetchTraders();
      fetchCopyTrades();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const isAlreadyCopying = (traderId: string) => {
    return copyTrades.some(ct => ct.trader_id === traderId && ct.is_active);
  };

  // === RESPONSIVE UI ===
  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto">
      {/* Active Copy Trades */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center flex-wrap gap-2">
            <UserCheck className="w-5 h-5" />
            Your Copy Trades
          </CardTitle>
          <CardDescription>Traders you are currently copying</CardDescription>
        </CardHeader>
        <CardContent>
          {copyTrades.filter(ct => ct.is_active).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You are not copying any traders yet. Browse available traders below.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
              {copyTrades.filter(ct => ct.is_active).map((copyTrade) => (
                <div key={copyTrade.id} className="border rounded-lg p-4 flex flex-col justify-between h-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={copyTrade.trader_profiles.avatar_url} />
                        <AvatarFallback>
                          {copyTrade.trader_profiles.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{copyTrade.trader_profiles.username}</h3>
                        <p className="text-sm text-muted-foreground">
                          ROI: {copyTrade.trader_profiles.roi_percentage}% | Copy Amount: ${copyTrade.copy_amount.toLocaleString()}
                        </p>
                        {copyTrade.last_trade_symbol && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last Trade: {copyTrade.last_trade_symbol} | Profit: ${copyTrade.last_profit}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end space-y-2 sm:space-y-0 sm:space-x-4 sm:flex-row">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Profit</p>
                        <p className={`font-medium ${parseFloat(copyTrade.total_profit) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${((parseFloat(copyTrade.total_profit) + (liveProfits[copyTrade.id] || 0)).toFixed(2))}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => handleStopCopying(copyTrade.id, copyTrade.trader_id)}
                      >
                        Stop Copying
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Traders */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center flex-wrap gap-2">
            <Users className="w-5 h-5" />
            Top Traders
          </CardTitle>
          <CardDescription>Browse and copy successful traders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {traders.map((trader) => (
              <Card key={trader.id} className="border-2 hover:border-primary/20 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center  flex-col sm:flex-row space-x-4 ">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={trader.avatar_url} />
                        <AvatarFallback>
                          {trader.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{trader.username}</h3>
                        <p className="text-muted-foreground text-sm">{trader.bio}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            <Users className="w-3 h-3 mr-1" />
                            {trader.followers_count} followers
                          </Badge>
                          <Badge variant="outline">
                            <Star className="w-3 h-3 mr-1" />
                            {((trader.winning_trades / trader.total_trades) * 100).toFixed(1)}% win rate
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-success">+{trader.roi_percentage}%</div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 text-center gap-3">
                    <div>
                      <div className="text-lg font-semibold">{trader.total_trades}</div>
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{trader.winning_trades}</div>
                      <p className="text-sm text-muted-foreground">Winning Trades</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{trader.total_trades - trader.winning_trades}</div>
                      <p className="text-sm text-muted-foreground">Losing Trades</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        Copy Range: ${trader.min_copy_amount.toLocaleString()} - ${trader.max_copy_amount.toLocaleString()}
                      </p>

                      {isAlreadyCopying(trader.id) ? (
                        <Badge variant="default" className="bg-success">
                          <Copy className="w-3 h-3 mr-1" />
                          Already Copying
                        </Badge>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex flex-col">
                            <Label htmlFor={`amount-${trader.id}`} className="text-xs">
                              Copy Amount ($)
                            </Label>
                            <Input
                              id={`amount-${trader.id}`}
                              type="number"
                              placeholder={`Min $${trader.min_copy_amount}`}
                              value={copyAmount[trader.id] || ''}
                              onChange={(e) =>
                                setCopyAmount(prev => ({
                                  ...prev,
                                  [trader.id]: parseFloat(e.target.value) || 0,
                                }))
                              }
                              className="w-full sm:w-32"
                            />
                          </div>
                          <Button
                            onClick={() => handleCopyTrader(trader.id, copyAmount[trader.id] || 0)}
                            disabled={isLoading || !copyAmount[trader.id]}
                            className="btn-hero w-full sm:w-auto"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Trader
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CopyTrading;

