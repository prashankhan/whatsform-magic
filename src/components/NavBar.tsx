import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, User } from 'lucide-react';

interface NavBarProps {
  isAuthenticated?: boolean;
  onSignIn?: () => void;
  onSignOut?: () => void;
  user?: any;
}

const NavBar = ({ isAuthenticated, onSignIn, onSignOut, user }: NavBarProps) => {
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
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>{user?.email || 'User'}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={onSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={onSignIn}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={onSignIn}>
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