import React, { useState, useEffect } from 'react';
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
import { TrendingUp, TrendingDown, Activity, DollarSign, Clock } from 'lucide-react';

const TradingSimulation = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tradeForm, setTradeForm] = useState({
    symbol: 'BTC/USD',
    tradeType: 'buy',
    marketType: 'crypto',
    lotSize: 0.1,
    leverage: 1,
    entryPrice: 0
  });

  // Mock price data - in real app, this would come from TradingView or price API
  const mockPrices = {
    'BTC/USD': 43250.00,
    'ETH/USD': 2580.00,
    'EUR/USD': 1.0875,
    'GBP/USD': 1.2650,
    'USD/JPY': 148.75
  };

  useEffect(() => {
    fetchTrades();
    setTradeForm(prev => ({ ...prev, entryPrice: mockPrices[prev.symbol as keyof typeof mockPrices] }));
  }, [user]);

  const fetchTrades = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setTrades(data || []);
  };

  const handleInputChange = (field: string, value: any) => {
    setTradeForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Update entry price when symbol changes
    if (field === 'symbol') {
      setTradeForm(prev => ({
        ...prev,
        entryPrice: mockPrices[value as keyof typeof mockPrices]
      }));
    }
  };

  const executeTrade = async () => {
    if (!user || tradeForm.entryPrice <= 0 || tradeForm.lotSize <= 0) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          symbol: tradeForm.symbol,
          trade_type: tradeForm.tradeType,
          market_type: tradeForm.marketType,
          entry_price: tradeForm.entryPrice,
          lot_size: tradeForm.lotSize,
          leverage: tradeForm.leverage,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: 'Trade Executed',
        description: `${tradeForm.tradeType.toUpperCase()} order for ${tradeForm.symbol} has been placed.`,
      });

      fetchTrades();
      
      // Reset form
      setTradeForm(prev => ({
        ...prev,
        lotSize: 0.1,
        leverage: 1
      }));

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  const closeTrade = async (tradeId: string, currentPrice: number, entryPrice: number, tradeType: string, lotSize: number) => {
    try {
      // Calculate profit/loss
      const priceDiff = tradeType === 'buy' ? (currentPrice - entryPrice) : (entryPrice - currentPrice);
      const profitLoss = priceDiff * lotSize;

      const { error } = await supabase
        .from('trades')
        .update({
          exit_price: currentPrice,
          profit_loss: profitLoss,
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', tradeId);

      if (error) throw error;

      // Update demo balance
      const newDemoBalance = (profile?.demo_balance || 0) + profitLoss;
      await supabase
        .from('profiles')
        .update({ demo_balance: newDemoBalance })
        .eq('user_id', user?.id);

      toast({
        title: 'Trade Closed',
        description: `Trade closed with ${profitLoss >= 0 ? 'profit' : 'loss'}: $${Math.abs(profitLoss).toFixed(2)}`,
        variant: profitLoss >= 0 ? 'default' : 'destructive'
      });

      fetchTrades();
      refreshProfile();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Form */}
        <Card className="lg:col-span-1 card-glass">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Place Trade
            </CardTitle>
            <CardDescription>
              Demo trading with live market simulation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Market Type</Label>
              <Select value={tradeForm.marketType} onValueChange={(value) => handleInputChange('marketType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Symbol</Label>
              <Select value={tradeForm.symbol} onValueChange={(value) => handleInputChange('symbol', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Select value={tradeForm.tradeType} onValueChange={(value) => handleInputChange('tradeType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy (Long)</SelectItem>
                  <SelectItem value="sell">Sell (Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lot Size</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={tradeForm.lotSize}
                onChange={(e) => handleInputChange('lotSize', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Leverage</Label>
              <Select value={tradeForm.leverage.toString()} onValueChange={(value) => handleInputChange('leverage', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Label>Current Price</Label>
              <div className="text-2xl font-bold text-primary">
                ${tradeForm.entryPrice.toLocaleString()}
              </div>
            </div>

            <Button 
              onClick={executeTrade}
              disabled={isLoading}
              className={`w-full ${tradeForm.tradeType === 'buy' ? 'bg-success hover:bg-success/80' : 'bg-destructive hover:bg-destructive/80'}`}
            >
              {isLoading ? 'Executing...' : `${tradeForm.tradeType.toUpperCase()} ${tradeForm.symbol}`}
            </Button>
          </CardContent>
        </Card>

        {/* TradingView Chart Placeholder */}
        <Card className="lg:col-span-2 card-glass">
          <CardHeader>
            <CardTitle>Live Chart</CardTitle>
            <CardDescription>
              Real-time price data powered by TradingView
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">TradingView Chart</p>
                <p className="text-muted-foreground">
                  Integration with TradingView widget for {tradeForm.symbol}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Trades */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Your Trades
          </CardTitle>
          <CardDescription>
            Manage your open and closed positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open" className="w-full">
            <TabsList>
              <TabsTrigger value="open">Open Trades</TabsTrigger>
              <TabsTrigger value="closed">Trade History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="open" className="mt-4">
              <div className="space-y-4">
                {trades.filter(trade => trade.status === 'open').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No open trades. Place your first trade above.
                  </div>
                ) : (
                  trades.filter(trade => trade.status === 'open').map((trade) => (
                    <div key={trade.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge variant={trade.trade_type === 'buy' ? 'default' : 'destructive'}>
                            {trade.trade_type.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{trade.symbol}</span>
                          <span className="text-muted-foreground">
                            Lot: {trade.lot_size} | Leverage: 1:{trade.leverage}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => closeTrade(
                            trade.id,
                            mockPrices[trade.symbol as keyof typeof mockPrices],
                            parseFloat(trade.entry_price),
                            trade.trade_type,
                            parseFloat(trade.lot_size)
                          )}
                        >
                          Close Trade
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Entry Price</p>
                          <p className="font-medium">${parseFloat(trade.entry_price).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Price</p>
                          <p className="font-medium">${mockPrices[trade.symbol as keyof typeof mockPrices].toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Unrealized P&L</p>
                          <p className={`font-medium ${
                            trade.trade_type === 'buy' 
                              ? mockPrices[trade.symbol as keyof typeof mockPrices] > parseFloat(trade.entry_price) ? 'text-success' : 'text-destructive'
                              : mockPrices[trade.symbol as keyof typeof mockPrices] < parseFloat(trade.entry_price) ? 'text-success' : 'text-destructive'
                          }`}>
                            ${((trade.trade_type === 'buy' 
                              ? mockPrices[trade.symbol as keyof typeof mockPrices] - parseFloat(trade.entry_price)
                              : parseFloat(trade.entry_price) - mockPrices[trade.symbol as keyof typeof mockPrices]
                            ) * parseFloat(trade.lot_size)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="closed" className="mt-4">
              <div className="space-y-4">
                {trades.filter(trade => trade.status === 'closed').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No closed trades yet.
                  </div>
                ) : (
                  trades.filter(trade => trade.status === 'closed').map((trade) => (
                    <div key={trade.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge variant={trade.trade_type === 'buy' ? 'default' : 'destructive'}>
                            {trade.trade_type.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{trade.symbol}</span>
                          <Badge variant={parseFloat(trade.profit_loss) >= 0 ? 'default' : 'destructive'}>
                            {parseFloat(trade.profit_loss) >= 0 ? 'WIN' : 'LOSS'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(trade.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Entry</p>
                          <p className="font-medium">${parseFloat(trade.entry_price).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Exit</p>
                          <p className="font-medium">${parseFloat(trade.exit_price || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Lot Size</p>
                          <p className="font-medium">{trade.lot_size}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">P&L</p>
                          <p className={`font-medium ${parseFloat(trade.profit_loss) >= 0 ? 'text-success' : 'text-destructive'}`}>
                            ${parseFloat(trade.profit_loss).toFixed(2)}
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