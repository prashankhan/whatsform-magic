import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import WhatsAppIcon from '@/components/ui/whatsapp-icon';
import { FormData, generateWhatsAppMessage, generateSampleResponses, truncateMessage } from '@/lib/whatsapp';

interface WhatsAppPreviewProps {
  formData: FormData;
}

const WhatsAppPreview = ({ formData }: WhatsAppPreviewProps) => {
  const sampleResponses = generateSampleResponses(formData.fields);
  const message = generateWhatsAppMessage(formData, sampleResponses);
  const { message: displayMessage, isTruncated } = truncateMessage(message);
  const charCount = message.length;
  const maxChars = 1800;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
            <span>WhatsApp Preview</span>
          </CardTitle>
          <Badge variant={charCount > maxChars ? "destructive" : "secondary"}>
            {charCount}/{maxChars}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Character count warning */}
        {isTruncated && (
          <div className="flex items-center space-x-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm text-warning-foreground">
              Message will be truncated. Consider shortening your form.
            </span>
          </div>
        )}

        {/* Phone number display */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Send to:</span> {formData.businessPhone || 'Business phone not set'}
        </div>

        {/* WhatsApp message preview */}
        <div className="relative">
          <div className="bg-whatsapp/10 border border-whatsapp/20 rounded-2xl p-4 max-h-96 overflow-y-auto">
            <div className="whitespace-pre-wrap text-sm font-mono bg-white/80 dark:bg-background/80 p-3 rounded-xl border">
              {displayMessage || 'Start building your form to see the preview...'}
            </div>
          </div>
          
          {/* WhatsApp-style tail */}
          <div className="absolute -bottom-1 right-4 w-4 h-4 bg-whatsapp/10 border-r border-b border-whatsapp/20 transform rotate-45"></div>
        </div>

        {/* Sample data notice */}
        {formData.fields.length > 0 && (
          <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
            <span className="font-medium">Note:</span> This preview shows sample responses. 
            The actual message will contain real user input.
          </div>
        )}

        {/* URL length info */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          <div>Estimated URL length: ~{message.length + 50} characters</div>
          <div>WhatsApp URL limit: ~2057 characters</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppPreview;