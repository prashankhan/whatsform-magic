import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Eye, Crown } from 'lucide-react';
import { FormData } from '@/lib/whatsapp';
import { useSubscription } from '@/hooks/useSubscription';

interface ThankYouPageEditorProps {
  formData: FormData;
  onUpdate: (formData: FormData) => void;
}

const ThankYouPageEditor = ({ formData, onUpdate }: ThankYouPageEditorProps) => {
  const { subscribed, plan } = useSubscription();
  const isPro = subscribed && plan === 'pro';
  const thankYouPage = formData.thankYouPage || {
    message: '',
    redirectUrl: '',
    showBranding: true
  };

  const updateThankYouPage = (updates: Partial<typeof thankYouPage>) => {
    onUpdate({
      ...formData,
      thankYouPage: { ...thankYouPage, ...updates }
    });
  };

  const defaultMessage = `Thank you for your submission! We've received your ${formData.title.toLowerCase()} and will get back to you soon via WhatsApp.`;

  return (
    <div className="space-y-4">
      {!isPro ? (
        <div className="text-center p-6 border border-dashed rounded-lg bg-muted/20">
          <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="font-medium mb-2">Pro Feature</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Customize your thank you page with Pro plan
          </p>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Upgrade to Pro
          </Button>
        </div>
      ) : (
        <>
          {/* Thank You Message */}
          <div className="space-y-2">
            <Label htmlFor="thank-you-message">Thank You Message</Label>
            <Textarea
              id="thank-you-message"
              value={thankYouPage.message || defaultMessage}
              onChange={(e) => updateThankYouPage({ message: e.target.value })}
              placeholder={defaultMessage}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              This message will be displayed after form submission
            </p>
          </div>

          {/* Redirect URL */}
          <div className="space-y-2">
            <Label htmlFor="redirect-url">Redirect URL (Optional)</Label>
            <Input
              id="redirect-url"
              type="url"
              value={thankYouPage.redirectUrl || ''}
              onChange={(e) => updateThankYouPage({ redirectUrl: e.target.value })}
              placeholder="https://your-website.com/thank-you"
            />
            <p className="text-xs text-muted-foreground">
              Redirect users to your website after submission
            </p>
          </div>

          {/* Show Branding */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-branding">Show "Powered by FormBuilder" branding</Label>
              <p className="text-xs text-muted-foreground">
                Support our project by keeping the branding visible
              </p>
            </div>
            <Switch
              id="show-branding"
              checked={thankYouPage.showBranding !== false}
              onCheckedChange={(checked) => updateThankYouPage({ showBranding: checked })}
            />
          </div>

          {/* Preview */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <Eye className="h-4 w-4" />
              <Label className="text-sm font-medium">Preview</Label>
            </div>
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">Form Submitted Successfully!</h3>
                  <p className="text-muted-foreground text-sm">
                    {thankYouPage.message || defaultMessage}
                  </p>
                </div>
                {thankYouPage.redirectUrl && (
                  <Button size="sm" className="mt-4">
                    Continue to Website
                  </Button>
                )}
                {thankYouPage.showBranding !== false && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Powered by FormBuilder
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThankYouPageEditor;