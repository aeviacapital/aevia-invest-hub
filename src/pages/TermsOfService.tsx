import React from "react";
import {
  ShieldCheck,
  UserCheck,
  Wallet,
  Ban,
  AlertTriangle,
  Gavel,
  Mail,
  MapPin,
  Globe,
  Info,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const TermsOfService = () => {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="max-w-5xl mx-auto animate-fade-in mt-12">
        <div className="bg-card shadow-xl border border-border rounded-2xl p-8 md:p-12 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-up">
            <ShieldCheck className="mx-auto h-14 w-14 text-primary mb-4 animate-float" />
            <h1 className="text-4xl font-bold mb-2 text-primary">
              Avia Capital Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm">
              Effective Date: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Intro */}
          <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
            Welcome to <span className="text-primary font-semibold">Avia Capital</span>. 
            By accessing or using our website, investment platform, or any of our 
            services, you agree to these Terms of Service ("Terms"). Please read 
            them carefully before proceeding. If you do not agree with these Terms, 
            please discontinue use of our services immediately.
          </p>

          {/* Section */}
          <div className="space-y-12">
            {/* 1 */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <UserCheck className="text-primary h-6 w-6" />
                <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                By creating an account, investing, or using any service provided by 
                Avia Capital, you acknowledge that you have read, understood, and 
                agree to these Terms, as well as our Privacy Policy and Refund Policy.
              </p>
            </section>

            {/* 2 */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <Info className="text-primary h-6 w-6" />
                <h2 className="text-2xl font-semibold">2. Eligibility</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                You must be at least 18 years old and legally capable of entering 
                into binding contracts to use our services. You confirm that all 
                registration details are accurate and up to date.
              </p>
            </section>

            {/* 3 */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="text-primary h-6 w-6" />
                <h2 className="text-2xl font-semibold">3. Investment Risks</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                All investments carry inherent risks. Past performance does not 
                guarantee future results. Avia Capital does not provide financial 
                advice or guarantees of profit. You should consult independent 
                advisors before making financial decisions.
              </p>
            </section>

            {/* 4 */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <Ban className="text-primary h-6 w-6" />
                <h2 className="text-2xl font-semibold">4. Prohibited Activities</h2>
              </div>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Engaging in illegal, fraudulent, or abusive activities.</li>
                <li>Attempting unauthorized access to our systems or user data.</li>
                <li>Distributing harmful or malicious software.</li>
                <li>Infringing intellectual property or proprietary rights.</li>
              </ul>
            </section>

            {/* 5 */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="text-primary h-6 w-6" />
                <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by law, Avia Capital and its 
                affiliates shall not be held liable for indirect, incidental, or 
                consequential damages arising from the use of our platform, including 
                but not limited to lost profits, financial loss, or service interruption.
              </p>
            </section>

            {/* 6 */}
            <section className="animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <Gavel className="text-primary h-6 w-6" />
                <h2 className="text-2xl font-semibold">6. Governing Law</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by and interpreted in accordance with the 
                laws of England and Wales. Any disputes shall be resolved exclusively 
                in the courts of England and Wales.
              </p>
            </section>
          </div>

          {/* Contact */}
          <div className="border-t border-border pt-10 mt-12 animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <Mail className="text-primary h-6 w-6" />
              Contact Information
            </h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:support@aviacapital.com"
                  className="hover:text-primary transition-colors"
                >
                  support@aviacapital.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>
                  C/O Ashley King Ltd, 68 St. Margarets Road, Edgware, England, HA8 9UU
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <a
                  href="https://www.aviacapital.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  www.aviacapital.com
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>
      <div className = "mb-10"></div>

        <Footer />
    </section>
  );
};

export default TermsOfService;

