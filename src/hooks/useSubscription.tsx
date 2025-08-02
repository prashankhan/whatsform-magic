import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionContextType {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  plan: string;
  loading: boolean;
  checkoutLoading: boolean;
  portalLoading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
  manageSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
  user: User | null;
}

export const SubscriptionProvider = ({ children, user }: SubscriptionProviderProps) => {
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user) {
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setPlan('free');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      setSubscribed(data.subscribed || false);
      setSubscriptionTier(data.subscription_tier || null);
      setSubscriptionEnd(data.subscription_end || null);
      setPlan(data.plan || 'free');
    } catch (error) {
      console.error('Error in checkSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async () => {
    if (checkoutLoading) return;
    
    try {
      setCheckoutLoading(true);
      console.log('Starting checkout process...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to create checkout session. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Checkout response:', data);

      if (data?.url) {
        console.log('Opening checkout URL:', data.url);
        window.open(data.url, '_blank');
        toast({
          title: "Redirecting to Payment",
          description: "Opening Stripe checkout in a new tab...",
        });
      } else {
        toast({
          title: "Payment Error",
          description: "No checkout URL received. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in createCheckout:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const manageSubscription = async () => {
    if (portalLoading) return;
    
    try {
      setPortalLoading(true);
      console.log('Opening customer portal...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('Error opening customer portal:', error);
        toast({
          title: "Portal Error",
          description: error.message || "Failed to open customer portal. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Customer portal response:', data);

      if (data?.url) {
        console.log('Opening portal URL:', data.url);
        window.open(data.url, '_blank');
        toast({
          title: "Opening Customer Portal",
          description: "Redirecting to billing management...",
        });
      } else {
        toast({
          title: "Portal Error",
          description: "No portal URL received. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in manageSubscription:', error);
      toast({
        title: "Portal Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Auto-refresh subscription status on success/cancel returns
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true' || urlParams.get('canceled') === 'true') {
      // Remove the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh subscription status
      setTimeout(() => {
        checkSubscription();
      }, 2000);
    }
  }, []);

  const value = {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    plan,
    loading,
    checkoutLoading,
    portalLoading,
    checkSubscription,
    createCheckout,
    manageSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};