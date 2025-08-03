import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FormData } from '@/lib/whatsapp';
import { Copy, QrCode, Code, Link, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  hasUnsavedChanges?: boolean;
  onSaveAndShare?: () => Promise<void>;
  onPublish?: () => Promise<void>;
}

const ShareModal = ({ isOpen, onClose, formData, hasUnsavedChanges, onSaveAndShare, onPublish }: ShareModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Generate form URL (in a real app, this would be your domain)
  const formUrl = `${window.location.origin}/form/${formData.id}`;
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const embedCode = `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const generateQRCode = (url: string) => {
    // Using QR Server API for QR code generation
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const handlePublish = async () => {
    if (!onPublish) return;
    
    setIsPublishing(true);
    try {
      await onPublish();
      toast({
        title: "Form published!",
        description: "Your form is now live and accessible via the shared links.",
      });
    } catch (error) {
      toast({
        title: "Publish failed",
        description: "There was an error publishing your form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!formData.id) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Your Form</DialogTitle>
        </DialogHeader>
        
        {hasUnsavedChanges && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 flex items-center justify-between">
              <span>You have unsaved changes. Save your form first to share the latest version.</span>
              {onSaveAndShare && (
                <Button 
                  size="sm" 
                  onClick={onSaveAndShare}
                  className="ml-3"
                >
                  Save & Share
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!hasUnsavedChanges && !formData.isPublished && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 flex items-center justify-between">
              <span>This form is not published yet. Publish it first to make it accessible via the shared links.</span>
              {onPublish && (
                <Button 
                  size="sm" 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="ml-3"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Now'}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="link" className="w-full">
          {hasUnsavedChanges && (
            <div className="bg-muted/50 p-3 rounded-lg mb-4 text-center text-sm text-muted-foreground">
              Sharing options will be available after saving your changes
            </div>
          )}
          {!hasUnsavedChanges && !formData.isPublished && (
            <div className="bg-muted/50 p-3 rounded-lg mb-4 text-center text-sm text-muted-foreground">
              Sharing options will be available after publishing your form
            </div>
          )}
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" disabled={hasUnsavedChanges || !formData.isPublished}>
              <Link className="h-4 w-4 mr-2" />
              Link
            </TabsTrigger>
            <TabsTrigger value="qr" disabled={hasUnsavedChanges || !formData.isPublished}>
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="embed" disabled={hasUnsavedChanges || !formData.isPublished}>
              <Code className="h-4 w-4 mr-2" />
              Embed
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Direct Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="form-url">Form URL</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="form-url" 
                      value={formUrl} 
                      readOnly 
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(formUrl, 'Link')}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                      {copied === 'Link' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share this link to let people fill out your form
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="qr" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">QR Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <img 
                    src={generateQRCode(formUrl)} 
                    alt="QR Code for form" 
                    className="border rounded-lg"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generateQRCode(formUrl);
                      link.download = `qr-code-${formData.title.replace(/\s+/g, '-').toLowerCase()}.png`;
                      link.click();
                    }}
                  >
                    Download QR Code
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    People can scan this QR code with their phone to access your form
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="embed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Embed Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="embed-code">HTML Embed Code</Label>
                  <div className="relative">
                    <textarea 
                      id="embed-code"
                      value={embedCode}
                      readOnly
                      className="w-full h-24 p-3 border border-input rounded-md text-sm font-mono resize-none"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(embedCode, 'Embed code')}
                      className="absolute top-2 right-2"
                    >
                      <Copy className="h-3 w-3" />
                      {copied === 'Embed code' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Copy and paste this code into your website to embed the form
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;