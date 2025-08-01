import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FormData } from '@/lib/whatsapp';
import { Copy, QrCode, Code, Link } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
}

const ShareModal = ({ isOpen, onClose, formData }: ShareModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState('');

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

  if (!formData.id) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Your Form</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link">
              <Link className="h-4 w-4 mr-2" />
              Link
            </TabsTrigger>
            <TabsTrigger value="qr">
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </TabsTrigger>
            <TabsTrigger value="embed">
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