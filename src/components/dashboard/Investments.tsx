import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  Droplets,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Plus,
} from "lucide-react";

const Investments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investmentPlans, setInvestmentPlans] = useState<any[]>([]);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [investmentAmounts, setInvestmentAmounts] = useState<{
    [key: string]: number;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvestmentPlans();
    fetchUserInvestments();
  }, [user]);

  const fetchInvestmentPlans = async () => {
    const { data } = await supabase
      .from("investment_plans")
      .select("*")
      .eq("is_active", true)
      .order("min_deposit", { ascending: true });

    setInvestmentPlans(data || []);
  };

  const fetchUserInvestments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_investments")
      .select(`*, investment_plans (*)`)
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    setUserInvestments(data || []);
  };

  const handleInvest = async (planId: string, amount: number) => {
    if (!user || !amount || amount <= 0) return;
    setIsLoading(true);

    try {
      const plan = investmentPlans.find((p) => p.id === planId);
      if (!plan) throw new Error("Investment plan not found");

      if (amount < parseFloat(plan.min_deposit.toString())) {
        throw new Error(
          `Minimum deposit is $${parseFloat(
            plan.min_deposit.toString()
          ).toLocaleString()}`
        );
      }

      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (!wallet || parseFloat(wallet.balance.toString()) < amount) {
        throw new Error("Insufficient balance. Please deposit funds first.");
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + plan.duration_days);

      const { data: existingInvestments } = await supabase
        .from("user_investments")
        .select("id")
        .eq("user_id", user.id);

      const isFirstInvestment =
        !existingInvestments || existingInvestments.length === 0;

      const { error: investError } = await supabase
        .from("user_investments")
        .insert({
          user_id: user.id,
          plan_id: planId,
          amount,
          status: "active",
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      if (investError) throw investError;

      const newBalance = parseFloat(wallet.balance.toString()) - amount;
      const { error: balanceError } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", user.id);

      if (balanceError) throw balanceError;

      if (isFirstInvestment) {
        const { data: referralData } = await supabase
          .from("wallets")
          .select("referred_by")
          .eq("user_id", user.id)
          .single();

        if (referralData?.referred_by) {
          const bonusAmount = amount * 0.1;

          await supabase
            .from("referrals")
            .update({
              bonus_earned: bonusAmount,
              first_investment_made: true,
            })
            .eq("referred_id", user.id);

          const { data: referrer } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", referralData.referred_by)
            .single();

          if (referrer) {
            await supabase
              .from("wallets")
              .update({
                balance: parseFloat(referrer.balance.toString()) + bonusAmount,
              })
              .eq("user_id", referralData.referred_by);
          }
        }
      }

      await fetch(
        "https://niwhcvzhvjqrqhyayarv.supabase.co/functions/v1/send-notification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "investment",
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            user_id: user.id,
            amount,
          }),
        }
      );

      toast({
        title: "Investment Successful",
        description: `Successfully invested $${amount.toLocaleString()} in ${plan.title}.`,
      });

      fetchUserInvestments();
      setInvestmentAmounts((prev) => ({ ...prev, [planId]: 0 }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const calculateProjectedReturns = (
    amount: number,
    minReturn: number,
    maxReturn: number
  ) => {
    const avg = (minReturn + maxReturn) / 2;
    return (amount * avg) / 100;
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "real_estate":
        return Building;
      case "oil_gas":
        return Droplets;
      default:
        return TrendingUp;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-success";
      case "medium":
        return "bg-warning";
      case "high":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* USER INVESTMENTS */}
      <Card className="card-glass w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
            <TrendingUp className="w-5 h-5 mr-2" />
            Your Investments
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Track your active investment portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userInvestments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm sm:text-base">
              No investments yet. Browse available plans below to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {userInvestments.map((investment) => {
                const Icon = getIconForType(
                  investment.investment_plans.investment_type
                );
                const progress = calculateProgress(
                  investment.start_date,
                  investment.end_date
                );
                const projectedReturns = calculateProjectedReturns(
                  parseFloat(investment.amount),
                  investment.investment_plans.expected_return_min,
                  investment.investment_plans.expected_return_max
                );

                return (
                  <Card key={investment.id} className="border-2">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-base sm:text-lg">
                              {investment.investment_plans.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {investment.investment_plans.investment_type
                                .replace("_", " ")
                                .toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${getRiskColor(
                            investment.investment_plans.risk_level
                          )} text-white`}
                        >
                          {investment.investment_plans.risk_level} Risk
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm sm:text-base mb-4">
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Investment
                          </p>
                          <p className="font-semibold">
                            ${parseFloat(investment.amount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Expected
                          </p>
                          <p className="font-semibold text-success">
                            ${projectedReturns.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">
                            Earned
                          </p>
                          <p className="font-semibold text-success">
                            ${parseFloat(investment.returns_earned).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Status</p>
                          <Badge
                            variant={
                              investment.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {investment.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
                          <span>
                            Start: {new Date(investment.start_date).toLocaleDateString()}
                          </span>
                          <span>
                            End: {new Date(investment.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* INVESTMENT OPPORTUNITIES */}
{/* INVESTMENT OPPORTUNITIES */}
<Card className="card-glass w-full">
  <CardHeader>
    <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
      <Plus className="w-5 h-5 mr-2" />
      Investment Opportunities
    </CardTitle>
    <CardDescription className="text-sm sm:text-base">
      Choose from our curated investment plans
    </CardDescription>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {investmentPlans.map((plan) => {
        const Icon = getIconForType(plan.investment_type);

        return (
          <Card
            key={plan.id}
            className="border-2 hover:border-primary/20 transition-colors flex flex-col"
          >
            <CardContent className="p-5 flex flex-col h-full justify-between">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {/* ICON CONTAINER */}
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold break-words">
                      {plan.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground break-words">
                      {plan.description}
                    </p>
                  </div>
                </div>

                {/* CLEAN BADGE */}
<Badge
  className={`${getRiskColor(
    plan.risk_level
  )} text-white font-medium rounded-md px-2.5 py-0.5 text-xs sm:text-sm leading-tight whitespace-nowrap`}
>
  {plan.risk_level} Risk
</Badge>
                
                </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div>
                  <div className="flex justify-center items-center mb-1">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Min Deposit</p>
                  <p className="font-semibold text-sm">
                    ${plan.min_deposit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <div className="flex justify-center items-center mb-1">
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <p className="text-xs text-muted-foreground">Returns</p>
                  <p className="font-semibold text-success text-sm">
                    {plan.expected_return_min}%-{plan.expected_return_max}%
                  </p>
                </div>
                <div>
                  <div className="flex justify-center items-center mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold text-sm">
                    {plan.duration_days} days
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-sm">Key Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {plan.features.map((feature: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start text-xs sm:text-sm text-muted-foreground"
                    >
                      <Star className="w-3.5 h-3.5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Input + Button Column */}
              <div className="mt-auto border-t pt-4 flex flex-col gap-4">
                <div className="flex flex-col">
                  <Label
                    htmlFor={`investment-${plan.id}`}
                    className="text-xs font-medium mb-1"
                  >
                    Investment Amount ($)
                  </Label>
                  <Input
                    id={`investment-${plan.id}`}
                    type="number"
                    placeholder={`Min $${plan.min_deposit.toLocaleString()}`}
                    value={investmentAmounts[plan.id] || ""}
                    onChange={(e) =>
                      setInvestmentAmounts((prev) => ({
                        ...prev,
                        [plan.id]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col items-start gap-2">
                  <p className="text-sm text-muted-foreground">
                    Projected Returns:{" "}
                    <span className="font-semibold text-foreground">
                      $
                      {calculateProjectedReturns(
                        investmentAmounts[plan.id] || plan.min_deposit,
                        plan.expected_return_min,
                        plan.expected_return_max
                      ).toLocaleString()}
                    </span>
                  </p>
                  <Button
                    onClick={() =>
                      handleInvest(plan.id, investmentAmounts[plan.id] || 0)
                    }
                    disabled={isLoading || !investmentAmounts[plan.id]}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Invest Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </CardContent>
</Card>
        
    </div>
  );
};
export default Investments;

