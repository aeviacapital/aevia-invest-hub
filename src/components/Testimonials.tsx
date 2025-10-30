import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Portfolio Manager",
      company: "Goldman Investments",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face",
      content: "AeviaCapital has revolutionized how I manage my investment portfolio. The real-time insights and automated trading features have significantly improved my returns.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Crypto Trader",
      company: "Independent",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      content: "The copy trading feature is incredible. I've been following top traders and learning while earning. The platform is intuitive and the support team is outstanding.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Real Estate Investor",
      company: "Rodriguez Holdings",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      content: "Finally found a platform that offers both traditional and alternative investments. The real estate opportunities through AeviaCapital have exceeded my expectations.",
      rating: 5
    },
    {
      name: "David Kumar",
      role: "Financial Advisor",
      company: "Kumar Financial",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      content: "I recommend AeviaCapital to all my clients. The security features and compliance standards give me confidence, and the returns speak for themselves.",
      rating: 5
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentTestimonial];

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-gradient-primary">Investors</span> Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied investors who trust AeviaCapital 
            for their financial growth and investment success.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="card-glass border-primary/20 relative overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center">
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl leading-relaxed mb-8 text-foreground">
                "{current.content}"
              </blockquote>

              {/* Avatar and Info */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <img
                  src={current.avatar}
                  alt={current.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
                <div className="text-center md:text-left">
                  <p className="font-semibold text-lg text-foreground">{current.name}</p>
                  <p className="text-muted-foreground">
                    {current.role} • {current.company}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTestimonial}
                  className="w-10 h-10 p-0 rounded-full border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Indicators */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentTestimonial 
                          ? 'bg-primary w-6' 
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextTestimonial}
                  className="w-10 h-10 p-0 rounded-full border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 -z-10"></div>
          </Card>
        </div>

        {/* Additional Testimonial Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">4.9/5</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">2,547</p>
            <p className="text-sm text-muted-foreground">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">98%</p>
            <p className="text-sm text-muted-foreground">Recommend Us</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">24/7</p>
            <p className="text-sm text-muted-foreground">Support</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
