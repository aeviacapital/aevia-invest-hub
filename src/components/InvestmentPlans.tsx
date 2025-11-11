import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, TrendingUp, Star } from "lucide-react";

const InvestmentPlans = () => {
  const BRAND_YELLOW = "#b58900"; // dark yellow brand color

  const plans = [
    {
      icon: TrendingUp,
      title: "Starter Plan",
      description:
        "Perfect for beginners looking to start their investment journey with consistent daily returns.",
      minDeposit: "$100",
      maxDeposit: "$9,999",
      dailyReturn: "5.9%",
      duration: "5 days",
      referralBonus: "10%",
      riskLevel: "Low",
      riskColor: "bg-green-600",
      features: [
        "Daily 5.9% returns",
        "5-day investment cycle",
        "10% referral bonus",
        "Low risk entry",
      ],
    },
    {
      icon: Building,
      title: "Pro Plan",
      description:
        "Advanced investment plan for experienced investors seeking higher returns over a week.",
      minDeposit: "$10,000",
      maxDeposit: "$49,999",
      dailyReturn: "9.6%",
      duration: "7 days",
      referralBonus: "10%",
      riskLevel: "Low",
      riskColor: "bg-green-600",
      features: [
        "Daily 9.6% returns",
        "7-day investment cycle",
        "10% referral bonus",
        "Priority support",
      ],
    },
    {
      icon: Star,
      title: "Enterprise Plan",
      description:
        "Premium business solution with maximum returns and unlimited investment potential.",
      minDeposit: "$50,000",
      maxDeposit: "Unlimited",
      dailyReturn: "20.9%",
      duration: "4 days",
      referralBonus: "—",
      riskLevel: "Low",
      riskColor: "bg-green-600",
      features: [
        "Daily 20.9% returns",
        "4-day investment cycle",
        "Dedicated account manager",
        "Custom solutions",
      ],
    },
  ];

  return (
    <section id="plans" className="w-full py-16 lg:py-24 bg-[#0a0a0a] text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-snug">
            Investment Opportunities
            <br />
            <span style={{ color: BRAND_YELLOW }}>Tailored for Your Goals</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Choose from our curated investment plans designed to maximize returns while managing risk across different asset classes and time horizons.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.title}
              className="flex flex-col justify-between w-full min-w-0 overflow-hidden rounded-2xl shadow-lg hover:shadow-yellow-900/30 transition-all bg-[#111] border border-gray-800"
            >
              {/* HEADER */}
              <CardHeader className="space-y-4 px-4 sm:px-6 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${BRAND_YELLOW}22` }}
                  >
                    <plan.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: BRAND_YELLOW }} />
                  </div>
                  <Badge
                    className={`${plan.riskColor} text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-full`}
                  >
                    {plan.riskLevel} Risk
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 text-white">
                    {plan.title}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm md:text-base text-gray-400 leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </div>
              </CardHeader>

              {/* CONTENT */}
              <CardContent className="flex flex-col justify-between flex-1 px-4 sm:px-6 pb-6">
                {/* Plan Details */}
                <div className="space-y-2 sm:space-y-3 mb-6">
                  {[
                    ["Min Investment:", plan.minDeposit],
                    ["Max Investment:", plan.maxDeposit],
                    ["Daily Returns:", plan.dailyReturn],
                    ["Duration:", plan.duration],
                    ["Referral Bonus:", plan.referralBonus],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center text-xs sm:text-sm md:text-base"
                    >
                      <span className="text-gray-400">{label}</span>
                      <span className="font-medium text-gray-100">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base text-white">
                    Key Features:
                  </h4>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start text-[11px] sm:text-xs md:text-sm text-gray-400"
                      >
                        <Star
                          className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 mr-2 flex-shrink-0"
                          style={{ color: BRAND_YELLOW }}
                        />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <Button
                  className="w-full text-xs sm:text-sm md:text-base px-4 sm:px-6 py-2.5 sm:py-3 font-semibold rounded-xl transition-all text-black"
                  style={{
                    backgroundColor: BRAND_YELLOW,
                    color: "#000",
                  }}
                  onClick={() => {
                    const user = localStorage.getItem("supabase.auth.token");
                    window.location.href = user ? "/dashboard" : "/auth";
                  }}
                >
                  Invest Now
                  <TrendingUp className="w-4 h-4 ml-2 inline-block sm:ml-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FOOTER */}
        <div className="text-center mt-12">
          <p className="text-xs sm:text-sm md:text-base text-gray-400 mb-4">
            Custom investment solutions available for qualified investors.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-8 py-2 sm:py-3 rounded-xl border"
            style={{
              borderColor: BRAND_YELLOW,
              color: BRAND_YELLOW,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = BRAND_YELLOW;
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = BRAND_YELLOW;
            }}
          >
            Schedule Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};
export default InvestmentPlans;

