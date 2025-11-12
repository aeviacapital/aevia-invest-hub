import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Licenses from "./pages/Licenses"; 
import ResetPassword from "./pages/ResetPassword"; 
import PrivacyPolicy from "./pages/PrivacyPolicy"; 
import RefundPolicy from "./pages/RefundPolicy"; 
import TermsOfService from "./pages/TermsOfService"; 
import HelpCenter from "./pages/HelpCenter"; 
import ContactUs from "./pages/ContactUs.tsx"; 
import AboutUs from "./pages/AboutUs.tsx"; 
import OurTeam from "./pages/OurTeam"; 
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/licenses" element={<Licenses/>} />
            <Route path="/privacypolicy" element={<PrivacyPolicy/>} />
            <Route path="/refundpolicy" element={<RefundPolicy/>} />
            <Route path="/termsofservice" element={<TermsOfService/>} />
            <Route path="/resetpassword" element={<ResetPassword/>} />
            <Route path="/helpcenter" element={<HelpCenter/>} />
            <Route path="/contactus" element={<ContactUs/>} />
            <Route path="/aboutus" element={<AboutUs/>} />
            <Route path="/ourteam" element={<OurTeam/>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;
