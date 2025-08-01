import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, TrendingUp, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface FormCardProps {
  form: {
    id: string;
    title: string;
    description?: string;
    created_at: string;
    is_published: boolean;
    fields?: any;
  };
  submissionCount: number;
  lastSubmissionDate?: string;
  onViewAnalytics: (formId: string) => void;
}

const FormCard = ({ form, submissionCount, lastSubmissionDate, onViewAnalytics }: FormCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{form.title}</CardTitle>
            {form.description && (
              <CardDescription className="line-clamp-2">{form.description}</CardDescription>
            )}
          </div>
          <Badge variant={form.is_published ? "default" : "secondary"}>
            {form.is_published ? "Published" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{submissionCount}</p>
              <p className="text-xs text-muted-foreground">Responses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {lastSubmissionDate 
                  ? format(new Date(lastSubmissionDate), 'MMM dd') 
                  : "No responses"
                }
              </p>
              <p className="text-xs text-muted-foreground">Last response</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewAnalytics(form.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormCard;