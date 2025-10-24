import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Activity, Target, TrendingUp, Percent } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  trade_type: string;
  entry_price: number;
  lot_size: number;
  leverage: number;
  status?: string;
}

interface TradingMetricsProps {
  trades: Trade[];
  walletBalance: number | null;
  prices: Record<string, number>;
}

const TradingMetrics: React.FC<TradingMetricsProps> = ({ trades, walletBalance, prices }) => {
  const [metrics, setMetrics] = useState({
    equity: 0,
    floatingPNL: 0,
    margin: 0,
    freeMargin: 0,
    marginLevel: 0
  });

  useEffect(() => {
    if (!trades || trades.length === 0 || walletBalance === null) {
      setMetrics({
        equity: walletBalance || 0,
        floatingPNL: 0,
        margin: 0,
        freeMargin: walletBalance || 0,
        marginLevel: 0
      });
      return;
    }

    const openTrades = trades.filter(t => t.status === 'open');

    // --- Floating P&L computation from live prices ---
    let totalFloatingPNL = 0;
    let totalMarginUsed = 0;

    for (const trade of openTrades) {
      const currentPrice = prices[trade.symbol];
      if (!currentPrice) continue;

      const priceDiff =
        trade.trade_type === 'buy'
          ? currentPrice - trade.entry_price
          : trade.entry_price - currentPrice;

      const pnl = priceDiff * trade.lot_size * (trade.leverage || 1);
      totalFloatingPNL += pnl;

      const marginUsed = (trade.entry_price * trade.lot_size) / (trade.leverage || 1);
      totalMarginUsed += marginUsed;
    }

    const equity = (walletBalance || 0) + totalFloatingPNL;
    const freeMargin = equity - totalMarginUsed;
    const marginLevel = totalMarginUsed > 0 ? (equity / totalMarginUsed) * 100 : 0;

    setMetrics({
      equity,
      floatingPNL: totalFloatingPNL,
      margin: totalMarginUsed,
      freeMargin,
      marginLevel
    });
  }, [trades, walletBalance, prices]);

  const formatMoney = (val: number) =>
    `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
          <div className="text-2xl font-bold">{formatMoney(metrics.equity)}</div>
          <p className="text-xs text-muted-foreground mt-1">Balance + Floating P&L</p>
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
          <div
            className={`text-2xl font-bold ${
              metrics.floatingPNL >= 0 ? 'text-success' : 'text-destructive'
            }`}
          >
            {formatMoney(metrics.floatingPNL)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Unrealized profit/loss</p>
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
          <div className="text-2xl font-bold">{formatMoney(metrics.margin)}</div>
          <p className="text-xs text-muted-foreground mt-1">Margin used</p>
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
          <div className="text-2xl font-bold">{formatMoney(metrics.freeMargin)}</div>
          <p className="text-xs text-muted-foreground mt-1">Available to trade</p>
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
          <div
            className={`text-2xl font-bold ${
              metrics.marginLevel >= 100
                ? 'text-success'
                : metrics.marginLevel >= 50
                ? 'text-warning'
                : 'text-destructive'
            }`}
          >
            {metrics.marginLevel.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Health indicator</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingMetrics;

