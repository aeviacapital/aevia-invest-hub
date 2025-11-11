import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Zap,
  Copy,
  TrendingUp,
  CreditCard,
  Banknote,
  Briefcase,
  UserPlus,
  ShieldCheck,
  Bell,
  User,
  LucideIcon,
} from "lucide-react";

import TradingSimulation from "@/components/dashboard/TradingSimulation";
import CopyTrading from "@/components/dashboard/CopyTrading";
import Investments from "@/components/dashboard/Investments";
import Deposits from "@/components/dashboard/Deposits";
import Withdrawals from "@/components/dashboard/Withdrawals";
import KYCVerification from "@/components/dashboard/KYCVerification";
import Profile from "@/components/dashboard/Profile";
import Notifications from "@/components/dashboard/Notifications";
import { Loans } from "@/components/dashboard/Loans";
import Referrals from "@/components/dashboard/Referrals";

interface TabItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

const tabItems: TabItem[] = [
  { value: "trading", label: "Trading", icon: Zap },
  { value: "copy-trading", label: "Copy Trading", icon: Copy },
  { value: "investments", label: "Investments", icon: TrendingUp },
  { value: "deposits", label: "Deposits", icon: CreditCard },
  { value: "withdrawals", label: "Withdrawals", icon: Banknote },
  { value: "loans", label: "Loans", icon: Briefcase },
  { value: "referrals", label: "Referrals", icon: UserPlus },
  { value: "kyc", label: "KYC", icon: ShieldCheck },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "profile", label: "Profile", icon: User },
];

function AccountTabs() {
  return (
    <Tabs className="w-full" defaultValue="trading">
      {/* --- Tabs Header (Scrollable on small screens) --- */}
      <div
        className="
          w-full 
          overflow-x-auto 
          no-scrollbar 
          px-4 pb-3 
          border-b border-gray-800 
          relative z-10
        "
      >
        <TabsList
          className="
            flex 
            gap-2 
            min-w-max
            bg-transparent 
            mx-auto 
            md:justify-center
          "
        >
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="
                  flex items-center gap-2
                  px-4 py-2
                  text-sm font-medium
                  text-gray-300 hover:text-yellow-400
                  rounded-md
                  transition-all duration-200 ease-in-out
                  whitespace-nowrap
                  focus-visible:outline-none

                  data-[state=active]:text-yellow-500
                  data-[state=active]:shadow-[0_2px_10px_-2px_rgba(234,179,8,0.5)]
                  data-[state=active]:bg-gray-900
                "
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* --- Tabs Content --- */}
      <div className="mt-6 px-4">
        <TabsContent value="trading">
          <TradingSimulation />
        </TabsContent>
        <TabsContent value="copy-trading">
          <CopyTrading />
        </TabsContent>
        <TabsContent value="investments">
          <Investments />
        </TabsContent>
        <TabsContent value="deposits">
          <Deposits />
        </TabsContent>
        <TabsContent value="withdrawals">
          <Withdrawals />
        </TabsContent>
        <TabsContent value="loans">
          <Loans />
        </TabsContent>
        <TabsContent value="referrals">
          <Referrals />
        </TabsContent>
        <TabsContent value="kyc">
          <KYCVerification />
        </TabsContent>
        <TabsContent value="notifications">
          <Notifications />
        </TabsContent>
        <TabsContent value="profile">
          <Profile />
        </TabsContent>
      </div>
    </Tabs>
  );
}

export default AccountTabs;

/* --- Tailwind Custom Class for Hiding Scrollbars --- */
/* Add this to your global.css or tailwind.css */

