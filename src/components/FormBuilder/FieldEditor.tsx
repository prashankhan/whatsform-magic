import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, GripVertical, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FormField } from '@/lib/whatsapp';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const FieldEditor = ({ field, onUpdate, onDelete, isExpanded, onToggleExpanded }: FieldEditorProps) => {
  const [options, setOptions] = useState(field.options?.join('\n') || '');
  
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

  const getFieldTypeLabel = (type: FormField['type']) => {
    switch (type) {
      case 'text': return 'Single-line Text';
      case 'phone': return 'Phone Number';
      case 'multiple-choice': return 'Multiple Choice';
      case 'date': return 'Date/Time';
      case 'file-upload': return 'File Upload';
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
              <Label htmlFor={`label-${field.id}`}>Field Label</Label>
              <Input
                id={`label-${field.id}`}
                value={field.label}
                onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                placeholder="Enter field label"
              />
            </div>

            {/* Placeholder (for text and phone fields) */}
            {(field.type === 'text' || field.type === 'phone') && (
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

            {/* Options (for multiple-choice fields) */}
            {field.type === 'multiple-choice' && (
              <div className="space-y-2">
                <Label htmlFor={`options-${field.id}`}>Options (one per line)</Label>
                <textarea
                  id={`options-${field.id}`}
                  className="w-full min-h-[100px] p-3 border border-input rounded-md text-sm"
                  value={options}
                  onChange={(e) => handleOptionsChange(e.target.value)}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
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

            {/* Required Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor={`required-${field.id}`}>Required field</Label>
              <Switch
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) => onUpdate({ ...field, required: checked })}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FieldEditor;