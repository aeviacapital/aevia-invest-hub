import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldCheck, Link } from 'lucide-react'; 

// --- License Data (ACTION REQUIRED: Fill in YOUR client's data) ---
const licenseData = [
  // 1. FINCEN (Federal, US) - Example with asset path
  {
    agency: "Financial Crimes Enforcement Network (FinCEN)",
    jurisdiction: "United States (Federal)",
    logoUrl: "/lincenseLogos/fincenlogo.png", // Ensure this path is correct: public/lincenseLogos/fincenlogo.png
    description: "A bureau of the U.S. Department of the Treasury that collects and analyzes information about financial transactions.",
    refNumber: "31000201469839",
    licensedEntity: "Strategic Options Financial LLLC", 
    siteLink: "https://fincen.gov"
  },
  // 2. SO-FIT (Switzerland)
  {
    agency: "SO-FIT (Organisme de Surveillance)",
    jurisdiction: "Switzerland (FINMA Recognized SRO)",
    logoUrl:" /lincenseLogos/sofitlogo.jpeg", 
    description: "Self-regulatory organisation (SRO) recognized by the Swiss Financial Market Supervisory Authority (FINMA).",
    refNumber: "Ssh4573902",
    licensedEntity: "consumer credit license",
    siteLink: "https://so-fit.ch"
  },
  // ... (Keep the rest of your licenseData array here)
  // 3-14: Add the rest of your license data items...
  { agency: "FINTRAC (Financial Transactions and Reports Analysis Centre)", jurisdiction: "Canada", logoUrl: " /lincenseLogos/fintrac.jpeg", description: "Canada's financial intelligence unit (FIU) for money laundering and terrorist financing.", refNumber: "799937", licensedEntity: "Money Transmitter License", siteLink: "https://fintrac-canafe.canada.ca" },
  { agency: "Australian Securities and Investments Commission (ASIC)", jurisdiction: "Australia", logoUrl: "/lincenseLogos/asic.jpeg", description: "Australia's integrated corporate, markets, financial services and consumer credit regulator.", refNumber: "380258281023", licensedEntity: "Money Lender License", siteLink: "https://asic.gov.au" },
  { agency: "WV Division of Financial Institutions", jurisdiction: "United States (West Virginia)", logoUrl: "lincenseLogos/dfi.png", description: "Regulates financial institutions, including banks, credit unions, and money service businesses within West Virginia.", refNumber: "WVMT-1899654", licensedEntity: "Money Lender License", siteLink: "https://dfi.wv.gov" },
  { agency: "PA Department of Banking and Securities", jurisdiction: "United States (Pennsylvania)", logoUrl: "/lincenseLogos/pa.jpeg", description: "The primary regulator for financial institutions and securities activities in Pennsylvania.", refNumber: "93088", licensedEntity: "Mortgage Broker", siteLink: "https://www.dobs.pa.gov" },
  { agency: "Alabama Securities Commission", jurisdiction: "United States (Alabama)", logoUrl: "/lincenseLogos/alabama.png", description: "The state agency responsible for the regulation of the securities industry within Alabama.", refNumber: "785", licensedEntity: "Money Transmitter", siteLink: "https://asc.alabama.gov" },
  { agency: "AZ Dept. of Insurance and Financial Institutions (DIFI)", jurisdiction: "United States (Arizona)", logoUrl: "lincenseLogos/arizona.jpeg", description: "Responsible for the oversight of Arizona's financial institutions and insurance industry.", refNumber: "DM-53436", licensedEntity: "Debt Management Company", siteLink: "https://difi.az.gov" },
  { agency: "Arkansas Securities Department", jurisdiction: "United States (Arkansas)", logoUrl:"/lincenseLogos/akansas.jpeg", description: "The state's securities regulator, protecting investors and regulating the securities industry in Arkansas.", refNumber: "8329997", licensedEntity: "Securities Professional Registration", siteLink: "https://securities.arkansas.gov" },
  { agency: "CA Dept. of Financial Protection and Innovation (DFPI)", jurisdiction: "United States (California)", logoUrl: "/lincenseLogos/dfpi.jpeg", description: "Regulates financial services, including state-chartered banks and credit unions, securities brokers and dealers.", refNumber: "43823", licensedEntity: "Money Transmitter", siteLink: "https://dfpi.ca.gov" },
  { agency: "DC Department of Insurance, Securities and Banking (DISB)", jurisdiction: "United States (District of Columbia)", logoUrl: "/lincenseLogos/disb.jpeg", description: "Regulates financial service providers and protects consumers of insurance, securities, and banking.", refNumber: "MTR1774459", licensedEntity: "Securities Registration", siteLink: "https://disb.dc.gov" },
  { agency: "GA Department of Banking and Finance", jurisdiction: "United States (Georgia)", logoUrl: "/lincenseLogos/dbf.png", description: "Regulates state-chartered banks, credit unions, and money service businesses in Georgia.", refNumber: "DBF1774459", licensedEntity: "Securities registration", siteLink: "https://dbf.georgia.gov" },
  
];


const Licenses = () => {
  return (
    <div className="container mx-auto px-4 py-24 sm:py-32">
      <Navbar />
      {/* Page Header */}
      <div className="max-w-2xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gradient-primary sm:text-5xl">
          Global Regulatory Compliance
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          In order to ensure the provision of their portfolio of services in full compliance with all applicable global and local regulations and standards, Aevia capital companies hold licenses and registration in numerous jurisdiction worldwide, and are constantly bringing their operations in line with the newly adopted legistlative changes 
        </p>
        <p className="mt-4 text-sm text-destructive">
          Assets audited by
        </p>
      </div>

      {/* License Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {licenseData.map((license) => (
          <Card key={license.agency} className="flex flex-col card-glass border-2 border-border/50 hover:border-primary/50 transition-all duration-300">
            
            <CardHeader className="p-6 pb-3 text-center">
              {/* Logo/Fallback Display - INCREASED SIZE */}
              <div className="flex justify-center mb-4">
                <Avatar className="h-25 w-25 rounded-md border p-1 bg-background shadow-lg"> 
                  <AvatarImage src={license.logoUrl} alt={`${license.agency} Logo`} />
                  <AvatarFallback className="rounded-md bg-primary/10">
                    <ShieldCheck className="w-10 h-10 text-primary" /> {/* INCREASED ICON SIZE */}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Agency Details */}
              <CardTitle className="text-2xl font-bold text-foreground">{license.agency}</CardTitle>
              <CardDescription className="text-sm text-primary/70">{license.jurisdiction}</CardDescription>
            </CardHeader>

            <Separator className="mx-6 w-auto" />
            
            <CardContent className="flex-grow space-y-4 pt-4 px-6">
              <p className="text-sm text-muted-foreground">{license.description}</p>
              
              {/* Key Details Section */}
              <div className="space-y-3 pt-2">
                
                {/* Licensed Entity */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Licensed Entity</div>
                  <div className="text-sm font-semibold text-foreground">{license.licensedEntity}</div>
                </div>

                {/* Reference Number */}
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Reference Number</div>
                  <div className="text-sm font-mono text-primary">{license.refNumber}</div>
                </div>
                
                {/* Site Link (Text only) */}
                <div>
                                    <div className="text-sm text-blue-400 truncate">{license.siteLink}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className = "mt-4rem pt-4rem">
      <Footer />
      </div>
    </div>
  );
};
export default Licenses;
