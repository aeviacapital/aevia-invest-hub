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
      
      {/* TradingView Ticker Widget */}
      <div className="w-full bg-card border-y border-border">
        <div className="tradingview-widget-container">
          <div className="tradingview-widget-container__widget"></div>
          <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" async>
          {JSON.stringify({
            "symbols": [
              {"proName": "FOREXCOM:SPXUSD", "title": "S&P 500"},
              {"proName": "FOREXCOM:NSXUSD", "title": "US 100"},
              {"proName": "FX_IDC:EURUSD", "title": "EUR to USD"},
              {"proName": "BITSTAMP:BTCUSD", "title": "Bitcoin"},
              {"proName": "BITSTAMP:ETHUSD", "title": "Ethereum"}
            ],
            "showSymbolLogo": true,
            "colorTheme": "dark",
            "isTransparent": false,
            "displayMode": "adaptive",
            "locale": "en"
          })}
          </script>
        </div>
      </div>

      <TrustedBy />
      <Features />
      <InvestmentPlans />
      <Stats />
      <Testimonials />
      
      {/* TradingView News Widget */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Latest Market News</h2>
          <div className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js" async>
            {JSON.stringify({
              "feedMode": "all_symbols",
              "colorTheme": "dark",
              "isTransparent": false,
              "displayMode": "regular",
              "width": "100%",
              "height": 600,
              "locale": "en"
            })}
            </script>
          </div>
        </div>
      </section>

      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
