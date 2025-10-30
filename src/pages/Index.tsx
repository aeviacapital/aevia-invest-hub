import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";
import Features from "@/components/Features";
import InvestmentPlans from "@/components/InvestmentPlans";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import About from "@/components/About"; 
import BrevoConversations from "@/components/BrevoConversations"; 
// 1. Import necessary React hooks
import React, { useEffect, useRef } from 'react'; 

// 2. Define the Ticker Widget Component
// We move the TradingView logic into a function component
const TradingViewTicker = () => {
  const container = useRef();

  useEffect(() => {
    // Clear the container to prevent duplicates on re-render
    if (container.current) {
      container.current.innerHTML = '';
    }

    // Create and configure the script element
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    
    // Set the configuration data as the innerHTML of the script tag
    script.innerHTML = JSON.stringify({
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
    });

    // Append the script to the referenced container
    container.current.appendChild(script);

    // Cleanup function to remove the script on unmount
    return () => {
      if (container.current && container.current.contains(script)) {
        container.current.removeChild(script);
      }
    };
  }, []); // Empty dependency array ensures it runs only once on mount

  // We return the div structure where the script will inject the widget,
  // preserving the original class names.
  return (
    <div className="tradingview-widget-container" ref={container}>
      {/* The script will inject the widget here */}
    </div>
  );
};


// 3. Define the News Widget Component
const TradingViewNews = () => {
  const container = useRef();

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
    }
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;
    
    script.innerHTML = JSON.stringify({
      "feedMode": "all_symbols",
      "colorTheme": "dark",
      "isTransparent": false,
      "displayMode": "regular",
      "width": "100%",
      "height": 600,
      "locale": "en"
    });

    container.current.appendChild(script);

    return () => {
      if (container.current && container.current.contains(script)) {
        container.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: '600px', width: '100%' }}>
      {/* The script will inject the widget here */}
    </div>
  );
};


// 4. Update the main Index component to use the new components
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <div className="w-full bg-card border-y border-x">
        <TradingViewTicker />
      </div>


      <TrustedBy />
      <Features/>
      <InvestmentPlans />
      <Stats />
      <Testimonials />
      <About />
      
      {/* TradingView News Widget - RENDER THE NEW COMPONENT */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Latest Market News</h2>
          <TradingViewNews />
        </div>
      </section>

      <FAQ />
      <Footer />
      <BrevoConversations />
    </div>
  );
};

export default Index;
