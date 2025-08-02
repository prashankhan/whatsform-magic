import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FormData, FormField, FormResponse, generateWhatsAppUrl } from '@/lib/whatsapp';
import FileUploadField from '@/components/FormBuilder/FileUploadField';

export default function PublicForm() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<FormResponse>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error loading form:', error);
        return;
      }

      if (data) {
        const form: FormData = {
          id: data.id,
          title: data.title,
          description: data.description,
          businessPhone: data.business_phone || '',
          fields: (data.fields as unknown) as FormField[],
          thankYouPage: (data.thank_you_page && typeof data.thank_you_page === 'object') ? data.thank_you_page as any : undefined
        };
        setFormData(form);
      }
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    formData?.fields.forEach((field) => {
      if (field.required && !responses[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData || !validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Convert responses to JSON-compatible format
      const submissionData = Object.fromEntries(
        Object.entries(responses).map(([key, value]) => [
          key, 
          value instanceof File ? value.name : value
        ])
      );

      // Create form submission record
      const { error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formData.id!,
          user_id: crypto.randomUUID(), // Generate temporary ID for public submissions
          submission_data: submissionData as any,
        });

      if (submissionError) {
        console.error('Submission error:', submissionError);
        toast({
          title: "Submission failed",
          description: "There was an error submitting your form. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSubmitted(true);
      
      toast({
        title: "Form submitted successfully!",
        description: "Opening WhatsApp with your form data...",
      });

      // Generate WhatsApp URL and open it
      const whatsappUrl = generateWhatsAppUrl(formData, responses);
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = responses[field.id];
    const error = errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              placeholder={field.placeholder}
              value={value as string || ''}
              onChange={(e) => setResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        );

      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              type="tel"
              placeholder={field.placeholder || "+1 (555) 123-4567"}
              value={value as string || ''}
              onChange={(e) => setResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        );

      case 'multiple-choice':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <RadioGroup
              value={value as string || ''}
              onValueChange={(value) => setResponses(prev => ({ ...prev, [field.id]: value }))}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value && "text-muted-foreground",
                    error && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value as string), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value as string) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setResponses(prev => ({ ...prev, [field.id]: date.toISOString() }));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        );

      case 'file-upload':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <FileUploadField
              fieldId={field.id}
              value={value as File}
              onChange={(fieldId, file) => setResponses(prev => ({ ...prev, [fieldId]: file || '' }))}
              required={field.required}
              error={error}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">Form Not Available</h1>
          <p className="text-muted-foreground mb-4">
            This form is either not published or doesn't exist. If you're the form owner, please make sure to publish your form in the Form Builder.
          </p>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const thankYouPage = formData?.thankYouPage;
    const defaultMessage = `Thank you for your submission! We've received your ${formData?.title?.toLowerCase()} and will get back to you soon via WhatsApp.`;
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-4">
          <Card className="text-center">
            <CardContent className="pt-6 space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-green-600 mb-2">Form Submitted Successfully!</h2>
                <p className="text-muted-foreground text-sm">
                  {thankYouPage?.message || defaultMessage}
                </p>
              </div>
              {thankYouPage?.redirectUrl && (
                <Button 
                  onClick={() => window.open(thankYouPage.redirectUrl, '_blank')}
                  className="mt-4"
                >
                  Continue to Website
                </Button>
              )}
              {thankYouPage?.showBranding !== false && (
                <p className="text-xs text-muted-foreground pt-4 border-t">
                  Powered by FormBuilder
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{formData.title}</CardTitle>
            {formData.description && (
              <CardDescription className="text-base">
                {formData.description}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formData.fields.map(renderField)}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting}
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Send via WhatsApp
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Powered by notice */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Powered by FormBuilder
          </p>
        </div>
      </div>
    </div>
  );
}