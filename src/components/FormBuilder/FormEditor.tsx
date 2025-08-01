import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { FormData, FormField } from '@/lib/whatsapp';
import FieldSelector from './FieldSelector';
import FieldEditor from './FieldEditor';
import WhatsAppPreview from './WhatsAppPreview';
import FormPreview from './FormPreview';
import ShareModal from './ShareModal';
import { Save, Eye, Share2, Globe, Lock } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface FormEditorProps {
  initialData?: FormData;
  onSave: (formData: FormData) => Promise<void>;
  isLoading?: boolean;
}

const FormEditor = ({ initialData, onSave, isLoading }: FormEditorProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    businessPhone: '',
    fields: [],
    isPublished: false,
    ...initialData
  });
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const generateFieldId = () => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddField = (fieldType: FormField['type']) => {
    const newField: FormField = {
      id: generateFieldId(),
      type: fieldType,
      label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      required: false,
      ...(fieldType === 'multiple-choice' && { options: ['Option 1', 'Option 2'] })
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    
    setExpandedField(newField.id);
    
    toast({
      title: "Field added",
      description: `${fieldType} field has been added to your form.`,
    });
  };

  const handleUpdateField = (fieldId: string, updatedField: FormField) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? updatedField : field
      )
    }));
  };

  const handleDeleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    
    if (expandedField === fieldId) {
      setExpandedField(null);
    }
    
    toast({
      title: "Field deleted",
      description: "The field has been removed from your form.",
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFormData(prev => {
        const oldIndex = prev.fields.findIndex(field => field.id === active.id);
        const newIndex = prev.fields.findIndex(field => field.id === over?.id);
        
        return {
          ...prev,
          fields: arrayMove(prev.fields, oldIndex, newIndex)
        };
      });
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your form.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.businessPhone.trim()) {
      toast({
        title: "Business phone required",
        description: "Please enter your business phone number.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSave(formData);
      toast({
        title: "Form saved",
        description: "Your form has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Form Editor Panel */}
      <div className="space-y-6">
        {/* Form Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Form Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Form Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter form title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this form is for"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Business Phone Number *</Label>
              <Input
                id="businessPhone"
                value={formData.businessPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, businessPhone: e.target.value }))}
                placeholder="+1234567890"
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US, +44 for UK)
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {formData.isPublished ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="publish-toggle" className="text-sm font-medium">
                    {formData.isPublished ? 'Published' : 'Draft'}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.isPublished 
                    ? 'Your form is live and can be accessed via the public link'
                    : 'Your form is in draft mode and not publicly accessible'
                  }
                </p>
              </div>
              <Switch
                id="publish-toggle"
                checked={formData.isPublished || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isPublished: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Form Fields</h3>
            <span className="text-sm text-muted-foreground">
              {formData.fields.length} field{formData.fields.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={formData.fields.map(field => field.id)}
              strategy={verticalListSortingStrategy}
            >
              {formData.fields.map((field) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  onUpdate={(updatedField) => handleUpdateField(field.id, updatedField)}
                  onDelete={() => handleDeleteField(field.id)}
                  isExpanded={expandedField === field.id}
                  onToggleExpanded={() => setExpandedField(
                    expandedField === field.id ? null : field.id
                  )}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {formData.fields.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">No fields yet. Add your first field below.</p>
            </div>
          )}
        </div>

        {/* Add Field Section */}
        <FieldSelector onAddField={handleAddField} />

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-4">
          <Button onClick={handleSave} disabled={isLoading} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Form'}
          </Button>
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowShare(true)}
            disabled={!formData.id}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* WhatsApp Preview Panel */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <WhatsAppPreview formData={formData} />
      </div>

      {/* Modals */}
      <FormPreview 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        formData={formData} 
      />
      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        formData={formData} 
      />
    </div>
  );
};

export default FormEditor;