"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  FileText,
  Globe,
  Mail,
  Server,
  Users,
  Database,
  Cookie,
  AlertTriangle,
  Phone,
  UserCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; 

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground ">
      <Navbar />
      {/* Header Section */}
      <motion.header initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <ShieldCheck className="w-16 h-16 mx-auto text-primary animate-float" />
                  <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-2">
                  Avia Capital Privacy & Security Policy
                </h1>        <p className="text-muted-foreground text-sm">
          Effective Date: November 12, 2025
        </p>
      </motion.header>

      {/* Main Content */}
      <div className="space-y-12 max-w-4xl mx-auto">
        {/* Privacy Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card shadow-md p-8 rounded-2xl space-y-6 animate-fade-in"
        >
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Privacy Policy</h2>
          </div>

          <p className="text-muted-foreground">
            Avia Capital (“we,” “our,” or “us”) respects your privacy and is
            committed to protecting your personal information. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            data when you use our website and services.
          </p>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> 1. Information We Collect
          </h3>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>
              <strong>Personal Identification:</strong> Name, email address,
              phone number, and payment information.
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, device
              details, and website activity via cookies or tracking tools.
            </li>
            <li>
              <strong>Transaction Data:</strong> Records of investments,
              deposits, withdrawals, and account activity.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" /> 2. How We Use Your
            Information
          </h3>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Provide and manage your account and investments.</li>
            <li>Process transactions and secure payments.</li>
            <li>Communicate updates, alerts, and support responses.</li>
            <li>Improve our website and trading systems.</li>
            <li>Meet legal, regulatory, and compliance obligations.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> 3. Data Protection
          </h3>
          <p className="text-muted-foreground">
            We use advanced encryption, firewalls, and strict access control to
            secure your data. All stored information complies with applicable UK
            and international data protection regulations.
          </p>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" /> 4. Sharing of
            Information
          </h3>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>
              Trusted service providers for payments, analytics, and technical
              support.
            </li>
            <li>Regulatory or legal authorities when required by law.</li>
            <li>
              Business partners during mergers, acquisitions, or restructuring.
            </li>
            <li>
              <strong>We never sell or rent your personal information.</strong>
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" /> 5. Your Rights
          </h3>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Access, review, or correct your personal data.</li>
            <li>Request deletion of your data where applicable.</li>
            <li>Withdraw consent for marketing communications.</li>
            <li>
              File a complaint with the UK Information Commissioner’s Office
              (ICO).
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-primary" /> 6. Cookies
          </h3>
          <p className="text-muted-foreground">
            We use cookies to improve site functionality, personalize content,
            and analyze performance. You can disable cookies in your browser
            settings at any time.
          </p>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" /> 7. Children’s
            Privacy
          </h3>
          <p className="text-muted-foreground">
            Our services are not intended for users under the age of 18. We do
            not knowingly collect information from minors.
          </p>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> 8. Contact Us
          </h3>
          <p className="text-muted-foreground">
            Email:{" "}
            <a
              href="mailto:support@aviacapital.com"
              className="text-primary hover:underline"
            >
              support@aviacapital.com
            </a>
            <br />
            Address: C/O Ashley King Ltd, 68 St. Margarets Road, Edgware,
            England, HA8 9UU
            <br />
            Website:{" "}
            <a
              href="https://www.aviacapital.com"
              className="text-primary hover:underline"
              target="_blank"
            >
              www.aviacapital.com
            </a>
          </p>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Security Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card shadow-md p-8 rounded-2xl space-y-6 animate-slide-up"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Avia Capital Security Policy</h2>
          </div>

          <p className="text-muted-foreground">
            At Avia Capital, your safety is our top priority. We implement
            leading-edge technologies and rigorous protocols to ensure your
            investments and data remain secure.
          </p>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> 1. Platform Security
          </h3>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>All connections use 256-bit SSL encryption.</li>
            <li>
              Two-factor authentication (2FA) required for trading and
              withdrawals.
            </li>
            <li>
              Real-time monitoring to detect and block suspicious activity.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" /> 2. Data Protection
          </h3>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Encrypted databases hosted on secure servers.</li>
            <li>
              Regular security audits and penetration testing ensure system
              integrity.
            </li>
            <li>Data access limited to authorized personnel only.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> 3. Financial Protection
          </h3>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Client funds held in segregated accounts.</li>
            <li>
              Partner institutions comply with international financial
              regulations.
            </li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" /> 4. User Responsibility
          </h3>
          <p className="text-muted-foreground">
            Maintain confidentiality of your login credentials. Never share your
            password or recovery codes with anyone.
          </p>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" /> 5. Breach Notification
          </h3>
          <p className="text-muted-foreground">
            In the event of a data breach, affected users will be notified
            within 72 hours, in compliance with UK data protection laws.
          </p>

          <h3 className="text-xl font-semibold mt-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" /> 6. Continuous Improvement
          </h3>
          <p className="text-muted-foreground">
            We continuously update our systems and protocols to defend against
            emerging threats and maintain world-class security standards.
          </p>
        </motion.section>
      </div>
      <div className = "mb-10"></div>
      <div></div>

      <Footer />
      
    </div>
  );
}

