import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, GripVertical, Settings, ChevronDown, Zap, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { FormField, ConditionalLogic } from '@/lib/whatsapp';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  allFields: FormField[];
}

const FieldEditor = ({ field, onUpdate, onDelete, isExpanded, onToggleExpanded, allFields }: FieldEditorProps) => {
  const [options, setOptions] = useState(field.options?.join('\n') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
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

  const addConditionalLogic = () => {
    const newLogic: ConditionalLogic = {
      type: 'show',
      sourceFieldId: '',
      condition: 'equals',
      value: ''
    };
    const updatedLogic = [...(field.conditionalLogic || []), newLogic];
    onUpdate({ ...field, conditionalLogic: updatedLogic });
  };

  const updateConditionalLogic = (index: number, logic: ConditionalLogic) => {
    const updatedLogic = [...(field.conditionalLogic || [])];
    updatedLogic[index] = logic;
    onUpdate({ ...field, conditionalLogic: updatedLogic });
  };

  const removeConditionalLogic = (index: number) => {
    const updatedLogic = [...(field.conditionalLogic || [])];
    updatedLogic.splice(index, 1);
    onUpdate({ ...field, conditionalLogic: updatedLogic });
  };

  // Get available source fields (fields that appear before this one)
  const availableSourceFields = allFields.filter((f, index) => {
    const currentIndex = allFields.findIndex(field => field.id === f.id);
    const thisFieldIndex = allFields.findIndex(field => field.id === f.id);
    return f.id !== field.id && currentIndex < thisFieldIndex;
  });

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
                  <div className="flex items-center space-x-2">
                    <div className="font-medium">{field.label || 'Untitled Field'}</div>
                    {field.conditionalLogic && field.conditionalLogic.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Smart
                      </Badge>
                    )}
                  </div>
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

            {/* Required Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor={`required-${field.id}`}>Required field</Label>
              <Switch
                id={`required-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) => onUpdate({ ...field, required: checked })}
              />
            </div>

            {/* Advanced Options */}
            <div className="border-t pt-4">
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto font-normal">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Advanced Options</span>
                      {field.conditionalLogic && field.conditionalLogic.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {field.conditionalLogic.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4 mt-4">
                  {/* Conditional Logic Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Conditional Logic</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addConditionalLogic}
                        disabled={availableSourceFields.length === 0}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Rule
                      </Button>
                    </div>
                    
                    {field.conditionalLogic && field.conditionalLogic.length > 0 && (
                      <div className="space-y-3">
                        {field.conditionalLogic.map((logic, index) => (
                          <div key={index} className="p-3 border rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Rule {index + 1}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeConditionalLogic(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                              {/* Logic Type */}
                              <div className="space-y-1">
                                <Label className="text-xs">Action</Label>
                                <Select
                                  value={logic.type}
                                  onValueChange={(value: 'show' | 'hide' | 'required') =>
                                    updateConditionalLogic(index, { ...logic, type: value })
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="show">Show this field</SelectItem>
                                    <SelectItem value="hide">Hide this field</SelectItem>
                                    <SelectItem value="required">Make required</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Source Field */}
                              <div className="space-y-1">
                                <Label className="text-xs">When field</Label>
                                <Select
                                  value={logic.sourceFieldId}
                                  onValueChange={(value) =>
                                    updateConditionalLogic(index, { ...logic, sourceFieldId: value })
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableSourceFields.map((sourceField) => (
                                      <SelectItem key={sourceField.id} value={sourceField.id}>
                                        {sourceField.label || 'Untitled Field'}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Condition */}
                              <div className="space-y-1">
                                <Label className="text-xs">Condition</Label>
                                <Select
                                  value={logic.condition}
                                  onValueChange={(value: 'equals' | 'contains' | 'not_equals') =>
                                    updateConditionalLogic(index, { ...logic, condition: value })
                                  }
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="equals">Equals</SelectItem>
                                    <SelectItem value="contains">Contains</SelectItem>
                                    <SelectItem value="not_equals">Does not equal</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Value */}
                              <div className="space-y-1">
                                <Label className="text-xs">Value</Label>
                                <Input
                                  value={logic.value}
                                  onChange={(e) =>
                                    updateConditionalLogic(index, { ...logic, value: e.target.value })
                                  }
                                  placeholder="Enter value"
                                  className="h-8"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {availableSourceFields.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Add more fields above to create conditional logic rules.
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FieldEditor;