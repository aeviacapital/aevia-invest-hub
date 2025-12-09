import React from "react";
import {
  Mail,
  MessageSquare,
  MapPin,
  Facebook,
  Twitter,
  Globe,
  Phone,
  Send,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const socialLinks = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/share/1F96kCxdTj/",
    label: "Facebook",
  },
  {
    icon: Twitter,
    href: "https://x.com/Aeviacapital?t=ljAlEjGh9aPZdJjCGtA-ig&s=09",
    label: "X (Twitter)",
  },
      {
        icon: MessageSquare,
        href: "https://wa.me/447472876388",
        label: "WhatsApp",
      },
      {
        icon: Send,
        href: "https://t.me/Aeviacapital_support",
        label: "Telegram",
      },];

const ContactUs = () => {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in">
          <Send className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get in touch with Aevia Capital — we’re always here to assist you
            with any inquiries, support, or partnership opportunities.
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Email */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:bg-accent/30 transition-all animate-slide-up">
            <Mail className="mx-auto h-10 w-10 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Email Us</h3>
            <p className="text-muted-foreground mb-3">
              Reach out via email for general support or business inquiries.
            </p>
            <a
              href="mailto:support@aeviacapital.com"
              className="text-primary font-medium hover:underline"
            >
              support@aeviacapital.com
            </a>
          </div>

          {/* WhatsApp */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:bg-accent/30 transition-all animate-slide-up">
            <MessageSquare className="mx-auto h-10 w-10 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Chat on WhatsApp</h3>
            <p className="text-muted-foreground mb-3">
              Connect instantly with our support team.
            </p>
            <a
              href="https://wa.me/447472876388?text=Hello%20Aevia%20Capital%20Support%2C%20I%20need%20assistance."
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              Start Chat
            </a>
          </div>

          {/* Telegram */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:bg-accent/30 transition-all animate-slide-up">
            <Send className="mx-auto h-10 w-10 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Chat on Telegram</h3>
            <p className="text-muted-foreground mb-3">
              Connect instantly with our support team.
            </p>
            <a
              href="https://t.me/Aeviacapital_support"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              Start Chat
            </a>
          </div>

          {/* Address */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center hover:bg-accent/30 transition-all animate-slide-up">
            <MapPin className="mx-auto h-10 w-10 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
            <p className="text-muted-foreground mb-3">
              C/O Ashley King Ltd, 68 St. Margarets Road, Edgware, England, HA8
              9UU
            </p>
            <a
              href="https://www.aeviacapital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              www.aeviacapital.com
            </a>
          </div>
        </div>

        {/* Social Links Section */}
        <div className="text-center animate-scale-in">
          <h2 className="text-3xl font-semibold mb-6">Connect With Us</h2>
          <p className="text-muted-foreground mb-8">
            Follow Aevia Capital on our social platforms for updates, insights,
            and announcements.
          </p>

          <div className="flex justify-center gap-6">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group flex flex-col items-center space-y-1 hover:text-primary transition-all duration-300"
                >
                  <div className="bg-card border border-border p-4 rounded-full hover:bg-primary/10 transition-all group-hover:scale-110">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-primary">
                    {social.label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Phone Section */}
        <div className="mt-20 text-center animate-float">
          <Phone className="mx-auto h-10 w-10 text-primary mb-3" />
          <h3 className="text-xl font-semibold mb-1">Call Us</h3>
          <p className="text-muted-foreground mb-2">
            Available Monday – Friday, 9:00 AM – 6:00 PM
          </p>
          <span className="text-primary font-medium text-lg">
            +44 7472 876388
          </span>
        </div>
      </div>

      <Footer />
    </section>
  );
};
export default ContactUs;

