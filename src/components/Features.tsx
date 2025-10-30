import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Building, Droplets, Shield, Zap, PieChart, Globe } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Trading Simulation",
      description: "From real-time expense tracking to smart investment tools, Otiva gives you everything you need to stay on top of your finances - securely and effortlessly."
    },
    {
      icon: Users,
      title: "Copy Trading",
      description: "Follow successful traders and automatically copy their strategies. Learn from the best while building your portfolio."
    },
    {
      icon: Building,
      title: "Real Estate Investment",
      description: "Access premium real estate opportunities with structured investment plans and professional management."
    },
    {
      icon: Droplets,
      title: "Oil & Gas Investments",
      description: "Diversify your portfolio with energy sector investments backed by thorough market analysis."
    },
    {
      icon: Shield,
      title: "KYC & Security",
      description: "Bank-level security with comprehensive KYC verification to protect your investments and identity."
    },
    {
      icon: Zap,
      title: "Instant Deposits",
      description: "Quick deposits with Bitcoin, USDT, and Solana. Start investing immediately with real-time balance updates."
    },
    {
      icon: PieChart,
      title: "Portfolio Analytics",
      description: "Advanced analytics and insights to track your investment performance across all asset classes."
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Trade and invest from anywhere in the world with our multi-language platform and global compliance."
    }
  ];

  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">⭐ Cash Lens</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features Designed for<br />
            <span className="text-gradient-primary">Financial Clarity</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From real-time expense tracking to smart investment tools, Otiva gives you everything you 
            need to stay on top of your finances—securely and effortlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="card-glass card-hover group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
