import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Webhook, TestTube } from "lucide-react";
import { toast } from "sonner";

interface WebhookConfig {
  webhook_enabled: boolean;
  webhook_url: string;
  webhook_method: string;
  webhook_headers: Record<string, string>;
}

interface WebhookSettingsProps {
  webhookConfig: WebhookConfig;
  onUpdate: (config: WebhookConfig) => void;
}

export function WebhookSettings({ webhookConfig, onUpdate }: WebhookSettingsProps) {
  const [headerText, setHeaderText] = useState(() => {
    return Object.entries(webhookConfig.webhook_headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  });

  const parseHeaders = (text: string): Record<string, string> => {
    const headers: Record<string, string> = {};
    text.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value) {
          headers[key] = value;
        }
      }
    });
    return headers;
  };

  const handleHeadersChange = (text: string) => {
    setHeaderText(text);
    const headers = parseHeaders(text);
    onUpdate({
      ...webhookConfig,
      webhook_headers: headers
    });
  };

  const testWebhook = async () => {
    if (!webhookConfig.webhook_url) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: {
          webhook_url: webhookConfig.webhook_url,
          webhook_method: webhookConfig.webhook_method,
          webhook_headers: webhookConfig.webhook_headers
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast.success(`Webhook test successful! (${data.status})`);
      } else {
        toast.error(`Webhook test failed: ${data.status || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      toast.error(`Webhook test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Integration
        </CardTitle>
        <CardDescription>
          Configure webhooks to send form submissions to external services automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Webhooks</Label>
            <p className="text-sm text-muted-foreground">
              Send form submissions to external URLs
            </p>
          </div>
          <Switch
            checked={webhookConfig.webhook_enabled}
            onCheckedChange={(enabled) => 
              onUpdate({ ...webhookConfig, webhook_enabled: enabled })
            }
          />
        </div>

        {webhookConfig.webhook_enabled && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://api.example.com/webhook"
                  value={webhookConfig.webhook_url}
                  onChange={(e) => 
                    onUpdate({ ...webhookConfig, webhook_url: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="webhook-method">HTTP Method</Label>
                <Select
                  value={webhookConfig.webhook_method}
                  onValueChange={(method) => 
                    onUpdate({ ...webhookConfig, webhook_method: method })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="webhook-headers">Custom Headers (optional)</Label>
              <Textarea
                id="webhook-headers"
                placeholder="Authorization: Bearer your-token&#10;X-Custom-Header: custom-value"
                value={headerText}
                onChange={(e) => handleHeadersChange(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter headers in the format "Key: Value", one per line
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={testWebhook}
                disabled={!webhookConfig.webhook_url}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Webhook
              </Button>
              {webhookConfig.webhook_url && (
                <Badge variant="secondary" className="text-xs">
                  Will send to: {new URL(webhookConfig.webhook_url).hostname}
                </Badge>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Webhook Payload Structure</h4>
              <pre className="text-xs text-muted-foreground">
{`{
  "form_id": "uuid",
  "submission_id": "uuid", 
  "submitted_at": "2024-01-01T12:00:00Z",
  "form_title": "Contact Form",
  "data": {
    "field_name": "field_value",
    ...
  }
}`}
              </pre>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}