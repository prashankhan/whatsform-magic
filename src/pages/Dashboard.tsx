import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavBar from '@/components/NavBar';
import { Plus, FileText, Eye, Edit, Trash2, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Form {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  fields: any;
  business_phone: string | null;
  user_id: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false); // For now, default to free plan
  const navigate = useNavigate();
  const { toast } = useToast();

  const FREE_FORM_LIMIT = 2;

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
      } else {
        fetchForms();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching forms:', error);
        toast({
          title: "Error",
          description: "Failed to fetch forms",
          variant: "destructive",
        });
      } else {
        setForms(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleCreateForm = () => {
    if (!isPro && forms.length >= FREE_FORM_LIMIT) {
      toast({
        title: "Upgrade Required",
        description: `Free plan is limited to ${FREE_FORM_LIMIT} forms. Upgrade to Pro for unlimited forms.`,
        variant: "destructive",
      });
      return;
    }
    navigate('/form-builder');
  };

  const handleEditForm = (formId: string) => {
    navigate(`/form-builder/${formId}`);
  };

  const handleDeleteForm = async (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete form",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Form deleted successfully",
        });
        fetchForms();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar 
          isAuthenticated={!!user}
          onSignOut={handleSignOut}
          user={user}
        />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar 
        isAuthenticated={!!user}
        onSignOut={handleSignOut}
        user={user}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">My Forms</h1>
            <p className="text-muted-foreground">
              Create and manage your WhatsApp forms
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Plan indicator */}
            <Badge variant={isPro ? "default" : "secondary"} className="flex items-center space-x-1">
              {isPro && <Crown className="h-3 w-3" />}
              <span>{isPro ? 'Pro Plan' : 'Free Plan'}</span>
            </Badge>
            
            <Button onClick={handleCreateForm} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Form</span>
            </Button>
          </div>
        </div>

        {/* Plan limits info */}
        {!isPro && (
          <Card className="mb-6 border-warning/20 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Free Plan: {forms.length}/{FREE_FORM_LIMIT} forms used</p>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to Pro for unlimited forms and advanced features
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Forms grid */}
        {forms.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">No forms yet</CardTitle>
              <CardDescription className="mb-6">
                Create your first WhatsApp form to get started collecting responses
              </CardDescription>
              <Button onClick={handleCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{form.title}</CardTitle>
                      {form.description && (
                        <CardDescription className="line-clamp-2">
                          {form.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={form.is_published ? "success" : "secondary"}>
                      {form.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Created: {new Date(form.created_at).toLocaleDateString()}</p>
                      <p>Fields: {Array.isArray(form.fields) ? form.fields.length : 0}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditForm(form.id)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteForm(form.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;