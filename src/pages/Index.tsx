import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";
import Features from "@/components/Features";
import InvestmentPlans from "@/components/InvestmentPlans";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <InvestmentPlans />
      <Stats />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
