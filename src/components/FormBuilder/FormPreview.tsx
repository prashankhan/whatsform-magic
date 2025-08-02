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
import { Calendar, Upload, Send } from 'lucide-react';

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
            <Label htmlFor={field.id}>
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
            <Label htmlFor={field.id}>
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
            <Label htmlFor={field.id}>
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
            <Label>
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
            <Label>
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
            <Label htmlFor={field.id}>
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
            <Label htmlFor={field.id}>
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Form Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{formData.title}</CardTitle>
              {formData.description && (
                <p className="text-muted-foreground">{formData.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.fields.map(renderField)}
              
              {formData.fields.length > 0 && (
                <div className="pt-4">
                  <Button onClick={handleSubmit} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                </div>
              )}
              
              {formData.fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No fields added yet. Add some fields to see the preview.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormPreview;