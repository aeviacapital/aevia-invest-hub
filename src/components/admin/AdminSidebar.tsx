import { Users, CreditCard, Banknote, Shield, TrendingUp, Settings } from 'lucide-react';
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
  { id: 'settings', title: 'Settings', icon: Settings },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
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