import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavBar from '@/components/NavBar';
import PricingModal from '@/components/PricingModal';
import { Crown, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionProvider, useSubscription } from '@/hooks/useSubscription';

const BillingContent = () => {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, plan, manageSubscription, portalLoading } = useSubscription();

  const isPro = plan === 'pro' || subscribed;

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleManageBilling = () => {
    manageSubscription();
  };

  const handleUpgrade = () => {
    setShowPricingModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant={isPro ? "default" : "secondary"} className="flex items-center space-x-1">
              {isPro && <Crown className="h-3 w-3" />}
              <span>{isPro ? 'Pro Plan' : 'Free Plan'}</span>
            </Badge>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground mb-8">
            Manage your subscription and billing information
          </p>

          {/* Current Plan */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5" />
                <span>Current Plan</span>
              </CardTitle>
              <CardDescription>
                {isPro ? 'You are currently on the Pro plan' : 'You are currently on the Free plan'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{isPro ? 'Pro Plan' : 'Free Plan'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isPro 
                        ? 'Unlimited forms, branding, integrations, and priority support'
                        : 'Limited to 2 forms with basic features'
                      }
                    </p>
                  </div>
                  <Badge variant={isPro ? "default" : "secondary"}>
                    {isPro ? 'Active' : 'Free'}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  {isPro ? (
                    <Button 
                      onClick={handleManageBilling}
                      disabled={portalLoading}
                      className="flex items-center space-x-2"
                    >
                      {portalLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      <span>{portalLoading ? 'Opening Portal...' : 'Manage Billing'}</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleUpgrade}
                      className="flex items-center space-x-2"
                    >
                      <Crown className="h-4 w-4" />
                      <span>Upgrade to Pro</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Comparison */}
          {!isPro && (
            <Card>
              <CardHeader>
                <CardTitle>Upgrade Benefits</CardTitle>
                <CardDescription>
                  See what you get with a Pro subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Free Plan</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• 2 forms maximum</li>
                        <li>• Basic form fields</li>
                        <li>• WhatsApp integration</li>
                        <li>• Basic analytics</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Pro Plan</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Unlimited forms</li>
                        <li>• Custom branding</li>
                        <li>• Webhook integrations</li>
                        <li>• Advanced analytics</li>
                        <li>• Priority support</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleUpgrade}
                    className="w-full mt-6 flex items-center justify-center space-x-2"
                  >
                    <Crown className="h-4 w-4" />
                    <span>Upgrade to Pro - $29/month</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <PricingModal 
          open={showPricingModal} 
          onOpenChange={setShowPricingModal} 
        />
      </div>
    </div>
  );
};

const Billing = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SubscriptionProvider user={user}>
      <BillingContent />
    </SubscriptionProvider>
  );
};

export default Billing;