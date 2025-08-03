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
import { CalendarIcon, Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FormData, FormField, FormResponse, FormOption, generateWhatsAppUrl } from '@/lib/whatsapp';
import FileUploadField from '@/components/FormBuilder/FileUploadField';
import { SecurityValidator } from '@/utils/security';
import { 
  generateBrandingStyles, 
  generateFormCardStyles, 
  generateButtonStyles, 
  generateTextStyles, 
  generateFieldStyles, 
  generateLinkStyles,
  generateCSSVariables 
} from '@/utils/brandingStyles';

export default function PublicForm() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<FormResponse>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update favicon when form loads
  const updateFavicon = (faviconUrl?: string) => {
    if (!faviconUrl) return;
    
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }
    
    // Add new favicon
    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.href = faviconUrl;
    newFavicon.type = 'image/png';
    document.head.appendChild(newFavicon);
  };

  useEffect(() => {
    if (id) {
      loadForm(id);
    }
  }, [id]);

  const loadForm = async (formId: string) => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*, webhook_enabled, webhook_url, webhook_method, webhook_headers, branding')
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
          branding: (data.branding as unknown) as any || {},
          thankYouPage: (data.thank_you_page && typeof data.thank_you_page === 'object') ? data.thank_you_page as any : undefined,
          webhook_enabled: data.webhook_enabled,
          webhook_url: data.webhook_url,
          webhook_method: data.webhook_method,
          webhook_headers: data.webhook_headers as Record<string, string> || {},
        };
        console.log('Form loaded with webhook config:', {
          webhook_enabled: form.webhook_enabled,
          webhook_url: form.webhook_url,
          form_id: form.id
        });
        setFormData(form);
        
        // Update favicon if custom favicon is set
        if (form.branding?.customFavicon) {
          updateFavicon(form.branding.customFavicon);
        }
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
      const response = responses[field.id];
      
      // Check required fields
      if (field.required) {
        if (!response || (Array.isArray(response) && response.length === 0)) {
          newErrors[field.id] = `${field.label} is required`;
          return;
        }
      }

      // Security validation for non-empty fields
      if (response !== undefined && response !== null && response !== '') {
        const validation = SecurityValidator.validateFormField(response, field.type);
        if (!validation.valid) {
          newErrors[field.id] = validation.error || 'Invalid input';
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
      // Security: Rate limiting check
      const { data: rateLimitCheck } = await supabase.rpc('check_submission_rate_limit', {
        client_ip: '127.0.0.1', // In production, this would come from server headers
        target_form_id: formData.id,
        max_submissions: 10,
        window_minutes: 60
      });

      if (!rateLimitCheck) {
        toast({
          title: "Too many submissions",
          description: "Please wait before submitting again.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Security: Sanitize all form responses
      const sanitizedData: Record<string, any> = {};
      for (const [fieldId, value] of Object.entries(responses)) {
        const field = formData.fields.find(f => f.id === fieldId);
        if (field && value !== undefined && value !== null && value !== '') {
          if (value instanceof File) {
            // Validate file uploads
            const fileValidation = SecurityValidator.validateFileUpload(value);
            if (!fileValidation.valid) {
              toast({
                title: "File validation failed",
                description: fileValidation.error,
                variant: "destructive",
              });
              setSubmitting(false);
              return;
            }
            sanitizedData[fieldId] = value.name; // Store filename for now
          } else {
            const validation = SecurityValidator.validateFormField(value, field.type);
            if (validation.valid) {
              sanitizedData[fieldId] = validation.sanitized;
            }
          }
        }
      }

      // Create form submission record (anonymous submissions allowed)
      const { data: submission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formData.id!,
          user_id: null, // Allow anonymous submissions for public forms
          submission_data: sanitizedData as any,
        })
        .select()
        .single();

      if (submissionError) {
        console.error('Submission error details:', submissionError);
        console.error('Form data:', formData);
        console.error('Submission data:', sanitizedData);
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
        
        // Check if we're in an iframe context
        const isInIframe = window !== window.top;
        
        if (isInIframe) {
          try {
            // Try to open in parent window for iframe context
            if (window.top) {
              window.top.open(whatsappUrl, '_blank');
            } else {
              // Fallback: redirect current iframe
              window.location.href = whatsappUrl;
            }
          } catch (error) {
            console.warn('Could not open in parent window, trying fallback:', error);
            // Final fallback: redirect current window
            window.location.href = whatsappUrl;
          }
        } else {
          // Normal browser context
          window.open(whatsappUrl, '_blank');
        }
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

  // Generate branding styles using utility functions
  const branding = formData?.branding || {};
  const pageStyles = generateBrandingStyles(branding);
  const formCardStyles = generateFormCardStyles(branding);
  const buttonStyles = generateButtonStyles(branding);
  const cssVariables = generateCSSVariables(branding);

  return (
    <div className="min-h-screen" style={{ ...pageStyles, ...cssVariables }}>
      <div className="max-w-2xl mx-auto p-4 py-8">
        <Card style={formCardStyles}>
          {/* Cover Image */}
          {branding.coverImage && (
            <div className="w-full h-48 overflow-hidden rounded-t-lg">
              <img 
                src={branding.coverImage} 
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardHeader className="text-center">
            {/* Logo */}
            {branding.logo && (
              <div className="flex justify-center mb-4">
                <img 
                  src={branding.logo} 
                  alt="Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
            )}
            
            <CardTitle 
              className="text-2xl" 
              style={generateTextStyles(branding, 'title')}
            >
              {formData.title}
            </CardTitle>
            {formData.description && (
              <CardDescription 
                className="text-base"
                style={generateTextStyles(branding, 'description')}
              >
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
                style={buttonStyles}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send via WhatsApp
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          {/* Custom Footer */}
          {branding.footerText && (
            <div className="px-6 pb-4">
              <div className="text-center pt-4 border-t">
                <p 
                  className="text-xs whitespace-pre-wrap"
                  style={generateTextStyles(branding, 'footerText')}
                >
                  {branding.footerText}
                </p>
                {branding.footerLinks && branding.footerLinks.length > 0 && (
                  <div className="flex justify-center space-x-4 mt-2">
                    {branding.footerLinks.map((link, index) => (
                      <a 
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs hover:underline"
                        style={generateLinkStyles(branding, 'footer')}
                      >
                        {link.text}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
        
        {/* Powered by notice */}
        {!branding.removePoweredBy && (
          <div className="text-center mt-8">
            <p className="text-xs text-muted-foreground">
              Powered by FormBuilder
            </p>
          </div>
        )}
      </div>
    </div>
  );
}