import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResponsesTable, type ResponsesTableColumn } from '@/components/ui/responses-table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Search, Calendar, FileText, TrendingUp } from 'lucide-react';
import { WebhookDeliveriesTable } from './WebhookDeliveriesTable';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

interface FormSubmission {
  id: string;
  form_id: string;
  submission_data: any;
  submitted_at: string;
}

interface FormAnalyticsViewProps {
  form: {
    id: string;
    title: string;
    description?: string;
    fields: any;
    webhook_enabled?: boolean;
  };
  submissions: FormSubmission[];
  onBack: () => void;
  onUpgradeRequired?: () => void;
}

const FormAnalyticsView = ({ form, submissions, onBack, onUpgradeRequired }: FormAnalyticsViewProps) => {
  const { toast } = useToast();
  const { subscribed, plan } = useSubscription();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubmissions, setFilteredSubmissions] = useState<FormSubmission[]>([]);

  useEffect(() => {
    let filtered = submissions;
    if (searchTerm) {
      filtered = submissions.filter(sub => 
        JSON.stringify(sub.submission_data).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm]);

  const exportFormData = () => {
    const isPro = plan === 'pro' || subscribed;
    
    if (!isPro) {
      onUpgradeRequired?.();
      return;
    }

    if (filteredSubmissions.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no responses for this form",
        variant: "destructive",
      });
      return;
    }

    // Get all unique field keys from submissions
    const allKeys = new Set<string>();
    filteredSubmissions.forEach(sub => {
      Object.keys(sub.submission_data).forEach(key => allKeys.add(key));
    });

    const csvData = filteredSubmissions.map(sub => ({
      'Submitted At': format(new Date(sub.submitted_at), 'yyyy-MM-dd HH:mm:ss'),
      ...Object.fromEntries(Array.from(allKeys).map(key => [
        key, 
        Array.isArray(sub.submission_data[key]) 
          ? sub.submission_data[key].join(', ') 
          : sub.submission_data[key] || ''
      ]))
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(csvData[0] || {}).join(',') + '\n'
      + csvData.map(row => Object.values(row).map(value => `"${value}"`).join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredSubmissions.length} responses`,
    });
  };

  // Prepare chart data - submissions over time
  const submissionsByDate = submissions.reduce((acc, sub) => {
    const date = format(new Date(sub.submitted_at), 'MMM dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timelineData = Object.entries(submissionsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get form field information for better column labels
  const getFieldLabel = (fieldKey: string) => {
    if (!form.fields || !Array.isArray(form.fields)) return fieldKey;
    
    const field = form.fields.find((f: any) => f.id === fieldKey || f.name === fieldKey);
    if (field) {
      return field.label || field.name || fieldKey;
    }
    
    // Fallback: format the key nicely
    return fieldKey
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFieldType = (fieldKey: string): 'text' | 'date' | 'email' | 'phone' | 'number' | 'array' | 'status' => {
    if (!form.fields || !Array.isArray(form.fields)) return 'text';
    
    const field = form.fields.find((f: any) => f.id === fieldKey || f.name === fieldKey);
    if (field) {
      switch (field.type) {
        case 'email': return 'email';
        case 'phone': return 'phone';
        case 'number': return 'number';
        case 'date': return 'date';
        case 'checkbox': return 'array';
        case 'select': return 'text';
        default: return 'text';
      }
    }
    
    // Try to infer type from key name
    if (fieldKey.toLowerCase().includes('email')) return 'email';
    if (fieldKey.toLowerCase().includes('phone')) return 'phone';
    if (fieldKey.toLowerCase().includes('date')) return 'date';
    
    return 'text';
  };

  // Get unique field keys for dynamic table headers
  const allFieldKeys = Array.from(
    new Set(
      submissions.flatMap(sub => Object.keys(sub.submission_data))
    )
  );

  // Prepare columns for ResponsesTable
  const tableColumns: ResponsesTableColumn[] = [
    {
      key: 'submitted_at',
      label: 'Submitted',
      type: 'date',
      width: 'w-48'
    },
    ...allFieldKeys.map(key => ({
      key: `submission_data.${key}`,
      label: getFieldLabel(key),
      type: getFieldType(key) as 'text' | 'date' | 'email' | 'phone' | 'number' | 'array' | 'status',
      width: 'min-w-[200px] flex-1'
    })),
    {
      key: 'status',
      label: 'Status',
      type: 'status' as const,
      width: 'w-24',
      render: () => 'Completed'
    }
  ];

  // Prepare data for AirtableTable
  const tableData = filteredSubmissions.map(submission => ({
    ...submission,
    ...Object.fromEntries(
      allFieldKeys.map(key => [`submission_data.${key}`, submission.submission_data[key]])
    ),
    status: 'Completed'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{form.title}</h2>
          <p className="text-muted-foreground">Form analytics and responses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Response</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {submissions.length > 0 
                ? format(new Date(submissions[0].submitted_at), 'MMM dd, yyyy')
                : "No responses"
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timelineData.length > 0 
                ? Math.round(submissions.length / timelineData.length) 
                : 0
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      {timelineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Response Timeline</CardTitle>
            <CardDescription>Daily response count over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Response Management */}
      <Card>
        <CardHeader>
          <CardTitle>Response Data</CardTitle>
          <CardDescription>View and export individual responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search responses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button onClick={exportFormData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <ResponsesTable 
            data={tableData}
            columns={tableColumns}
            className="min-h-[400px]"
          />
        </CardContent>
      </Card>

      {/* Webhook Deliveries */}
      {form?.webhook_enabled && (
        <WebhookDeliveriesTable formId={form.id} />
      )}
    </div>
  );
};

export default FormAnalyticsView;