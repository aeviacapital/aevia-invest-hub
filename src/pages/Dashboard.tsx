import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  Wallet,
  CreditCard,
  Settings,
  LogOut,
  FileText,
  Award
} from 'lucide-react';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import TradingSimulation from '@/components/dashboard/TradingSimulation';
import CopyTrading from '@/components/dashboard/CopyTrading';
import Investments from '@/components/dashboard/Investments';
import Deposits from '@/components/dashboard/Deposits';
import Withdrawals from '@/components/dashboard/Withdrawals';
import KYCVerification from '@/components/dashboard/KYCVerification';
import Profile from '@/components/dashboard/Profile';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [stats, setStats] = useState({
    balance: 0,
    demoBalance: 0,
    totalInvestments: 0,
    activeInvestments: 0,
    totalTrades: 0,
    winRate: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return;

      // Fetch user investments
      const { data: investments } = await supabase
        .from('user_investments')
        .select('*')
        .eq('user_id', user.id);

      // Fetch user trades
      const { data: trades } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);

      const totalInvestments = investments?.reduce((sum, inv) => sum + parseFloat(inv.amount.toString()), 0) || 0;
      const activeInvestments = investments?.filter(inv => inv.status === 'active').length || 0;
      const totalTrades = trades?.length || 0;
      const winningTrades = trades?.filter(trade => parseFloat(trade.profit_loss.toString()) > 0).length || 0;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

      setStats({
        balance: profile?.balance || 0,
        demoBalance: profile?.demo_balance || 10000,
        totalInvestments,
        activeInvestments,
        totalTrades,
        winRate
      });
    };

    fetchDashboardStats();
  }, [user, profile]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Real Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ${stats.balance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demo Balance</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${stats.demoBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Practice trading</p>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                ${stats.totalInvestments.toLocaleString()}
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

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="trading" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="copy-trading">Copy Trading</TabsTrigger>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

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

          <TabsContent value="kyc" className="mt-6">
            <KYCVerification />
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