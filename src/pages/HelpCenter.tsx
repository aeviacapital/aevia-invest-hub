import React from "react";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Globe,
  Phone,
  BookOpen,
  Shield,
  CreditCard,
  User,
  ArrowRightCircle,
  MessageSquare,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HelpCenter = () => {
  const faqs = [
    {
      icon: <CreditCard className="text-primary h-6 w-6" />,
      question: "How do I request a refund?",
      answer:
        "To request a refund, email support@aeviacapital.com with your full name, transaction details, and reason for the request. Our team will respond within 7 business days.",
    },
    {
      icon: <User className="text-primary h-6 w-6" />,
      question: "How do I verify my Aevia Capital account?",
      answer:
        "Log in to your dashboard, go to ‘Account Settings,’ and upload a valid ID and proof of address. Verification usually completes within 24–48 hours.",
    },
    {
      icon: <Shield className="text-primary h-6 w-6" />,
      question: "Is my investment data secure?",
      answer:
        "Yes. We use advanced encryption, secure authentication, and regulatory-grade data protection to ensure your financial information remains private and safe.",
    },
    {
      icon: <BookOpen className="text-primary h-6 w-6" />,
      question: "Where can I learn more about investing with Aevia?",
      answer:
        "Visit our Resources section for guides, insights, and tutorials on safe and effective investing with Aevia Capital.",
    },
  ];

  return (
    <section className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <HelpCircle className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions or get in touch with our support
            team.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="space-y-10">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {faq.icon}
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {faq.question}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-20 border-t border-border pt-10">
          <h2 className="text-3xl font-semibold mb-6 flex items-center gap-3">
            <MessageCircle className="text-primary h-7 w-7" />
            Still need help?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here for you 24/7. Reach out to us through any
            of the following channels.
          </p>

          <div className="grid md:grid-cols-3 gap-6 ">
            {/* Email */}
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center text-center hover:bg-accent/30 transition-all">
              <Mail className="h-7 w-7 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Get assistance via email
              </p>
              <a
                href="mailto:support@aeviacapital.com"
                className="text-primary font-medium flex items-center gap-1 hover:underline"
              >
                support@aeviacapital.com <ArrowRightCircle className="h-4 w-4" />
              </a>
            </div>

            {/* WhatsApp */}
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center text-center hover:bg-accent/30 transition-all">
              <MessageSquare className="h-7 w-7 text-primary mb-2" />
              <h3 className="font-semibold mb-1">WhatsApp Support</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Chat with our support team
              </p>
              <a
                href="https://wa.me/447946189968"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Chat on WhatsApp <ArrowRightCircle className="h-4 w-4" />
              </a>
            </div>

            {/* Website */}
            <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center text-center hover:bg-accent/30 transition-all">
              <Globe className="h-7 w-7 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Visit Us</h3>
              <p className="text-muted-foreground text-sm mb-3">
                C/O Ashley King Ltd, 68 St. Margarets Road, Edgware, England, HA8 9UU
              </p>
              <a
                href="https://www.aeviacapital.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium flex items-center gap-1 hover:underline"
              >
                www.aeviacapital.com <ArrowRightCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
};
export default HelpCenter;

