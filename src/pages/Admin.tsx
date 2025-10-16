import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminDeposits } from '@/components/admin/AdminDeposits';
import { AdminWithdrawals } from '@/components/admin/AdminWithdrawals';
import { AdminKYC } from '@/components/admin/AdminKYC';
import { AdminInvestments } from '@/components/admin/AdminInvestments';
import { AdminSettings } from '@/components/admin/AdminSettings';
import AdminNotifications from '@/components/admin/AdminNotifications';
import AdminTraders from '@/components/admin/AdminTraders';
import { AdminLoans } from '@/components/admin/AdminLoans';
import { AdminInvestmentPlans } from '@/components/admin/AdminInvestmentPlans';
import { AdminTradingHistory } from '@/components/admin/AdminTradingHistory';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="flex-1 overflow-x-hidden">
            {/* Header */}
            <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
              <div className="flex items-center justify-between px-4 md:px-6 h-full">
                <div className="flex items-center gap-2 md:gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-base md:text-xl font-semibold text-gradient-primary">
                      Admin Dashboard
                    </h1>
                    <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                      Manage your platform
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={signOut}
                  className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </header>

            {/* Content */}
            <div className="p-4 md:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="users">
                  <AdminUsers />
                </TabsContent>
                <TabsContent value="deposits">
                  <AdminDeposits />
                </TabsContent>
                <TabsContent value="withdrawals">
                  <AdminWithdrawals />
                </TabsContent>
                <TabsContent value="kyc">
                  <AdminKYC />
                </TabsContent>
                <TabsContent value="investments">
                  <AdminInvestments />
                </TabsContent>
                <TabsContent value="settings">
                  <AdminSettings />
                </TabsContent>
                <TabsContent value="notifications">
                  <AdminNotifications />
                </TabsContent>
                <TabsContent value="traders">
                  <AdminTraders />
                </TabsContent>
                <TabsContent value="loans">
                  <AdminLoans />
                </TabsContent>
                <TabsContent value="investment-plans">
                  <AdminInvestmentPlans />
                </TabsContent>
                <TabsContent value="trading-history">
                  <AdminTradingHistory />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Admin;