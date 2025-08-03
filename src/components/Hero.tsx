import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/whatsapp-icon';
import heroImage from '@/assets/hero-image.jpg';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero = ({ onGetStarted }: HeroProps) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Create <span className="bg-gradient-primary bg-clip-text text-transparent">formlychat Forms</span> in Minutes
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Build professional forms that generate WhatsApp messages instantly. 
                Perfect for lead generation, customer support, and business communication.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <WhatsAppIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">WhatsApp Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Instant Setup</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Secure & Fast</span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl" 
                onClick={onGetStarted}
                className="group"
              >
                Start Building Forms
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>✓ No credit card required</span>
              <span>✓ 2 free forms</span>
              <span>✓ Setup in 5 minutes</span>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroImage}
                alt="formlychat form builder illustration"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-primary rounded-full opacity-20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-whatsapp rounded-full opacity-20 blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;