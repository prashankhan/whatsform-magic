import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, GripVertical, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormField, FormOption } from '@/lib/whatsapp';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageUpload from './ImageUpload';
import OptionEditor from './OptionEditor';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const FieldEditor = ({ field, onUpdate, onDelete, isExpanded, onToggleExpanded }: FieldEditorProps) => {
  const [options, setOptions] = useState(field.options?.join('\n') || '');
  
  // Convert legacy string[] options to FormOption[] format
  const getFormattedOptions = (): FormOption[] => {
    if (!field.options) return [];
    if (field.options.length === 0) return [];
    
    // Check if it's already FormOption format
    if (typeof field.options[0] === 'object') {
      return field.options as FormOption[];
    }
    
    // Convert string[] to FormOption[]
    return (field.options as string[]).map(text => ({ text }));
  };
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const handleOptionsChange = (value: string) => {
    setOptions(value);
    const optionsList = value.split('\n').filter(option => option.trim());
    onUpdate({ ...field, options: optionsList });
  };

  const handleFormOptionsChange = (newOptions: FormOption[]) => {
    onUpdate({ ...field, options: newOptions });
  };

  const getFieldTypeLabel = (type: FormField['type']) => {
    switch (type) {
      case 'text': return 'Single-line Text';
      case 'textarea': return 'Multi-line Text';
      case 'phone': return 'Phone Number';
      case 'multiple-choice': return 'Multiple Choice';
      case 'checkbox': return 'Checkbox';
      case 'date': return 'Date/Time';
      case 'file-upload': return 'File Upload';
      case 'information': return 'Information';
      default: return type;
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style}>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  {...attributes} 
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{field.label || 'Untitled Field'}</div>
                  <div className="text-sm text-muted-foreground">
                    {getFieldTypeLabel(field.type)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Field Label */}
            <div className="space-y-2">
              <Label htmlFor={`label-${field.id}`}>
                {field.type === 'information' ? 'Information Title (Optional)' : 'Field Label'}
              </Label>
              <Input
                id={`label-${field.id}`}
                value={field.label}
                onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                placeholder={field.type === 'information' ? 'Enter information title' : 'Enter field label'}
              />
            </div>

            {/* Information Content */}
            {field.type === 'information' && (
              <div className="space-y-2">
                <Label htmlFor={`content-${field.id}`}>Information Content</Label>
                <Textarea
                  id={`content-${field.id}`}
                  value={field.content || ''}
                  onChange={(e) => onUpdate({ ...field, content: e.target.value })}
                  placeholder="Enter information text that will be displayed to users"
                  className="min-h-[100px]"
                />
              </div>
            )}

            {/* Placeholder (for text, textarea, and phone fields) */}
            {(field.type === 'text' || field.type === 'textarea' || field.type === 'phone') && (
              <div className="space-y-2">
                <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
                <Input
                  id={`placeholder-${field.id}`}
                  value={field.placeholder || ''}
                  onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              </div>
            )}

            {/* Field Image Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor={`show-image-${field.id}`}>Add field image</Label>
              <Switch
                id={`show-image-${field.id}`}
                checked={!!field.showImageUpload}
                onCheckedChange={(checked) => onUpdate({ 
                  ...field, 
                  showImageUpload: checked,
                  image: checked ? field.image : undefined
                })}
              />
            </div>

            {/* Field Image Upload */}
            {field.showImageUpload && (
              <ImageUpload
                value={field.image}
                onChange={(imageUrl) => onUpdate({ ...field, image: imageUrl })}
                label="Field Image"
              />
            )}

            {/* Options (for multiple-choice and checkbox fields) */}
            {(field.type === 'multiple-choice' || field.type === 'checkbox') && (
              <OptionEditor
                options={getFormattedOptions()}
                onChange={handleFormOptionsChange}
                fieldType={field.type}
              />
            )}

            {/* File Upload Settings */}
            {field.type === 'file-upload' && (
              <div className="space-y-2">
                <Label>File Upload Settings</Label>
                <div className="text-sm text-muted-foreground">
                  Accepts common file types (PDF, images, documents). Max size: 10MB
                </div>
              </div>
            )}

            {/* Required Toggle (not for information fields) */}
            {field.type !== 'information' && (
              <div className="flex items-center justify-between">
                <Label htmlFor={`required-${field.id}`}>Required field</Label>
                <Switch
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) => onUpdate({ ...field, required: checked })}
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FieldEditor;