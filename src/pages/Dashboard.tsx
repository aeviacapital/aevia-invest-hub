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
import TradingSimulation from '@/components/dashboard/TradingSimulation';
import CopyTrading from '@/components/dashboard/CopyTrading';
import Investments from '@/components/dashboard/Investments';
import Deposits from '@/components/dashboard/Deposits';
import Withdrawals from '@/components/dashboard/Withdrawals';
import KYCVerification from '@/components/dashboard/KYCVerification';
import Profile from '@/components/dashboard/Profile';
import Notifications from '@/components/dashboard/Notifications';
import { Loans } from '@/components/dashboard/Loans';
import Referrals from '@/components/dashboard/Referrals';

const Dashboard = () => {
  const { user, profile } = useAuth();
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
        <Tabs  className="w-full">
          <div className="w-full overflow-x-auto mx-4 px-4 pb-2 ">
            <TabsList className="w-full flex justify-start md:justify-center bg-transparent-500">
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="copy-trading">Copy Trading</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="kyc">KYC</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trading" className="mt-6">
            <TradingSimulation />
          </TabsContent>

          <TabsContent value="copy-trading" className="mt-6">
            <CopyTrading />
          </TabsContent>

          <TabsContent value="investments" className="mt-6">
            <Investments />
          </TabsContent>

          <TabsContent value="deposits" className="mt-6">
            <Deposits />
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-6">
            <Withdrawals />
          </TabsContent>

          <TabsContent value="loans" className="mt-6">
            <Loans />
          </TabsContent>

          <TabsContent value="referrals" className="mt-6">
            <Referrals />
          </TabsContent>

          <TabsContent value="kyc" className="mt-6">
            <KYCVerification />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Notifications />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Profile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

