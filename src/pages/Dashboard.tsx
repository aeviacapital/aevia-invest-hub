import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  Award,
} from 'lucide-react';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import AccountTabs from "@/pages/AccountTabs"; 

const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [stats, setStats] = useState({
    balance: 0,
    totalInvestments: 0,
    activeInvestments: 0,
    totalTrades: 0,
    winRate: 0,
  });
  const [loading, setLoading] = useState(true);

  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      refreshProfile();
      if (!user) return;
      setLoading(true);

      try {
        // ✅ Fetch wallet balance
        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (walletError) {
          console.warn('Wallet fetch error:', walletError.message);
        }

        // ✅ Fetch user investments
        const { data: investments } = await supabase
          .from('user_investments')
          .select('*')
          .eq('user_id', user.id);

        // ✅ Fetch user trades
        const { data: trades } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id);

        const totalInvestments =
          investments?.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0) || 0;

        const activeInvestments =
          investments?.filter((inv) => inv.status === 'active').length || 0;

        const totalTrades = trades?.length || 0;
        const winningTrades =
          trades?.filter((trade) => parseFloat(trade.profit_loss || 0) > 0).length || 0;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

        setStats({
          balance: wallet?.balance || 0,
          totalInvestments,
          activeInvestments,
          totalTrades,
          winRate,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
    refreshProfile(); 
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {profile?.full_name || 'Investor'}
              </h1>
              <p className="text-muted-foreground">
                Manage your investments and trading activities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={profile?.is_verified ? 'default' : 'destructive'}>
                {profile?.is_verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="outline" className="bg-primary/10">
                {profile?.kyc_status || 'pending'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="card-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {formatMoney(stats.balance)}
                </div>
                <p className="text-xs text-muted-foreground">Available for trading</p>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investments</CardTitle>
                <TrendingUp className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {formatMoney(stats.totalInvestments)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeInvestments} active plans
                </p>
              </CardContent>
            </Card>

            <Card className="card-glass">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <Award className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {stats.winRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalTrades} total trades
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Loading dashboard data...</p>
        )}

        {/* Main Dashboard Tabs */}
          <AccountTabs />
       </div>
    </div>
  );
};

export default Dashboard;

