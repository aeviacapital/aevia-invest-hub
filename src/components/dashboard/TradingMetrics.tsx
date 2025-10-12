import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, DollarSign, Target, Percent, Activity } from 'lucide-react';

const TradingMetrics = () => {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState({
    equity: 0,
    floatingPNL: 0,
    margin: 0,
    freeMargin: 0,
    marginLevel: 0
  });

  useEffect(() => {
    if (user) {
      calculateMetrics();
      const interval = setInterval(calculateMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user, profile]);

  const calculateMetrics = async () => {
    if (!user) return;

    // Fetch open trades
    const { data: trades } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'open');

    const openTrades = trades || [];
    
    // Calculate floating P&L from unrealized_pnl
    const floatingPNL = openTrades.reduce((sum, trade) => 
      sum + (parseFloat(trade.unrealized_pnl?.toString() || '0') || 0), 0
    );

    // Calculate margin used (sum of all margin_used)
    const margin = openTrades.reduce((sum, trade) => 
      sum + (parseFloat(trade.margin_used?.toString() || '0') || 0), 0
    );

    // Balance + floating P&L
    const balance = profile?.balance || 0;
    const equity = balance + floatingPNL;

    // Free margin = equity - margin used
    const freeMargin = equity - margin;

    // Margin level = (equity / margin) * 100 (if margin > 0)
    const marginLevel = margin > 0 ? (equity / margin) * 100 : 0;

    setMetrics({
      equity,
      floatingPNL,
      margin,
      freeMargin,
      marginLevel
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Equity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Balance + Floating P&L
          </p>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Floating P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.floatingPNL >= 0 ? 'text-success' : 'text-destructive'}`}>
            ${metrics.floatingPNL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Unrealized profit/loss
          </p>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Margin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.margin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Margin used
          </p>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Free Margin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${metrics.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Available to trade
          </p>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Percent className="w-4 h-4 mr-2" />
            Margin Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${
            metrics.marginLevel >= 100 ? 'text-success' :
            metrics.marginLevel >= 50 ? 'text-warning' : 'text-destructive'
          }`}>
            {metrics.marginLevel.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Health indicator
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingMetrics;
