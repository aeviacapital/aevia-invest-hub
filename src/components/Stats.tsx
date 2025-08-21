import { TrendingUp, Users, DollarSign, Award } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      icon: Users,
      value: "12.5k+",
      label: "Happy User satisfied",
      color: "text-primary"
    },
    {
      icon: TrendingUp,
      value: "94%",
      label: "Satisfaction Rate",
      color: "text-success"
    },
    {
      icon: DollarSign,
      value: "$2.5B+",
      label: "Assets Under Management",
      color: "text-primary"
    },
    {
      icon: Award,
      value: "99.9%",
      label: "Uptime Reliability",
      color: "text-success"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className="text-center group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.color} bg-background/50 rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold text-foreground group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;