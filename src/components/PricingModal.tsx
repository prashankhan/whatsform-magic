import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PricingModal = ({ open, onOpenChange }: PricingModalProps) => {
  const { createCheckout, checkoutLoading } = useSubscription();

  const handleUpgrade = () => {
    createCheckout();
    onOpenChange(false);
  };

  const features = [
    {
      category: 'Forms',
      free: '2 forms',
      pro: 'Unlimited forms',
      proIcon: true
    },
    {
      category: 'Export Data',
      free: 'View only',
      pro: 'Full CSV export',
      proIcon: true
    },
    {
      category: 'Custom Branding',
      free: 'With branding',
      pro: 'White-label',
      proIcon: true
    },
    {
      category: 'Integrations',
      free: 'None',
      pro: 'Airtable, Sheets, Zapier',
      proIcon: true
    },
    {
      category: 'Support',
      free: 'Community',
      pro: 'Priority support',
      proIcon: true
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Choose Your Plan
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Upgrade to unlock advanced features and unlimited forms
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Free Plan */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Free Plan</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {feature.category === 'Custom Branding' || feature.category === 'Integrations' ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{feature.category}: </span>
                    <span className="text-muted-foreground">{feature.free}</span>
                  </div>
                </li>
              ))}
            </ul>

            <Button 
              variant="outline" 
              className="w-full mt-6"
              onClick={() => onOpenChange(false)}
            >
              Stay Free
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-primary rounded-lg p-6 bg-card relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              <Crown className="h-3 w-3 mr-1" />
              Recommended
            </Badge>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">Pro Plan</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </div>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{feature.category}: </span>
                    <span className="text-foreground font-medium">{feature.pro}</span>
                  </div>
                </li>
              ))}
            </ul>

            <Button 
              className="w-full mt-6"
              onClick={handleUpgrade}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Checkout...
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">What happens next?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Secure payment processing via Stripe</li>
            <li>• Instant access to all Pro features</li>
            <li>• Cancel anytime through your billing portal</li>
            <li>• 30-day money-back guarantee</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;