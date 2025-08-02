import React, { useState } from 'react';
import { FormBranding } from '@/lib/whatsapp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import ImageUpload from './ImageUpload';
import { useSubscription } from '@/hooks/useSubscription';
import PricingModal from '@/components/PricingModal';
import { Crown, Plus, Trash2 } from 'lucide-react';
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
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-primary" />
            <span>Form Branding</span>
            {!subscribed && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Pro Only
              </span>
            )}
          </CardTitle>
          {!subscribed && (
            <Button variant="outline" size="sm" onClick={handleUpgrade}>
              Upgrade to Pro
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover Image Section */}
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

          <Separator />

          {/* Logo Section */}
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

          <Separator />

          {/* Colors Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Colors</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-xs">Primary Color</Label>
                <div className="flex items-center space-x-3">
                  <input
                    id="primaryColor"
                    type="color"
                    value={branding.primaryColor || '#3b82f6'}
                    onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                    className={`w-12 h-8 rounded border cursor-pointer ${!subscribed ? "opacity-50 pointer-events-none" : ""}`}
                    disabled={!subscribed}
                  />
                  <Input
                    value={branding.primaryColor || '#3b82f6'}
                    onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                    disabled={!subscribed}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundColor" className="text-xs">Background Color</Label>
                <div className="flex items-center space-x-3">
                  <input
                    id="backgroundColor"
                    type="color"
                    value={branding.backgroundColor || '#ffffff'}
                    onChange={(e) => updateBranding({ backgroundColor: e.target.value })}
                    className={`w-12 h-8 rounded border cursor-pointer ${!subscribed ? "opacity-50 pointer-events-none" : ""}`}
                    disabled={!subscribed}
                  />
                  <Input
                    value={branding.backgroundColor || '#ffffff'}
                    onChange={(e) => updateBranding({ backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1"
                    disabled={!subscribed}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Background Image Section */}
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

          <Separator />

          {/* Custom Favicon Section */}
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

          <Separator />

          {/* Footer Branding Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Footer Branding</Label>
            
            {/* Footer Text */}
            <div className="space-y-2">
              <Label htmlFor="footerText" className="text-xs">Footer Text</Label>
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
                <Label className="text-xs">Footer Links</Label>
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
          </div>

          <Separator />

          {/* White Label Option */}
          <div className="flex items-center justify-between">
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
        </CardContent>
      </Card>

      <PricingModal
        open={showPricingModal}
        onOpenChange={setShowPricingModal}
      />
    </>
  );
};