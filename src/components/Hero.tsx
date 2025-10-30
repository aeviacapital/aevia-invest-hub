import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPhoneMockup from "@/assets/aeviadashboard.jpg";
import {useNavigate} from "react-router-dom"; 

const Hero = () => {
  const navigate = useNavigate(); 
  return (
    <section id="home" className="pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Trusted by 10,000+ Investors</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              AeviaCapital – <span className="text-gradient-primary">Smarter</span><br />
              Financial Solutions for<br />
              a <span className="text-gradient-secondary">Brighter Future</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Manage your finances with confidence. Gain brings you seamless 
              budgeting, investment tracking, and real-time insights — 
              all in one intelligent platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button className="btn-hero group" onClick ={()=>navigate("/auth")} >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-border hover:border-primary" onClick={()=>{navigate("/auth")}}>
                Sign in
              </Button>
            </div>

            {/* Features Icons */}
            <div className="flex flex-wrap gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Real-time Trading</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>AI-Powered Insights</span>
              </div>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative animate-float">
            <div className="relative z-10">
              <img
                src={heroPhoneMockup}
                alt="AeviaCapital Mobile App"
                className="w-full max-w-md mx-auto lg:max-w-lg drop-shadow-2xl"
              />
            </div>
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl -z-10 animate-pulse-glow"></div>
            
            {/* Floating Elements */}
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-8 -right-8 w-12 h-12 bg-secondary/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
