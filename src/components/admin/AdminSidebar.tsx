import { Users, CreditCard, Banknote, Shield, TrendingUp, Settings, Bell, BarChart3, FileText, FolderKanban, UserPlus, Mail } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {Link} from "react-router-dom";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const adminItems = [
  { id: 'users', title: 'Users', icon: Users },
  { id: 'deposits', title: 'Deposits', icon: CreditCard },
  { id: 'withdrawals', title: 'Withdrawals', icon: Banknote },
  { id: 'kyc', title: 'KYC Verification', icon: Shield },
  { id: 'investments', title: 'Investments', icon: TrendingUp },
  { id: 'traders', title: 'Traders', icon: BarChart3 },
  { id: 'loans', title: 'Loans', icon: FileText },
  { id: 'investment-plans', title: 'Investment Plans', icon: FolderKanban },
  { id: 'trading-history', title: 'Trading History', icon: BarChart3 },
  { id: 'referrals', title: 'Referrals', icon: UserPlus },
  { id: 'notifications', title: 'Notifications', icon: Bell },
  { id: 'settings', title: 'Settings', icon: Settings },
  {id: 'send-email', title: "Send Email", icon: Mail},
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12  flex items-center justify-center ">
             <div className="flex items-center space-x-2">
  <img 
    src="/logo.png" 
    alt="Aevia Capital Logo"
    className="h-20 sm:h-22 w-auto" // Set the height and auto-scale the width
  />
  </div>

            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-gradient-primary">Admin</span>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full justify-start ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
