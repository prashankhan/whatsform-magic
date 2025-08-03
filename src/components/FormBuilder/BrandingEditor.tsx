import React, { useState } from 'react';
import { FormBranding } from '@/lib/whatsapp';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ImageUpload from './ImageUpload';
import { ColorInput } from './ColorInput';
import { useSubscription } from '@/hooks/useSubscription';
import PricingModal from '@/components/PricingModal';
import { Crown, Plus, Trash2, ChevronDown, Image, Palette, AlignLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BrandingEditorProps {
  branding?: FormBranding;
  onChange: (branding: FormBranding) => void;
}

export const BrandingEditor: React.FC<BrandingEditorProps> = ({
  branding = {},
  onChange
}) => {
  const { subscribed } = useSubscription();
  const { toast } = useToast();
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [imagesOpen, setImagesOpen] = useState(true);
  const [colorsOpen, setColorsOpen] = useState(true);
  const [footerOpen, setFooterOpen] = useState(false);

  const handleUpgrade = () => {
    if (!subscribed) {
      setShowPricingModal(true);
    }
  };

  const updateBranding = (updates: Partial<FormBranding>) => {
    if (!subscribed) {
      toast({
        title: "Pro Feature",
        description: "Form branding is available for Pro users only.",
        variant: "destructive",
      });
      handleUpgrade();
      return;
    }
    onChange({ ...branding, ...updates });
  };

  const addFooterLink = () => {
    if (!subscribed) {
      handleUpgrade();
      return;
    }
    const newLinks = [...(branding.footerLinks || []), { text: '', url: '' }];
    updateBranding({ footerLinks: newLinks });
  };

  const updateFooterLink = (index: number, field: 'text' | 'url', value: string) => {
    if (!subscribed) return;
    const newLinks = [...(branding.footerLinks || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateBranding({ footerLinks: newLinks });
  };

  const removeFooterLink = (index: number) => {
    if (!subscribed) return;
    const newLinks = branding.footerLinks?.filter((_, i) => i !== index) || [];
    updateBranding({ footerLinks: newLinks });
  };

  return (
    <>
      <div className="space-y-6">
        {!subscribed && (
          <div className="flex items-center justify-between p-4 border border-dashed rounded-lg bg-muted/20">
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Pro Only
              </span>
              <span className="text-sm text-muted-foreground">
                Customize your form's branding and appearance
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleUpgrade}>
              Upgrade to Pro
            </Button>
          </div>
        )}

        {/* Images Section */}
        <Collapsible open={imagesOpen} onOpenChange={setImagesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span className="font-medium">Images & Media</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${imagesOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Cover Image */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Cover Image</Label>
              <p className="text-xs text-muted-foreground">
                Hero image displayed at the top of your form
              </p>
              <ImageUpload
                value={branding.coverImage}
                onChange={(url) => updateBranding({ coverImage: url })}
                label="Upload Cover Image"
                className={!subscribed ? "opacity-50 pointer-events-none" : ""}
              />
            </div>

            {/* Logo */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Logo</Label>
              <p className="text-xs text-muted-foreground">
                Company logo displayed in the form header
              </p>
              <ImageUpload
                value={branding.logo}
                onChange={(url) => updateBranding({ logo: url })}
                label="Upload Logo"
                className={!subscribed ? "opacity-50 pointer-events-none" : ""}
              />
            </div>

            {/* Background Image */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Background Image</Label>
              <p className="text-xs text-muted-foreground">
                Optional background image for your form
              </p>
              <ImageUpload
                value={branding.backgroundImage}
                onChange={(url) => updateBranding({ backgroundImage: url })}
                label="Upload Background Image"
                className={!subscribed ? "opacity-50 pointer-events-none" : ""}
              />
            </div>

            {/* Custom Favicon */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Custom Favicon</Label>
              <p className="text-xs text-muted-foreground">
                Favicon for embedded or shared forms (PNG/JPG only)
              </p>
              <ImageUpload
                value={branding.customFavicon}
                onChange={(url) => updateBranding({ customFavicon: url })}
                label="Upload Favicon"
                className={!subscribed ? "opacity-50 pointer-events-none" : ""}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Colors Section */}
        <Collapsible open={colorsOpen} onOpenChange={setColorsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="font-medium">Colors & Styling</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${colorsOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 mt-4">
            {/* Page Colors */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Page Colors</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ColorInput
                  id="pageBackgroundColor"
                  label="Page Background"
                  value={branding.pageBackgroundColor}
                  defaultValue="#ffffff"
                  onChange={(value) => updateBranding({ pageBackgroundColor: value })}
                  disabled={!subscribed}
                  description="Background color of the entire page"
                />
                <ColorInput
                  id="formBackgroundColor"
                  label="Form Background"
                  value={branding.formBackgroundColor}
                  defaultValue="#ffffff"
                  onChange={(value) => updateBranding({ formBackgroundColor: value })}
                  disabled={!subscribed}
                  description="Background color of the form card"
                />
              </div>
            </div>

            {/* Button Styling */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Button Styling</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ColorInput
                  id="buttonColor"
                  label="Button Color"
                  value={branding.buttonColor}
                  defaultValue="#3b82f6"
                  onChange={(value) => updateBranding({ buttonColor: value })}
                  disabled={!subscribed}
                  description="Primary button background color"
                />
                <ColorInput
                  id="buttonTextColor"
                  label="Button Text"
                  value={branding.buttonTextColor}
                  defaultValue="#ffffff"
                  onChange={(value) => updateBranding({ buttonTextColor: value })}
                  disabled={!subscribed}
                  description="Text color on buttons"
                />
              </div>
              
              {/* Button Border Radius */}
              <div className="space-y-2">
                <Label htmlFor="buttonBorderRadius" className="text-xs font-medium">Button Border Radius</Label>
                <p className="text-xs text-muted-foreground">Roundness of button corners (in pixels)</p>
                <div className="flex items-center space-x-3">
                  <Input
                    id="buttonBorderRadius"
                    type="number"
                    value={branding.buttonBorderRadius || 6}
                    onChange={(e) => updateBranding({ buttonBorderRadius: parseInt(e.target.value) || 6 })}
                    placeholder="6"
                    min="0"
                    max="50"
                    className="w-24"
                    disabled={!subscribed}
                  />
                  <span className="text-xs text-muted-foreground">px</span>
                </div>
              </div>
            </div>

            {/* Text Colors */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Text Colors</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ColorInput
                  id="titleColor"
                  label="Form Title"
                  value={branding.titleColor}
                  defaultValue="#1f2937"
                  onChange={(value) => updateBranding({ titleColor: value })}
                  disabled={!subscribed}
                  description="Color of the form title"
                />
                <ColorInput
                  id="descriptionColor"
                  label="Form Description"
                  value={branding.descriptionColor}
                  defaultValue="#6b7280"
                  onChange={(value) => updateBranding({ descriptionColor: value })}
                  disabled={!subscribed}
                  description="Color of the form description"
                />
                <ColorInput
                  id="fieldLabelColor"
                  label="Field Labels"
                  value={branding.fieldLabelColor}
                  defaultValue="#374151"
                  onChange={(value) => updateBranding({ fieldLabelColor: value })}
                  disabled={!subscribed}
                  description="Color of field labels"
                />
                <ColorInput
                  id="footerTextColor"
                  label="Footer Text"
                  value={branding.footerTextColor}
                  defaultValue="#6b7280"
                  onChange={(value) => updateBranding({ footerTextColor: value })}
                  disabled={!subscribed}
                  description="Color of footer text"
                />
              </div>
            </div>

            {/* Field Styling */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Field Styling</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ColorInput
                  id="fieldBorderColor"
                  label="Field Borders"
                  value={branding.fieldBorderColor}
                  defaultValue="#d1d5db"
                  onChange={(value) => updateBranding({ fieldBorderColor: value })}
                  disabled={!subscribed}
                  description="Border color of input fields"
                />
                <ColorInput
                  id="placeholderTextColor"
                  label="Placeholder Text"
                  value={branding.placeholderTextColor}
                  defaultValue="#9ca3af"
                  onChange={(value) => updateBranding({ placeholderTextColor: value })}
                  disabled={!subscribed}
                  description="Color of placeholder text"
                />
                <ColorInput
                  id="fieldFocusColor"
                  label="Field Focus Ring"
                  value={branding.fieldFocusColor}
                  defaultValue="#3b82f6"
                  onChange={(value) => updateBranding({ fieldFocusColor: value })}
                  disabled={!subscribed}
                  description="Focus ring color for form inputs"
                />
              </div>
            </div>

            {/* Form Controls */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Form Controls</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ColorInput
                  id="checkboxColor"
                  label="Checkbox Fill"
                  value={branding.checkboxColor}
                  defaultValue="#3b82f6"
                  onChange={(value) => updateBranding({ checkboxColor: value })}
                  disabled={!subscribed}
                  description="Background color when checkbox is checked"
                />
                <ColorInput
                  id="checkboxBorderColor"
                  label="Checkbox Border"
                  value={branding.checkboxBorderColor}
                  defaultValue="#d1d5db"
                  onChange={(value) => updateBranding({ checkboxBorderColor: value })}
                  disabled={!subscribed}
                  description="Border color of checkboxes"
                />
                <ColorInput
                  id="radioButtonColor"
                  label="Radio Button Fill"
                  value={branding.radioButtonColor}
                  defaultValue="#3b82f6"
                  onChange={(value) => updateBranding({ radioButtonColor: value })}
                  disabled={!subscribed}
                  description="Color when radio button is selected"
                />
                <ColorInput
                  id="radioButtonBorderColor"
                  label="Radio Button Border"
                  value={branding.radioButtonBorderColor}
                  defaultValue="#d1d5db"
                  onChange={(value) => updateBranding({ radioButtonBorderColor: value })}
                  disabled={!subscribed}
                  description="Border color of radio buttons"
                />
              </div>
            </div>

            {/* File Upload Styling */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">File Upload Styling</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ColorInput
                  id="fileUploadBorderColor"
                  label="Upload Border"
                  value={branding.fileUploadBorderColor}
                  defaultValue="#d1d5db"
                  onChange={(value) => updateBranding({ fileUploadBorderColor: value })}
                  disabled={!subscribed}
                  description="Border color of file upload area"
                />
                <ColorInput
                  id="fileUploadBackgroundColor"
                  label="Upload Background"
                  value={branding.fileUploadBackgroundColor}
                  defaultValue="#f9fafb"
                  onChange={(value) => updateBranding({ fileUploadBackgroundColor: value })}
                  disabled={!subscribed}
                  description="Background color of file upload area"
                />
                <ColorInput
                  id="fileUploadPlaceholderTextColor"
                  label="Upload Text"
                  value={branding.fileUploadPlaceholderTextColor}
                  defaultValue="#6b7280"
                  onChange={(value) => updateBranding({ fileUploadPlaceholderTextColor: value })}
                  disabled={!subscribed}
                  description="Text color in file upload area"
                />
              </div>
            </div>

            {/* Link Colors */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Link Colors</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ColorInput
                  id="linkColor"
                  label="General Links"
                  value={branding.linkColor}
                  defaultValue="#3b82f6"
                  onChange={(value) => updateBranding({ linkColor: value })}
                  disabled={!subscribed}
                  description="Color of general links"
                />
                <ColorInput
                  id="footerLinkColor"
                  label="Footer Links"
                  value={branding.footerLinkColor}
                  defaultValue="#3b82f6"
                  onChange={(value) => updateBranding({ footerLinkColor: value })}
                  disabled={!subscribed}
                  description="Color of footer links"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Footer Section */}
        <Collapsible open={footerOpen} onOpenChange={setFooterOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
            <div className="flex items-center space-x-2">
              <AlignLeft className="h-4 w-4" />
              <span className="font-medium">Footer & Branding</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${footerOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Footer Text */}
            <div className="space-y-2">
              <Label htmlFor="footerText" className="text-sm font-medium">Footer Text</Label>
              <p className="text-xs text-muted-foreground">
                Custom text displayed at the bottom of your form
              </p>
              <Textarea
                id="footerText"
                value={branding.footerText || ''}
                onChange={(e) => updateBranding({ footerText: e.target.value })}
                placeholder="© 2024 Your Company Name. All rights reserved."
                rows={2}
                disabled={!subscribed}
                className={!subscribed ? "opacity-50" : ""}
              />
            </div>

            {/* Footer Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Footer Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFooterLink}
                  disabled={!subscribed}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Link
                </Button>
              </div>
              
              {branding.footerLinks?.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={link.text}
                    onChange={(e) => updateFooterLink(index, 'text', e.target.value)}
                    placeholder="Link text"
                    className="flex-1"
                    disabled={!subscribed}
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => updateFooterLink(index, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1"
                    disabled={!subscribed}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFooterLink(index)}
                    disabled={!subscribed}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* White Label Option */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <Label className="text-sm font-medium">White Label</Label>
                <p className="text-xs text-muted-foreground">
                  Remove "Powered by WhatsForm" branding
                </p>
              </div>
              <Switch
                checked={branding.removePoweredBy || false}
                onCheckedChange={(checked) => updateBranding({ removePoweredBy: checked })}
                disabled={!subscribed}
                className={!subscribed ? "opacity-50" : ""}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
      />
    </>
  );
};