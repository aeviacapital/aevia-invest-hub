import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, DollarSign, Star, Copy, UserCheck } from 'lucide-react';

const CopyTrading = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [traders, setTraders] = useState<any[]>([]);
  const [copyTrades, setCopyTrades] = useState<any[]>([]);
  const [copyAmount, setCopyAmount] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTraders();
    fetchCopyTrades();
  }, [user]);

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
      .select(`
        *,
        trader_profiles (*)
      `)
      .eq('user_id', user.id);

    setCopyTrades(data || []);
  };

  const handleCopyTrader = async (traderId: string, amount: number) => {
    if (!user || !amount || amount <= 0) return;

    setIsLoading(true);

    try {
      const trader = traders.find(t => t.id === traderId);
      
      if (amount < trader.min_copy_amount || amount > trader.max_copy_amount) {
        throw new Error(`Amount must be between $${trader.min_copy_amount} and $${trader.max_copy_amount}`);
      }

      const { error } = await supabase
        .from('copy_trading')
        .insert({
          user_id: user.id,
          trader_id: traderId,
          copy_amount: amount,
          is_active: true
        });

      if (error) throw error;

      // Update trader followers count
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
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  const handleStopCopying = async (copyTradeId: string, traderId: string) => {
    try {
      const { error } = await supabase
        .from('copy_trading')
        .update({ is_active: false })
        .eq('id', copyTradeId);

      if (error) throw error;

      // Update trader followers count
      const trader = traders.find(t => t.id === traderId);
      if (trader) {
        await supabase
          .from('trader_profiles')
          .update({ followers_count: Math.max(0, trader.followers_count - 1) })
          .eq('id', traderId);
      }

      toast({
        title: 'Success',
        description: 'Stopped copying trader successfully',
      });

      fetchTraders();
      fetchCopyTrades();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const isAlreadyCopying = (traderId: string) => {
    return copyTrades.some(ct => ct.trader_id === traderId && ct.is_active);
  };

  return (
    <div className="space-y-6">
      {/* Active Copy Trades */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Your Copy Trades
          </CardTitle>
          <CardDescription>
            Traders you are currently copying
          </CardDescription>
        </CardHeader>
        <CardContent>
          {copyTrades.filter(ct => ct.is_active).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You are not copying any traders yet. Browse available traders below.
            </div>
          ) : (
            <div className="grid gap-4">
              {copyTrades.filter(ct => ct.is_active).map((copyTrade) => (
                <div key={copyTrade.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
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
                          ROI: {copyTrade.trader_profiles.roi_percentage}% | 
                          Copy Amount: ${copyTrade.copy_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Profit</p>
                        <p className={`font-medium ${parseFloat(copyTrade.total_profit) >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${parseFloat(copyTrade.total_profit).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
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
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Top Traders
          </CardTitle>
          <CardDescription>
            Browse and copy successful traders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {traders.map((trader) => (
              <Card key={trader.id} className="border-2 hover:border-primary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={trader.avatar_url} />
                        <AvatarFallback>
                          {trader.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{trader.username}</h3>
                        <p className="text-muted-foreground max-w-md">{trader.bio}</p>
                        <div className="flex items-center space-x-2 mt-2">
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
                      <div className="text-2xl font-bold text-success">
                        +{trader.roi_percentage}%
                      </div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{trader.total_trades}</div>
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{trader.winning_trades}</div>
                      <p className="text-sm text-muted-foreground">Winning Trades</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{trader.total_trades - trader.winning_trades}</div>
                      <p className="text-sm text-muted-foreground">Losing Trades</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Copy Range: ${trader.min_copy_amount.toLocaleString()} - ${trader.max_copy_amount.toLocaleString()}
                        </p>
                      </div>
                      
                      {isAlreadyCopying(trader.id) ? (
                        <Badge variant="default" className="bg-success">
                          <Copy className="w-3 h-3 mr-1" />
                          Already Copying
                        </Badge>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col space-y-1">
                            <Label htmlFor={`amount-${trader.id}`} className="text-xs">
                              Copy Amount ($)
                            </Label>
                            <Input
                              id={`amount-${trader.id}`}
                              type="number"
                              placeholder={`Min $${trader.min_copy_amount}`}
                              value={copyAmount[trader.id] || ''}
                              onChange={(e) => setCopyAmount(prev => ({
                                ...prev,
                                [trader.id]: parseFloat(e.target.value) || 0
                              }))}
                              className="w-32"
                            />
                          </div>
                          <Button
                            onClick={() => handleCopyTrader(trader.id, copyAmount[trader.id] || 0)}
                            disabled={isLoading || !copyAmount[trader.id]}
                            className="btn-hero"
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