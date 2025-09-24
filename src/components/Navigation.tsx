import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MessageCircle, 
  Users, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Menu, 
  X,
  Sprout
} from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: MessageCircle, label: "AI Assistant", path: "/chat" },
    { icon: Users, label: "Community", path: "/community" },
    { icon: Calendar, label: "Crop Calendar", path: "/calendar" },
    { icon: TrendingUp, label: "Market Prices", path: "/market" },
    { icon: FileText, label: "Govt Schemes", path: "/schemes" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-background border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="font-poppins font-bold text-xl text-gradient-primary">
              Krishi-Sathi
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-72 bg-background border-r border-border p-4">
            <nav className="space-y-2 pt-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-soft" 
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-background border-r border-border">
        <div className="flex items-center gap-2 p-6 border-b border-border">
          <Sprout className="h-10 w-10 text-primary" />
          <div>
            <h1 className="font-poppins font-bold text-xl text-gradient-primary">
              Krishi-Sathi
            </h1>
            <p className="text-sm text-muted-foreground">AI Farming Assistant</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-soft" 
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Navigation;