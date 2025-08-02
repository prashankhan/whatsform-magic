import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Type, 
  AlignLeft,
  Phone, 
  CheckSquare,
  Square,
  Calendar, 
  Upload,
  Plus,
  Info
} from 'lucide-react';
import { FormField } from '@/lib/whatsapp';

interface FieldSelectorProps {
  onAddField: (fieldType: FormField['type']) => void;
}

const fieldTypes = [
  {
    type: 'text' as const,
    label: 'Single-line Text',
    description: 'Text input for names, emails, etc.',
    icon: Type,
    color: 'text-blue-600'
  },
  {
    type: 'textarea' as const,
    label: 'Multi-line Text',
    description: 'Large text area for descriptions',
    icon: AlignLeft,
    color: 'text-indigo-600'
  },
  {
    type: 'phone' as const,
    label: 'Phone Number',
    description: 'Formatted phone number input',
    icon: Phone,
    color: 'text-green-600'
  },
  {
    type: 'multiple-choice' as const,
    label: 'Multiple Choice',
    description: 'Single select from options',
    icon: CheckSquare,
    color: 'text-purple-600'
  },
  {
    type: 'checkbox' as const,
    label: 'Checkbox',
    description: 'Multiple select from options',
    icon: Square,
    color: 'text-pink-600'
  },
  {
    type: 'date' as const,
    label: 'Date/Time',
    description: 'Date and time picker',
    icon: Calendar,
    color: 'text-orange-600'
  },
  {
    type: 'file-upload' as const,
    label: 'File Upload',
    description: 'Document or image upload',
    icon: Upload,
    color: 'text-red-600'
  },
  {
    type: 'information' as const,
    label: 'Information',
    description: 'Display text for guidance or instructions',
    icon: Info,
    color: 'text-slate-600'
  }
];

const FieldSelector = ({ onAddField }: FieldSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Field</span>
        </CardTitle>
        <CardDescription>
          Choose a field type to add to your form
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-2 sm:gap-3">
          {fieldTypes.map((fieldType) => {
            const IconComponent = fieldType.icon;
            return (
              <Button
                key={fieldType.type}
                variant="outline"
                className="h-auto p-3 sm:p-4 justify-start text-left hover:bg-muted/50 transition-colors"
                onClick={() => onAddField(fieldType.type)}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                  <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${fieldType.color} flex-shrink-0`} />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-medium text-sm sm:text-base truncate">{fieldType.label}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                      {fieldType.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldSelector;