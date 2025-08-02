import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FormData, FormField, FormResponse, FormOption, generateWhatsAppUrl } from '@/lib/whatsapp';
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
        .select('*, webhook_enabled, webhook_url, webhook_method, webhook_headers, google_sheets_enabled, google_sheets_spreadsheet_id, google_sheets_worksheet_name')
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
          thankYouPage: (data.thank_you_page && typeof data.thank_you_page === 'object') ? data.thank_you_page as any : undefined,
          webhook_enabled: data.webhook_enabled,
          webhook_url: data.webhook_url,
          webhook_method: data.webhook_method,
          webhook_headers: data.webhook_headers as Record<string, string> || {},
          google_sheets_enabled: data.google_sheets_enabled,
          google_sheets_spreadsheet_id: data.google_sheets_spreadsheet_id,
          google_sheets_worksheet_name: data.google_sheets_worksheet_name
        };
        console.log('Form loaded with webhook config:', {
          webhook_enabled: form.webhook_enabled,
          webhook_url: form.webhook_url,
          form_id: form.id
        });
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
      if (field.required) {
        const response = responses[field.id];
        if (!response || (Array.isArray(response) && response.length === 0)) {
          newErrors[field.id] = `${field.label} is required`;
        }
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

      // Create form submission record (anonymous submissions allowed)
      const { data: submission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formData.id!,
          user_id: null, // Allow anonymous submissions for public forms
          submission_data: submissionData as any,
        })
        .select()
        .single();

      if (submissionError) {
        console.error('Submission error details:', submissionError);
        console.error('Form data:', formData);
        console.error('Submission data:', submissionData);
        toast({
          title: "Submission failed",
          description: `There was an error submitting your form: ${submissionError.message}. Please try again.`,
          variant: "destructive",
        });
        return;
      }

      // Trigger webhook delivery if enabled
      console.log('Checking webhook trigger conditions:', {
        webhook_enabled: (formData as any).webhook_enabled,
        webhook_url: (formData as any).webhook_url,
        submission_id: submission?.id,
        form_id: formData.id
      });
      
      if ((formData as any).webhook_enabled && (formData as any).webhook_url && submission) {
        console.log('Triggering webhook delivery for submission:', submission.id);
        try {
          const result = await supabase.functions.invoke('webhook-delivery', {
            body: {
              submission_id: submission.id,
              form_id: formData.id
            }
          });
          console.log('Webhook delivery triggered:', result);
        } catch (webhookError) {
          console.error('Error triggering webhook:', webhookError);
          // Don't show error to user since form was submitted successfully
        }
      } else {
        console.log('Webhook not triggered - conditions not met');
      }

      // Trigger Google Sheets integration if enabled
      if ((formData as any).google_sheets_enabled && (formData as any).google_sheets_spreadsheet_id && submission) {
        console.log('Triggering Google Sheets integration for submission:', submission.id);
        try {
          const result = await supabase.functions.invoke('google-sheets-delivery', {
            body: {
              submissionId: submission.id
            }
          });
          console.log('Google Sheets integration triggered:', result);
        } catch (sheetsError) {
          console.error('Error triggering Google Sheets integration:', sheetsError);
          // Don't show error to user since form was submitted successfully
        }
      } else {
        console.log('Google Sheets integration not triggered - conditions not met');
      }

      setSubmitted(true);
      
      toast({
        title: "Form submitted successfully!",
        description: "Opening WhatsApp with your form data...",
      });

      // Generate WhatsApp URL and open it
      console.log('Generating WhatsApp URL with:', {
        formData: formData,
        responses: responses,
        businessPhone: formData.businessPhone
      });
      
      const whatsappUrl = generateWhatsAppUrl(formData, responses);
      console.log('Generated WhatsApp URL:', whatsappUrl);
      
      if (whatsappUrl && whatsappUrl.startsWith('https://wa.me/')) {
        console.log('Opening WhatsApp URL...');
        window.open(whatsappUrl, '_blank');
      } else {
        console.error('Invalid WhatsApp URL generated:', whatsappUrl);
        toast({
          variant: "destructive",
          title: "WhatsApp Error",
          description: "Could not generate WhatsApp URL. Please check the business phone number."
        });
      }
    } catch (error) {
      console.error('Error submitting form - Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('Form data at error:', formData);
      console.error('Responses at error:', responses);
      toast({
        variant: "destructive",
        title: "Error",
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldImage = (field: FormField) => {
    if (!field.image) return null;
    
    return (
      <div className="mb-3">
        <img 
          src={field.image} 
          alt={`Image for ${field.label}`}
          className="w-full max-w-md h-48 object-cover rounded-md border"
        />
      </div>
    );
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
            {renderFieldImage(field)}
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
            {renderFieldImage(field)}
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
            {renderFieldImage(field)}
            <RadioGroup
              value={value as string || ''}
              onValueChange={(value) => setResponses(prev => ({ ...prev, [field.id]: value }))}
            >
              <div className="space-y-4">
                {field.options?.map((option, index) => {
                  const text = typeof option === 'string' ? option : option.text;
                  const image = typeof option === 'string' ? undefined : option.image;
                  
                  return (
                    <div 
                      key={index} 
                      className="space-y-2 cursor-pointer"
                      onClick={() => setResponses(prev => ({ ...prev, [field.id]: text }))}
                    >
                      {image && (
                        <img 
                          src={image} 
                          alt={`Image for ${text}`}
                          className="w-full max-w-xs h-32 object-cover rounded-md border hover:border-primary transition-colors"
                        />
                      )}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={text} id={`${field.id}-${index}`} />
                        <Label htmlFor={`${field.id}-${index}`} className="cursor-pointer">{text}</Label>
                      </div>
                    </div>
                  );
                })}
              </div>
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

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldImage(field)}
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={value as string || ''}
              onChange={(e) => setResponses(prev => ({ ...prev, [field.id]: e.target.value }))}
              className={error ? 'border-destructive' : ''}
              rows={4}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldImage(field)}
            <div className="space-y-4">
              {field.options?.map((option, index) => {
                const text = typeof option === 'string' ? option : option.text;
                const image = typeof option === 'string' ? undefined : option.image;
                const isSelected = (value as string[] || []).includes(text);
                
                return (
                  <div 
                    key={index} 
                    className="space-y-2 cursor-pointer"
                    onClick={() => {
                      const currentValues = (value as string[]) || [];
                      if (isSelected) {
                        setResponses(prev => ({ 
                          ...prev, 
                          [field.id]: currentValues.filter(v => v !== text) 
                        }));
                      } else {
                        setResponses(prev => ({ 
                          ...prev, 
                          [field.id]: [...currentValues, text] 
                        }));
                      }
                    }}
                  >
                    {image && (
                      <img 
                        src={image} 
                        alt={`Image for ${text}`}
                        className="w-full max-w-xs h-32 object-cover rounded-md border hover:border-primary transition-colors"
                      />
                    )}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${field.id}-${index}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const currentValues = (value as string[]) || [];
                          if (checked) {
                            setResponses(prev => ({ 
                              ...prev, 
                              [field.id]: [...currentValues, text] 
                            }));
                          } else {
                            setResponses(prev => ({ 
                              ...prev, 
                              [field.id]: currentValues.filter(v => v !== text) 
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`${field.id}-${index}`} className="cursor-pointer">{text}</Label>
                    </div>
                  </div>
                );
              })}
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        );

      case 'file-upload':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldImage(field)}
            <FileUploadField
              fieldId={field.id}
              value={value as File}
              onChange={(fieldId, file) => setResponses(prev => ({ ...prev, [fieldId]: file || '' }))}
              required={field.required}
              error={error}
            />
          </div>
        );

      case 'information':
        return (
          <div key={field.id} className="space-y-2">
            {field.label && (
              <h3 className="text-lg font-medium text-foreground">{field.label}</h3>
            )}
            {field.content && (
              <div className="p-4 bg-muted/50 border border-border rounded-md">
                <p className="text-muted-foreground whitespace-pre-wrap">{field.content}</p>
              </div>
            )}
            {renderFieldImage(field)}
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