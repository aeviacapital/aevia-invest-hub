import React from 'react';
import { Briefcase, Zap, Shield, TrendingUp, Users } from 'lucide-react';

// Sample data for values and team members
const coreValues = [
  { 
    icon: Shield, 
    title: "Integrity", 
    description: "Upholding the highest ethical standards in all transactions, ensuring trust and transparency." 
  },
  { 
    icon: TrendingUp, 
    title: "Performance", 
    description: "Driven by results, we strive to deliver superior returns through rigorous analysis and strategy." 
  },
  { 
    icon: Zap, 
    title: "Innovation", 
    description: "Utilizing cutting-edge financial technology to uncover unique opportunities in global markets." 
  },
];

const teamMembers = [
    { 
        name: "james hamilton", 
        title: "Chief Executive Officer", 
        bio: "Over 20 years of experience in fund management and macro strategy.",
        image: "/man1.jpg"
    },
    { 
        name: "Julia Roberts", 
        title: "Chief Investment Officer", 
        bio: "Specializes in algorithmic trading and risk mitigation.",
        image: "/woman1.jpg"
    },
    { 
        name: "David Lee", 
        title: "Head of Client Relations", 
        bio: "Focused on building lasting partnerships and tailored client solutions.",
        image: "/man2.jpg"
    },
];

const About = () => {
  return (
    // The id="about" is crucial for your Navbar link to scroll to this section.
    <section id="about" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        
        {/* About Header and Mission */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            The AeviaCapital Advantage
          </h2>
          <p className="text-xl text-muted-foreground">
            We are a premier investment management firm built on the foundation of disciplined strategy, technological edge, and unwavering client trust. Our mission is to generate sustainable long-term capital growth for our investors.
          </p>
        </div>

        {/* --- */}

        {/* Core Values Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {coreValues.map((value, index) => (
            <div 
              key={index} 
              className="bg-card p-6 rounded-xl border border-border transition-all hover:border-primary hover:shadow-2xl hover:shadow-primary/10"
            >
              <value.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>

        {/* --- */}

        {/* The Team Section */}
        <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center">
        <Users className="w-6 h-6 mr-3 text-primary"/> Meet Our Expert Team
    </h2>
    <div className="grid md:grid-cols-3 gap-10">
        {teamMembers.map((member, index) => (
            <div key={index} className="text-center p-6 bg-card rounded-lg shadow-lg border border-border">
                {/* 🎯 CORRECTED IMAGE SECTION */}
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden border-4 border-primary/50">
                    <img 
                        src={member.image} // 👈 Use the 'src' attribute for the URL
                        alt={member.name} // 👈 Use alt text for accessibility
                        className="w-full h-full object-cover" // 👈 Ensure the image fills the circle and crops nicely
                    />
                </div>
                {/* END CORRECTED SECTION */}
                <h4 className="text-lg font-semibold text-foreground">{member.name}</h4>
                <p className="text-sm font-medium text-primary mb-3">{member.title}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
            </div>
        ))}
    </div>
</div>
        
      </div>
    </section>
  );
};

export default About;
