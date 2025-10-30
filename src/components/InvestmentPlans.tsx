import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Droplets, TrendingUp, Clock, DollarSign, Star } from "lucide-react";

const InvestmentPlans = () => {
  const plans = [
    {
      icon: TrendingUp,
      title: "Starter Plan",
      description: "Perfect for beginners looking to start their investment journey with consistent daily returns",
      minDeposit: "$100",
      maxDeposit: "$9,999",
      minDepositNum: 100,
      maxDepositNum: 9999,
      dailyReturn: "5.9%",
      duration: "5 days",
      referralBonus: "10%",
      riskLevel: "Low",
      riskColor: "bg-success",
      features: ["Daily 5.9% returns", "5-day investment cycle", "10% referral bonus", "Low risk entry"]
    },
    {
      icon: Building,
      title: "Pro Plan",
      description: "Advanced investment plan for experienced investors seeking higher returns over a week",
      minDeposit: "$10,000",
      maxDeposit: "$49,999",
      minDepositNum: 10000,
      maxDepositNum: 49999,
      dailyReturn: "9.6%",
      duration: "7 days",
      referralBonus: "10%",
      riskLevel: "low",
      riskColor: "bg-success",
      features: ["Daily 9.6% returns", "7-day investment cycle", "10% referral bonus", "Priority support"]
    },
    {
      icon: Star,
      title: "Enterprise Plan",
      description: "Premium business solution with maximum returns and unlimited investment potential",
      minDeposit: "$50,000",
      maxDeposit: "Unlimited",
      minDepositNum: 50000,
      maxDepositNum: null,
      dailyReturn: "20.9%",
      duration: "4 days",
      referralBonus: "—",
      riskLevel: "low",
      riskColor: "bg-success",
      features: ["Daily 20.9% returns", "4-day investment cycle", "Dedicated account manager", "Custom solutions"]
    }
  ];

  return (
    <section id="plans" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Investment Opportunities<br />
            <span className="text-gradient-primary">Tailored for Your Goals</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our curated investment plans designed to maximize returns 
            while managing risk across different asset classes and time horizons.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={plan.title}
              className="card-glass card-hover group relative overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <plan.icon className="w-7 h-7 text-primary" />
                  </div>
                  <Badge className={`${plan.riskColor} text-white text-xs px-2 py-1`}>
                    {plan.riskLevel} Risk
                  </Badge>
                </div>
                
                <CardTitle className="text-xl group-hover:text-primary transition-colors mb-2">
                  {plan.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Min Investment:</span>
                    <span className="font-semibold text-sm">{plan.minDeposit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Max Investment:</span>
                    <span className="font-semibold text-sm">{plan.maxDeposit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Daily Returns:</span>
                    <span className="font-semibold text-sm text-success">{plan.dailyReturn}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Duration:</span>
                    <span className="font-semibold text-sm">{plan.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Referral Bonus:</span>
                    <span className="font-semibold text-sm text-primary">{plan.referralBonus}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm">Key Features:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-xs text-muted-foreground">
                        <Star className="w-3 h-3 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className="w-full btn-hero group"
                  onClick={() => {
                    const user = localStorage.getItem('supabase.auth.token');
                    if (user) {
                      window.location.href = '/dashboard';
                    } else {
                      window.location.href = '/auth';
                    }
                  }}
                >
                  Invest Now
                  <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>

              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Custom investment solutions available for qualified investors
          </p>
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Schedule Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InvestmentPlans;
