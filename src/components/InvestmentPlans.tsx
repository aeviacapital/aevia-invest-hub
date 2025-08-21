import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Droplets, TrendingUp, Clock, DollarSign, Star } from "lucide-react";

const InvestmentPlans = () => {
  const plans = [
    {
      icon: Building,
      title: "Premium Real Estate",
      description: "Diversified real estate portfolio with prime commercial and residential properties",
      minDeposit: "$10,000",
      expectedReturn: "12-18%",
      duration: "12-24 months",
      riskLevel: "Medium",
      riskColor: "bg-warning",
      features: ["Prime locations", "Professional management", "Quarterly returns", "Exit flexibility"]
    },
    {
      icon: Droplets,
      title: "Oil & Gas Ventures",
      description: "Strategic investments in established oil fields and gas exploration projects",
      minDeposit: "$25,000",
      expectedReturn: "15-25%",
      duration: "18-36 months",
      riskLevel: "High",
      riskColor: "bg-destructive",
      features: ["Proven reserves", "Industry expertise", "Market hedging", "High yield potential"]
    },
    {
      icon: TrendingUp,
      title: "Crypto Trading Portfolio",
      description: "Algorithmic trading strategies across major cryptocurrencies with risk management",
      minDeposit: "$5,000",
      expectedReturn: "20-40%",
      duration: "6-12 months",
      riskLevel: "High",
      riskColor: "bg-destructive",
      features: ["24/7 trading", "AI algorithms", "Risk controls", "Real-time monitoring"]
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
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground">Min Deposit</p>
                    <p className="font-semibold text-sm">{plan.minDeposit}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground">Returns</p>
                    <p className="font-semibold text-sm text-success">{plan.expectedReturn}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold text-sm">{plan.duration}</p>
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

                <Button className="w-full btn-hero group">
                  Start Investing
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