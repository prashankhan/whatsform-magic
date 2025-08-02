import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionProvider } from '@/hooks/useSubscription';
import NavBar from '@/components/NavBar';
import FormEditor from '@/components/FormBuilder/FormEditor';
import { FormData } from '@/lib/whatsapp';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FormBuilderContent = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadForm(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) {
        console.error('Error loading form:', error);
        toast({
          title: "Error",
          description: "Failed to load form",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setFormData({
        id: data.id,
        title: data.title,
        description: data.description || '',
        businessPhone: data.business_phone || '',
        fields: Array.isArray(data.fields) ? data.fields as any : [],
        isPublished: data.is_published || false,
        thankYouPage: (data.thank_you_page && typeof data.thank_you_page === 'object') ? data.thank_you_page as any : undefined,
        webhook_enabled: data.webhook_enabled || false,
        webhook_url: data.webhook_url || '',
        webhook_method: data.webhook_method || 'POST',
        webhook_headers: (typeof data.webhook_headers === 'object' && data.webhook_headers !== null) 
          ? data.webhook_headers as Record<string, string> 
          : {},
        branding: (data.branding && typeof data.branding === 'object') 
          ? data.branding as any 
          : undefined,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load form",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    // Get current user for saving
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    setSaving(true);
    try {
      const formPayload = {
        title: formData.title,
        description: formData.description || null,
        business_phone: formData.businessPhone,
        fields: formData.fields as any, // Cast to any for JSONB compatibility
        is_published: formData.isPublished || false,
        thank_you_page: formData.thankYouPage || null,
        webhook_enabled: formData.webhook_enabled || false,
        webhook_url: formData.webhook_url || null,
        webhook_method: formData.webhook_method || 'POST',
        webhook_headers: formData.webhook_headers || {},
        branding: formData.branding as any || null,
        user_id: user?.id
      };

      if (id) {
        // Update existing form
        const { error } = await supabase
          .from('forms')
          .update(formPayload)
          .eq('id', id);

        if (error) throw error;
      } else {
        // Create new form
        const { data, error } = await supabase
          .from('forms')
          .insert([formPayload])
          .select()
          .single();

        if (error) throw error;
        
        // Navigate to edit mode with the new form ID
        navigate(`/form-builder/${data.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving form:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
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

        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {id ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-muted-foreground">
            Build your WhatsApp form with real-time preview
          </p>
        </div>

        {/* Form Editor */}
        <FormEditor
          initialData={formData}
          onSave={handleSave}
          isLoading={saving}
        />
      </div>
    </div>
  );
};

const FormBuilder = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate('/auth');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <SubscriptionProvider user={user}>
      <FormBuilderContent />
    </SubscriptionProvider>
  );
};

export default FormBuilder;