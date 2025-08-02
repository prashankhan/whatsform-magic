import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { FormData, FormField } from '@/lib/whatsapp';
import FieldSelector from './FieldSelector';
import FieldEditor from './FieldEditor';
import WhatsAppPreview from './WhatsAppPreview';
import FormPreview from './FormPreview';
import ShareModal from './ShareModal';
import TemplateSelector from './TemplateSelector';
import ThankYouPageEditor from './ThankYouPageEditor';
import { WebhookSettings } from './WebhookSettings';
import { BrandingEditor } from './BrandingEditor';
import { Save, Eye, Share2, Globe, Lock, Layout, ChevronDown, ChevronRight } from 'lucide-react';
import { FormTemplate } from '@/lib/whatsapp';
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
    webhook_enabled: false,
    webhook_url: '',
    webhook_method: 'POST',
    webhook_headers: {},
    ...initialData
  });
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!initialData && formData.fields.length === 0);
  const [expandedThankYou, setExpandedThankYou] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<FormData | null>(initialData || null);
  
  // Collapsible section states
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(true);
  const [webhooksOpen, setWebhooksOpen] = useState(false);
  const { toast } = useToast();

  // Track unsaved changes against last saved state
  const hasUnsavedChanges = useMemo(() => {
    if (!lastSavedData) return true; // New form always has unsaved changes
    return JSON.stringify(formData) !== JSON.stringify(lastSavedData);
  }, [formData, lastSavedData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setLastSavedData(initialData);
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
      // Update last saved data to current form data
      setLastSavedData({ ...formData });
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

  const handleSaveAndShare = async () => {
    try {
      await handleSave();
      // No need to close/reopen modal - state will update automatically
    } catch (error) {
      // Save failed, keep modal open with error state
    }
  };

  const handleSelectTemplate = (template: FormTemplate) => {
    const fieldsWithIds = template.fields.map(field => ({
      ...field,
      id: generateFieldId()
    }));

    setFormData(prev => ({
      ...prev,
      title: template.defaultTitle,
      description: template.defaultDescription,
      fields: fieldsWithIds
    }));
    
    setShowTemplates(false);
    
    toast({
      title: "Template applied",
      description: `${template.name} template has been applied to your form.`,
    });
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6 h-full min-h-screen lg:min-h-fit">{/* ... keep existing code */}
      {/* Form Editor Panel */}
      <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
        {/* Form Settings */}
        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle>Form Settings</CardTitle>
                  {settingsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Form Branding */}
        <Collapsible open={brandingOpen} onOpenChange={setBrandingOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle>Form Branding</CardTitle>
                  {brandingOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <BrandingEditor
                  branding={formData.branding}
                  onChange={(branding) => setFormData(prev => ({ ...prev, branding }))}
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Form Fields */}
        <Collapsible open={fieldsOpen} onOpenChange={setFieldsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle>Form Fields</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {formData.fields.length} field{formData.fields.length !== 1 ? 's' : ''}
                    </span>
                    {fieldsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
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

                {/* Template Selector Button */}
                {formData.fields.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowTemplates(true)}
                      className="w-full"
                    >
                      <Layout className="h-4 w-4 mr-2" />
                      Choose Different Template
                    </Button>
                  </div>
                )}

                {/* Add Field Section */}
                <div className="pt-4">
                  <FieldSelector onAddField={handleAddField} />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Thank You Page Editor */}
        <ThankYouPageEditor
          formData={formData}
          onUpdate={setFormData}
          isExpanded={expandedThankYou}
          onToggleExpanded={() => setExpandedThankYou(!expandedThankYou)}
        />

        {/* Webhook Settings */}
        <Collapsible open={webhooksOpen} onOpenChange={setWebhooksOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle>Webhook Settings</CardTitle>
                  {webhooksOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0">
                <WebhookSettings
                  webhookConfig={{
                    webhook_enabled: formData.webhook_enabled || false,
                    webhook_url: formData.webhook_url || '',
                    webhook_method: formData.webhook_method || 'POST',
                    webhook_headers: formData.webhook_headers || {}
                  }}
                  onUpdate={(config) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      webhook_enabled: config.webhook_enabled,
                      webhook_url: config.webhook_url,
                      webhook_method: config.webhook_method,
                      webhook_headers: config.webhook_headers
                    }))
                  }
                />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-4 pb-4 lg:pb-0">
          <Button onClick={handleSave} disabled={isLoading} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Form'}
            {hasUnsavedChanges && (
              <span className="ml-1 w-2 h-2 bg-orange-500 rounded-full" />
            )}
          </Button>
          <div className="flex space-x-2 sm:space-x-3">
            <Button variant="outline" onClick={() => setShowPreview(true)} className="flex-1 sm:flex-none">
              <Eye className="h-4 w-4 mr-2" />
              <span className="sm:inline">Preview</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowShare(true)}
              disabled={!formData.id}
              className="flex-1 sm:flex-none"
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span className="sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* WhatsApp Preview Panel */}
      <div className="lg:sticky lg:top-6 lg:h-fit order-1 lg:order-2">
        <div className="block lg:hidden mb-4">
          <h3 className="text-lg font-semibold mb-2">WhatsApp Preview</h3>
        </div>
        <WhatsAppPreview formData={formData} />
      </div>

      {/* Modals */}
      <TemplateSelector
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      <FormPreview 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        formData={formData} 
      />
      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        formData={formData}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveAndShare={handleSaveAndShare}
      />
    </div>
  );
};

export default FormEditor;