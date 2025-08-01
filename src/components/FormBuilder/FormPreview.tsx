import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormData, FormField, FormResponse, generateWhatsAppUrl } from '@/lib/whatsapp';
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

  const handleFieldChange = (fieldId: string, value: string | File) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
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
            <Input
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
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
            <RadioGroup
              value={value}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                  <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-destructive">*</span>}
            </Label>
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