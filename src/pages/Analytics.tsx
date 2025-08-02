import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsesTable, type ResponsesTableColumn } from '@/components/ui/responses-table';
import { Badge } from '@/components/ui/badge';
import NavBar from '@/components/NavBar';
import FormCard from '@/components/Analytics/FormCard';
import FormAnalyticsView from '@/components/Analytics/FormAnalyticsView';
import PricingModal from '@/components/PricingModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, TrendingUp, Users, FileText, Download, Search, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscription, SubscriptionProvider } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { User, Session } from '@supabase/supabase-js';

interface Form {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  is_published: boolean;
  fields: any;
}

interface FormSubmission {
  id: string;
  form_id: string;
  submission_data: any;
  submitted_at: string;
  forms?: {
    title: string;
  };
}

interface AnalyticsData {
  totalSubmissions: number;
  totalForms: number;
  submissionsThisMonth: number;
  averageSubmissionsPerForm: number;
}

const AnalyticsContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, plan } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalSubmissions: 0,
    totalForms: 0,
    submissionsThisMonth: 0,
    averageSubmissionsPerForm: 0
  });
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);
  const [selectedFormForAnalytics, setSelectedFormForAnalytics] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, selectedForm, searchTerm]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    fetchData();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch forms with more details
      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select('id, title, description, created_at, is_published, fields')
        .order('created_at', { ascending: false });

      if (formsError) throw formsError;

      // Fetch submissions with form titles
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('form_submissions')
        .select(`
          id,
          form_id,
          submission_data,
          submitted_at,
          forms!inner(title)
        `)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      setForms(formsData || []);
      setSubmissions(submissionsData || []);

      // Calculate analytics
      const totalSubmissions = submissionsData?.length || 0;
      const totalForms = formsData?.length || 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const submissionsThisMonth = submissionsData?.filter(sub => {
        const subDate = new Date(sub.submitted_at);
        return subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear;
      }).length || 0;

      const averageSubmissionsPerForm = totalForms > 0 ? Math.round(totalSubmissions / totalForms) : 0;

      setAnalyticsData({
        totalSubmissions,
        totalForms,
        submissionsThisMonth,
        averageSubmissionsPerForm
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = submissions;

    if (selectedForm !== 'all') {
      filtered = filtered.filter(sub => sub.form_id === selectedForm);
    }

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.forms?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(sub.submission_data).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSubmissions(filtered);
  };

  const exportToCSV = () => {
    const isPro = plan === 'pro' || subscribed;
    
    if (!isPro) {
      setShowPricingModal(true);
      return;
    }

    const csvData = filteredSubmissions.map(sub => ({
      'Form Title': sub.forms?.title,
      'Submitted At': format(new Date(sub.submitted_at), 'yyyy-MM-dd HH:mm:ss'),
      ...Object.entries(sub.submission_data).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value.join(', ') : value;
        return acc;
      }, {} as Record<string, any>)
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(csvData[0] || {}).join(',') + '\n'
      + csvData.map(row => Object.values(row).map(value => `"${value}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `form_responses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Your form responses have been exported to CSV",
    });
  };

  const handleViewFormAnalytics = (formId: string) => {
    setSelectedFormForAnalytics(formId);
  };

  const handleBackToForms = () => {
    setSelectedFormForAnalytics(null);
  };

  const getFormSubmissions = (formId: string) => {
    return submissions.filter(sub => sub.form_id === formId);
  };

  const getFormSubmissionCount = (formId: string) => {
    return submissions.filter(sub => sub.form_id === formId).length;
  };

  const getLastSubmissionDate = (formId: string) => {
    const formSubs = submissions.filter(sub => sub.form_id === formId);
    if (formSubs.length === 0) return undefined;
    return formSubs.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0].submitted_at;
  };

  // Prepare chart data
  const chartData = forms.map(form => ({
    name: form.title.length > 20 ? form.title.substring(0, 20) + '...' : form.title,
    submissions: submissions.filter(sub => sub.form_id === form.id).length
  }));

  const pieData = [
    {
      name: 'This Month',
      value: analyticsData.submissionsThisMonth,
      color: 'hsl(var(--primary))'
    },
    {
      name: 'Previous',
      value: analyticsData.totalSubmissions - analyticsData.submissionsThisMonth,
      color: 'hsl(var(--muted))'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics & Responses</h1>
            <p className="text-muted-foreground">Monitor your form performance and manage responses</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="forms">Responses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalSubmissions}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalForms}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.submissionsThisMonth}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg per Form</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.averageSubmissionsPerForm}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submissions by Form</CardTitle>
                  <CardDescription>Number of submissions for each form</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="submissions" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Distribution</CardTitle>
                  <CardDescription>This month vs previous submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            {selectedFormForAnalytics ? (
              <FormAnalyticsView
                form={forms.find(f => f.id === selectedFormForAnalytics)!}
                submissions={getFormSubmissions(selectedFormForAnalytics)}
                onBack={handleBackToForms}
                onUpgradeRequired={() => setShowPricingModal(true)}
              />
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Response Management</CardTitle>
                    <CardDescription>View detailed analytics and responses for each form</CardDescription>
                  </CardHeader>
                </Card>
                
                {forms.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No forms found. Create your first form to see analytics.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                      <FormCard
                        key={form.id}
                        form={form}
                        submissionCount={getFormSubmissionCount(form.id)}
                        lastSubmissionDate={getLastSubmissionDate(form.id)}
                        onViewAnalytics={handleViewFormAnalytics}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

        </Tabs>

        <PricingModal 
          open={showPricingModal} 
          onOpenChange={setShowPricingModal} 
        />
      </div>
    </div>
  );
};

const Analytics = () => {
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
      <AnalyticsContent />
    </SubscriptionProvider>
  );
};

export default Analytics;