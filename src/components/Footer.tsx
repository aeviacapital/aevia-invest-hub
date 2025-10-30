import { Facebook, Twitter, Mail, MapPin, MessageCircle } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Crypto Currency Trading", href: "#" },
      { name: "Copy Trading", href: "#" },
      { name: "Investment Plans", href: "#" },
      { name: "Portfolio Analytics", href: "#" }
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Our Team", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press Kit", href: "#" }
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Contact Support", href: "#contact" },
      { name: "System Status", href: "#" },
      { name: "API Documentation", href: "#" }
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Risk Disclosure", href: "#" },
      { name: "Compliance", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/share/1F96kCxdTj/", label: "Facebook" },
    { icon: Twitter, href: "https://x.com/Aeviacapital?t=ljAlEjGh9aPZdJjCGtA-ig&s=09", label: "X (Twitter)" },
    { icon: MessageCircle, href: "https://wa.me/447946189968", label: "WhatsApp" }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xl">A</span>
                </div>
                <span className="text-2xl font-bold text-gradient-primary">AeviaCapital</span>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Your trusted partner in financial growth. We provide innovative investment 
                solutions across crypto, forex, real estate, and energy sectors with 
                institutional-grade security and professional management.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="w-4 h-4 mr-3 text-primary" />
                  <span>support@aeviacapital.com</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MessageCircle className="w-4 h-4 mr-3 text-primary" />
                  <a href="https://wa.me/447946189968" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    +44 7946 189968
                  </a>
                </div>
                <div className="flex items-start text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-3 mt-0.5 text-primary flex-shrink-0" />
                  <span>C/O Ashley King Ltd, 68 St. Margarets Road, Edgware, England, HA8 9UU</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="grid grid-cols-2 lg:grid-cols-3 lg:col-span-3 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Platform</h3>
                <ul className="space-y-3">
                  {footerLinks.platform.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Company</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 lg:col-span-1">
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-4">Support</h3>
                  <ul className="space-y-3">
                    {footerLinks.support.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                  <ul className="space-y-3">
                    {footerLinks.legal.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} AeviaCapital. All rights reserved.
            </div>
            
            {/* Compliance Badges */}
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                Regulated by: SEC • FCA • CFTC
              </div>
              <div className="flex gap-2">
                <div className="px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
                  SSL Secured
                </div>
                <div className="px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
                  SIPC Protected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
