import { useState, useCallback } from "react";
import { Menu, X, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/hooks/useRole";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const location = useLocation();

  const handleAnchorClick = useCallback((e: React.MouseEvent, path: string) => {
    const hashIndex = path.indexOf('#');
    if (hashIndex === -1) return;

    const basePath = path.substring(0, hashIndex);
    const hash = path.substring(hashIndex + 1);

    if (basePath === location.pathname || basePath === '') {
      e.preventDefault();
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
      window.history.pushState(null, '', `#${hash}`);
    } else {
      navigate(path);
    }
    setIsOpen(false);
  }, [location.pathname, navigate]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Investment Plans", href: "/#plans" },
    { name: "About", href: "/#about" },
    { name: "Licenses", href: "/licenses" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Avia Capital Logo" className="h-20 sm:h-22 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="text-muted-foreground hover:text-primary transition-smooth relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            <a href="https://wa.me/447472876388" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary transition-smooth">
              <MessageCircle className="w-4 h-4 mr-2" />WhatsApp
            </a>
            <a href="https://t.me/Aviacapital_support" target="_blank" rel="noopener noreferrer" className="flex items-center text-muted-foreground hover:text-primary transition-smooth">
              <Send className="w-4 h-4 mr-2" />Telegram
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard"><Button variant="outline" size="sm">Dashboard</Button></Link>
                {isAdmin && <Link to="/admin"><Button variant="outline" size="sm">Admin</Button></Link>}
                <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
              </>
            ) : (
              <>
                <Link to="/auth"><Button variant="outline" size="sm">Sign In</Button></Link>
                <Link to="/auth"><Button className="btn-hero" size="sm">Get Started</Button></Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-foreground p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link key={item.name} to={item.href} className="block px-3 py-2 text-muted-foreground hover:text-primary transition-smooth" onClick={() => setIsOpen(false)}>
                  {item.name}
                </Link>
              ))}
              <a href="https://wa.me/447472876388" target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-2 text-muted-foreground hover:text-primary transition-smooth">
                <MessageCircle className="w-4 h-4 mr-2" />WhatsApp Support
              </a>
              <a href="https://t.me/Aviacapital_support" target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-2 text-muted-foreground hover:text-primary transition-smooth">
                <Send className="w-4 h-4 mr-2" />Telegram Support
              </a>
              <div className="flex flex-col space-y-2 px-3 pt-4">
                {user ? (
                  <>
                    <Link to="/dashboard"><Button variant="outline" size="sm" className="w-full">Dashboard</Button></Link>
                    {isAdmin && <Link to="/admin"><Button variant="outline" size="sm" className="w-full">Admin</Button></Link>}
                    <Button onClick={signOut} variant="outline" size="sm" className="w-full">Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth"><Button variant="outline" size="sm" className="w-full">Sign In</Button></Link>
                    <Link to="/auth"><Button className="btn-hero w-full" size="sm">Get Started</Button></Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
