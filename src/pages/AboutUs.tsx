import React from "react";
import {
  Users,
  TrendingUp,
  ShieldCheck,
  Globe,
  Target,
  Star,
  Handshake,
  Building2,
  LineChart,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutUs = () => {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center animate-fade-in">
        <TrendingUp className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Aevia Capital</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Empowering individuals and institutions to achieve financial freedom
          through transparent, data-driven investment opportunities across the globe.
        </p>
      </div>

      {/* Who We Are */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center animate-slide-up">
        <div>
          <Building2 className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-3xl font-semibold mb-3">Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed">
            Aevia Capital is a forward-thinking investment platform dedicated to
            unlocking wealth-building opportunities through innovative financial
            technology. With a focus on accessibility and security, we help our
            clients grow their portfolios with confidence in a fast-evolving global market.
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 text-center hover:bg-accent/30 transition-all">
          <img
            src="/man1.jpeg"
            alt="Aevia Capital team"
            className="rounded-xl object-cover w-full h-64"
          />
        </div>
      </div>

      {/* Mission and Vision */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center animate-fade-in">
        <div className="bg-card border border-border rounded-2xl p-8 hover:bg-accent/30 transition-all">
          <Target className="h-10 w-10 text-primary mb-3" />
          <h3 className="text-2xl font-semibold mb-2">Our Mission</h3>
          <p className="text-muted-foreground leading-relaxed">
            To bridge the gap between traditional investment systems and modern digital finance — offering simplicity, transparency, and consistent value to every investor.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 hover:bg-accent/30 transition-all">
          <Globe className="h-10 w-10 text-primary mb-3" />
          <h3 className="text-2xl font-semibold mb-2">Our Vision</h3>
          <p className="text-muted-foreground leading-relaxed">
            To become a global leader in fintech investment innovation, setting new standards for trust, performance, and accessibility across emerging markets.
          </p>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-semibold mb-10">Why Choose Aevia Capital</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: "Security & Transparency",
              desc: "Your investments are safeguarded with state-of-the-art encryption, compliance, and open communication.",
            },
            {
              icon: LineChart,
              title: "Performance Focused",
              desc: "We use real-time analytics and AI-powered insights to ensure sustainable portfolio growth.",
            },
            {
              icon: Handshake,
              title: "Trust & Partnership",
              desc: "We grow with our clients — fostering relationships built on honesty, integrity, and shared success.",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-card border border-border rounded-2xl p-6 hover:bg-accent/30 transition-all animate-slide-up"
              >
                <Icon className="h-10 w-10 text-primary mb-3 mx-auto" />
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Our Values */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center animate-slide-up">
        <div>
          <Users className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-3xl font-semibold mb-3">Our Core Values</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Every decision we make and every product we build is guided by these principles:
          </p>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Integrity and honesty in every transaction.
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Innovation driven by user empowerment.
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Accountability and transparency in all processes.
            </li>
            <li className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Long-term value creation for our investors.
            </li>
          </ul>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 text-center hover:bg-accent/30 transition-all">
          <img
            src="/man2.jpeg"
            alt="Aevia Capital values"
            className="rounded-xl object-cover w-full h-72"
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-accent/10 py-20 text-center animate-scale-in">
        <h2 className="text-3xl font-semibold mb-4">Join the Aevia Capital Community</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Experience financial growth and security through a transparent, modern, and user-centric investment platform.
        </p>
        <a
          href="/auth"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:bg-primary/90 transition-all"
        >
          Get Started
        </a>
      </div>

      <Footer />
    </section>
  );
};
export default AboutUs;

