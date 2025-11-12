import React from "react";
import {
  Shield,
  Zap,
  TrendingUp,
  Users,
  Briefcase,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// --- Core Values ---
const coreValues = [
  {
    icon: Shield,
    title: "Integrity",
    description:
      "Upholding the highest ethical standards in all transactions, ensuring trust and transparency.",
  },
  {
    icon: TrendingUp,
    title: "Performance",
    description:
      "Driven by results, we strive to deliver superior returns through rigorous analysis and strategy.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "Utilizing cutting-edge financial technology to uncover unique opportunities in global markets.",
  },
];

// --- Team Members ---
const teamMembers = [
  {
    name: "Ellis Kian Ferguson",
    title: "Chief Executive Officer",
    bio: "Over 20 years of experience in fund management and macro strategy.",
    image: "/man1.jpeg",
  },
  {
    name: "Sorina Ileana Dragomir",
    title: "Chief Investment Officer",
    bio: "Specializes in algorithmic trading and risk mitigation.",
    image: "/man2.jpeg",
  },
  {
    name: "Teresa Dahlberg",
    title: "Head of Client Relations",
    bio: "Focused on building lasting partnerships and tailored client solutions.",
    image: "/woman1.jpeg",
  },
];

const OurTeam = () => {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <Briefcase className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Meet the Team Behind Aevia Capital
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          Aevia Capital is powered by a diverse team of finance experts,
          innovators, and visionaries committed to redefining investment
          management with integrity, transparency, and excellence.
        </p>
      </div>

      {/* Core Values Section */}
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {coreValues.map((value, index) => {
          const Icon = value.icon;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-2xl p-6 text-center transition-all hover:border-primary hover:bg-accent/30"
            >
              <Icon className="h-10 w-10 text-primary mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          );
        })}
      </div>

      {/* Team Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center">
          <Users className="w-6 h-6 mr-3 text-primary" /> Our Executive Team
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="text-center bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary transition-all"
            >
              <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-primary/50">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-lg font-semibold text-foreground">
                {member.name}
              </h4>
              <p className="text-sm font-medium text-primary mb-2">
                {member.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-accent/10 py-20 text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Join the Vision of Financial Growth
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Be part of Aevia Capital’s mission to reshape global investment with
          innovation, precision, and purpose.
        </p>
        <a
          href="/contactus"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-md hover:bg-primary/90 transition-all"
        >
          Get in Touch
        </a>
      </div>

      <Footer />
    </section>
  );
};
export default OurTeam;

