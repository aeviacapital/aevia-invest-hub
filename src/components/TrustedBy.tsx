const TrustedBy = () => {
  const companies = [
    "Alphabet", "Microsoft", "Google", "Meta", "GILEAD"
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">
            Trusted by 1000's of Companies
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Donec pharetra tellus id est placerat venenatis cursus tempor magna sit.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
          {companies.map((company, index) => (
            <div 
              key={company}
              className="text-lg md:text-xl font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;