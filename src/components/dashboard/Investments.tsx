import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Building, Droplets, TrendingUp, Clock, DollarSign, Star, Plus } from 'lucide-react';

const Investments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investmentPlans, setInvestmentPlans] = useState<any[]>([]);
  const [userInvestments, setUserInvestments] = useState<any[]>([]);
  const [investmentAmounts, setInvestmentAmounts] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvestmentPlans();
    fetchUserInvestments();
  }, [user]);

  const fetchInvestmentPlans = async () => {
    const { data } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('is_active', true)
      .order('min_deposit', { ascending: true });

    setInvestmentPlans(data || []);
  };

  const fetchUserInvestments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_investments')
      .select(`
        *,
        investment_plans (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setUserInvestments(data || []);
  };

  const handleInvest = async (planId: string, amount: number) => {
    if (!user || !amount || amount <= 0) return;

    setIsLoading(true);

    try {
      const plan = investmentPlans.find(p => p.id === planId);
      
      if (!plan) {
        throw new Error('Investment plan not found');
      }

      // Validate investment amount
      if (amount < parseFloat(plan.min_deposit.toString())) {
        throw new Error(`Minimum deposit is $${parseFloat(plan.min_deposit.toString()).toLocaleString()}`);
      }

      // Check user's balance
      const { data: profileData } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!profileData || parseFloat(profileData.balance.toString()) < amount) {
        throw new Error('Insufficient balance. Please deposit funds first.');
      }

      // Calculate end date based on duration
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration_months);

      // Check if this is the user's first investment for referral bonus
      const { data: existingInvestments } = await supabase
        .from('user_investments')
        .select('id')
        .eq('user_id', user.id);

      const isFirstInvestment = !existingInvestments || existingInvestments.length === 0;

      // Create investment
      const { error: investError } = await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          plan_id: planId,
          amount: amount,
          status: 'active',
          end_date: endDate.toISOString()
        });

      if (investError) throw investError;

      // Deduct amount from user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: parseFloat(profileData.balance.toString()) - amount 
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Handle referral bonus if first investment
      if (isFirstInvestment) {
        const { data: profileWithReferrer } = await supabase
          .from('profiles')
          .select('referred_by')
          .eq('user_id', user.id)
          .single();

        if (profileWithReferrer?.referred_by) {
          const bonusAmount = amount * 0.10; // 10% bonus
          
          // Update referral record
          await supabase
            .from('referrals')
            .update({
              bonus_earned: bonusAmount,
              first_investment_made: true
            })
            .eq('referred_id', user.id);

          // Add bonus to referrer's balance
          const { data: referrerProfile } = await supabase
            .from('profiles')
            .select('balance')
            .eq('user_id', profileWithReferrer.referred_by)
            .single();

          if (referrerProfile) {
            await supabase
              .from('profiles')
              .update({ 
                balance: parseFloat(referrerProfile.balance.toString()) + bonusAmount 
              })
              .eq('user_id', profileWithReferrer.referred_by);
          }
        }
      }

      toast({
        title: 'Investment Success',
        description: `Successfully invested $${amount.toLocaleString()} in ${plan.title}`,
      });

      fetchUserInvestments();
      setInvestmentAmounts(prev => ({ ...prev, [planId]: 0 }));

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsLoading(false);
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const calculateProjectedReturns = (amount: number, minReturn: number, maxReturn: number) => {
    const avgReturn = (minReturn + maxReturn) / 2;
    return (amount * avgReturn) / 100;
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'real_estate':
        return Building;
      case 'oil_gas':
        return Droplets;
      default:
        return TrendingUp;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-success';
      case 'medium':
        return 'bg-warning';
      case 'high':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Investments */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Your Investments
          </CardTitle>
          <CardDescription>
            Track your active investment portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userInvestments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No investments yet. Browse available plans below to get started.
            </div>
          ) : (
            <div className="grid gap-4">
              {userInvestments.map((investment) => {
                const progress = calculateProgress(investment.start_date, investment.end_date);
                const projectedReturns = calculateProjectedReturns(
                  parseFloat(investment.amount),
                  investment.investment_plans.expected_return_min,
                  investment.investment_plans.expected_return_max
                );
                const Icon = getIconForType(investment.investment_plans.investment_type);

                return (
                  <Card key={investment.id} className="border-2">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{investment.investment_plans.title}</h3>
                            <p className="text-muted-foreground">
                              {investment.investment_plans.investment_type.replace('_', ' ').toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${getRiskColor(investment.investment_plans.risk_level)} text-white`}>
                          {investment.investment_plans.risk_level} Risk
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Investment Amount</p>
                          <p className="font-semibold text-lg">${parseFloat(investment.amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expected Returns</p>
                          <p className="font-semibold text-lg text-success">
                            ${projectedReturns.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Returns Earned</p>
                          <p className="font-semibold text-lg text-success">
                            ${parseFloat(investment.returns_earned).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
                            {investment.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Started: {new Date(investment.start_date).toLocaleDateString()}</span>
                          <span>Ends: {new Date(investment.end_date).toLocaleDateString()}</span>
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

      {/* Available Investment Plans */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Investment Opportunities
          </CardTitle>
          <CardDescription>
            Choose from our curated investment plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {investmentPlans.map((plan) => {
              const Icon = getIconForType(plan.investment_type);

              return (
                <Card key={plan.id} className="border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{plan.title}</h3>
                          <p className="text-muted-foreground max-w-md">{plan.description}</p>
                        </div>
                      </div>
                      <Badge className={`${getRiskColor(plan.risk_level)} text-white`}>
                        {plan.risk_level} Risk
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <DollarSign className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs text-muted-foreground">Min Deposit</p>
                        <p className="font-semibold">${plan.min_deposit.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-success" />
                        </div>
                        <p className="text-xs text-muted-foreground">Returns</p>
                        <p className="font-semibold text-success">
                          {plan.expected_return_min}%-{plan.expected_return_max}%
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-semibold">{plan.duration_months} months</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium mb-3 text-sm">Key Features:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {plan.features.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center text-xs text-muted-foreground">
                            <Star className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Projected Returns: ${calculateProjectedReturns(
                              investmentAmounts[plan.id] || plan.min_deposit,
                              plan.expected_return_min,
                              plan.expected_return_max
                            ).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex flex-col space-y-1">
                            <Label htmlFor={`investment-${plan.id}`} className="text-xs">
                              Investment Amount ($)
                            </Label>
                            <Input
                              id={`investment-${plan.id}`}
                              type="number"
                              placeholder={`Min $${plan.min_deposit.toLocaleString()}`}
                              value={investmentAmounts[plan.id] || ''}
                              onChange={(e) => setInvestmentAmounts(prev => ({
                                ...prev,
                                [plan.id]: parseFloat(e.target.value) || 0
                              }))}
                              className="w-40"
                            />
                          </div>
                          <Button
                            onClick={() => handleInvest(plan.id, investmentAmounts[plan.id] || 0)}
                            disabled={isLoading || !investmentAmounts[plan.id]}
                            className="btn-hero mt-5"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Invest Now
                          </Button>
                        </div>
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