import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, BarChart3, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isAuthenticated = !!user;
  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                WhatsForm
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span 
              className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
            >
              WhatsForm
            </span>
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-4 ml-8">
                <Button
                  variant={location.pathname === "/dashboard" ? "secondary" : "ghost"}
                  onClick={() => navigate("/dashboard")}
                  size="sm"
                >
                  Dashboard
                </Button>
                <Button
                  variant={location.pathname === "/analytics" ? "secondary" : "ghost"}
                  onClick={() => navigate("/analytics")}
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="md:hidden"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <div className="flex flex-col space-y-4 mt-8">
                      <div className="flex items-center space-x-2 pb-4 border-b">
                        <User className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">{user?.email || 'User'}</span>
                      </div>
                      
                      <Button
                        variant={location.pathname === "/dashboard" ? "secondary" : "ghost"}
                        onClick={() => {
                          navigate("/dashboard");
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        Dashboard
                      </Button>
                      
                      <Button
                        variant={location.pathname === "/analytics" ? "secondary" : "ghost"}
                        onClick={() => {
                          navigate("/analytics");
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                      
                      <div className="pt-4 border-t space-y-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            navigate('/billing');
                            setMobileMenuOpen(false);
                          }}
                          className="justify-start w-full"
                        >
                          Manage Billing
                        </Button>
                        
                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="justify-start w-full"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Desktop User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hidden md:flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>{user?.email || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/billing')}>
                      Manage Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;