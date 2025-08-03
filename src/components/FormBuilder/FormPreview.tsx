import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData, FormField, FormResponse, FormOption, generateWhatsAppUrl } from '@/lib/whatsapp';
import { Calendar, Upload, MessageSquare } from 'lucide-react';
import { 
  generateBrandingStyles, 
  generateFormCardStyles, 
  generateButtonStyles, 
  generateTextStyles, 
  generateFieldStyles, 
  generateLinkStyles,
  generateCSSVariables 
} from '@/utils/brandingStyles';

interface FormPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
}

const FormPreview = ({ isOpen, onClose, formData }: FormPreviewProps) => {
  const [responses, setResponses] = useState<FormResponse>({});

  const handleSubmit = () => {
    const whatsappUrl = generateWhatsAppUrl(formData, responses);
    window.open(whatsappUrl, '_blank');
  };

  const handleFieldChange = (fieldId: string, value: string | string[] | File) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setResponses(prev => {
      const currentValues = (prev[fieldId] as string[]) || [];
      if (checked) {
        return { ...prev, [fieldId]: [...currentValues, option] };
      } else {
        return { ...prev, [fieldId]: currentValues.filter(v => v !== option) };
      }
    });
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
    const value = responses[field.id] as string || '';

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} style={generateTextStyles(branding, 'fieldLabel')}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldImage(field)}
            <Input
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} style={generateTextStyles(branding, 'fieldLabel')}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldImage(field)}
            <Textarea
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="min-h-[100px]"
            />
          </div>
        );

      case 'phone':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} style={generateTextStyles(branding, 'fieldLabel')}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldImage(field)}
            <Input
              id={field.id}
              type="tel"
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || "+1234567890"}
              required={field.required}
            />
          </div>
        );

      case 'multiple-choice':
        return (
          <div key={field.id} className="space-y-3">
            <Label style={generateTextStyles(branding, 'fieldLabel')}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldImage(field)}
            <RadioGroup
              value={value}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <div className="space-y-4">
                {field.options?.map((option, index) => {
                  const text = typeof option === 'string' ? option : option.text;
                  const image = typeof option === 'string' ? undefined : option.image;
                  
                  return (
                    <div 
                      key={index} 
                      className="space-y-2 cursor-pointer"
                      onClick={() => handleFieldChange(field.id, text)}
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
          </div>
        );

      case 'checkbox':
        const checkboxValues = (responses[field.id] as string[]) || [];
        return (
          <div key={field.id} className="space-y-3">
            <Label style={generateTextStyles(branding, 'fieldLabel')}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
              <span className="text-sm text-muted-foreground ml-2">(Select multiple)</span>
            </Label>
            {renderFieldImage(field)}
            <div className="space-y-4">
                {field.options?.map((option, index) => {
                  const text = typeof option === 'string' ? option : option.text;
                  const image = typeof option === 'string' ? undefined : option.image;
                  const isSelected = checkboxValues.includes(text);
                  
                  return (
                    <div 
                      key={index} 
                      className="space-y-2 cursor-pointer"
                      onClick={() => handleCheckboxChange(field.id, text, !isSelected)}
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
                          onCheckedChange={(checked) => 
                            handleCheckboxChange(field.id, text, checked as boolean)
                          }
                        />
                        <Label htmlFor={`${field.id}-${index}`} className="cursor-pointer">{text}</Label>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} style={generateTextStyles(branding, 'fieldLabel')}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldImage(field)}
            <div className="relative">
              <Input
                id={field.id}
                type="date"
                value={value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                required={field.required}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        );

      case 'file-upload':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} style={generateTextStyles(branding, 'fieldLabel')}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            {renderFieldImage(field)}
            <div className="relative">
              <Input
                id={field.id}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFieldChange(field.id, file);
                }}
                required={field.required}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
              />
              <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
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

  if (!formData.title) return null;

  const branding = formData.branding || {};
  const pageStyles = generateBrandingStyles(branding);
  const formCardStyles = generateFormCardStyles(branding);
  const buttonStyles = generateButtonStyles(branding);
  const cssVariables = generateCSSVariables(branding);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Form Preview</DialogTitle>
        </DialogHeader>
        
        {/* Full page layout like PublicForm */}
        <div 
          className="min-h-[80vh] w-full flex items-start justify-center p-6"
          style={{ ...pageStyles, ...cssVariables }}
        >
          <div className="w-full max-w-2xl space-y-6">
            {/* Cover Image */}
            {branding.coverImage && (
              <div className="w-full">
                <img 
                  src={branding.coverImage} 
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <Card style={formCardStyles} className="w-full">
              <CardHeader>
                {/* Logo */}
                {branding.logo && (
                  <div className="mb-4">
                    <img 
                      src={branding.logo} 
                      alt="Logo"
                      className="h-12 object-contain"
                    />
                  </div>
                )}
                <CardTitle style={generateTextStyles(branding, 'title')}>{formData.title}</CardTitle>
                {formData.description && (
                  <p style={generateTextStyles(branding, 'description')}>{formData.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                  {formData.fields.map(renderField)}
                  
                  {formData.fields.length > 0 && (
                    <div className="pt-4">
                      <Button 
                        type="submit"
                        className="w-full"
                        style={buttonStyles}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send via WhatsApp
                      </Button>
                    </div>
                  )}
                </form>
                
                {formData.fields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No fields added yet. Add some fields to see the preview.
                  </div>
                )}

                {/* Footer Branding */}
                {(branding.footerText || branding.footerLinks?.length) && (
                  <div className="pt-6 border-t">
                    {branding.footerText && (
                      <p 
                        className="text-xs mb-2"
                        style={generateTextStyles(branding, 'footerText')}
                      >
                        {branding.footerText}
                      </p>
                    )}
                    {branding.footerLinks && branding.footerLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
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
                )}

                {/* Powered by WhatsForm (unless removed) */}
                {!branding.removePoweredBy && (
                  <div className="pt-2 text-center">
                    <p className="text-xs text-muted-foreground">
                      Powered by WhatsForm
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormPreview;