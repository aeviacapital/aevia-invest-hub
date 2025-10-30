import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How does it work?",
      answer: "AeviaCapital provides a comprehensive investment platform where you can access crypto trading simulation, copy trading, real estate investments, and oil & gas opportunities. Simply create an account, complete KYC verification, deposit funds, and start investing according to your risk tolerance and investment goals."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we employ bank-level security measures including 256-bit SSL encryption, two-factor authentication, cold storage for crypto assets, and comply with international financial regulations. Your personal and financial data is protected with the highest security standards in the industry."
    },
    {
      question: "Do you offer integration with other banks?",
      answer: "Currently, we support cryptocurrency deposits (BTC, USDT, SOL) with dynamic wallet addresses. We're working on traditional banking integrations and will announce additional deposit methods including wire transfers and ACH in future updates."
    },
    {
      question: "How do I get started?",
      answer: "Getting started is simple: 1) Sign up with an invitation code, 2) Complete KYC verification by uploading your ID documents, 3) Make your first deposit using supported cryptocurrencies, 4) Choose your investment strategy and start trading or investing."
    },
    {
      question: "What are the minimum investment amounts?",
      answer: "Minimum investments vary by asset class: Crypto trading simulation starts at $500, Copy trading requires $1,000, Real Estate investments start at $10,000, and Oil & Gas investments require a minimum of $25,000. These minimums ensure proper risk management and meaningful returns."
    },
    {
      question: "How do withdrawals work?",
      answer: "Withdrawals are processed after completing KYC verification. Submit a withdrawal request with your wallet address and confirm with your wallet keyphrase. Our admin team reviews and processes withdrawals typically within 24-48 hours for security verification."
    },
    {
      question: "What trading tools are available?",
      answer: "We provide integrated TradingView charts with live market data, real-time trade execution, configurable lot sizes and leverage, comprehensive trade history, P&L tracking, and automated copy trading features. All trading is simulation-based for crypto and forex markets."
    },
    {
      question: "Is customer support available 24/7?",
      answer: "Yes, our customer support team is available 24/7 to assist with account questions, technical issues, and investment guidance. You can reach us through live chat, email, or our comprehensive help center with detailed guides and tutorials."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="text-gradient-primary">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our investment platform, 
            security measures, and how to get started with AeviaCapital.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="card-glass border border-border/50 rounded-lg px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left hover:text-primary transition-colors py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">

           <a
  href="https://wa.me/+447946189968"
  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
>
  Message us on WhatsApp
</a> 
            <a 
              href="#"
              className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg font-medium hover:border-primary hover:text-primary transition-colors"
            >
              Live Chat
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
