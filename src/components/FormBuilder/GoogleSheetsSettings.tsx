import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { Link as LinkIcon, Unlink, CheckCircle, AlertCircle } from 'lucide-react';

interface GoogleSheetsConfig {
  enabled: boolean;
  spreadsheetId: string;
  worksheetName: string;
}

interface GoogleSheetsSettingsProps {
  googleSheetsConfig: GoogleSheetsConfig;
  onUpdate: (config: GoogleSheetsConfig) => void;
}

const GoogleSheetsSettings: React.FC<GoogleSheetsSettingsProps> = ({
  googleSheetsConfig,
  onUpdate,
}) => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { isConnected, connectedAt, loading, connectGoogle, disconnectGoogle } = useGoogleAuth();

  const testConnection = async () => {
    if (!googleSheetsConfig.spreadsheetId) {
      toast({
        variant: "destructive",
        title: "Missing Configuration",
        description: "Please enter a spreadsheet ID first."
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      // Test Google Sheets API connection by trying to read the spreadsheet
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetsConfig.spreadsheetId}?key=${import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'test'}`,
        { method: 'GET' }
      );
      
      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Google Sheets!"
        });
      } else {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to connect to Google Sheets');
      }
    } catch (error) {
      console.error('Google Sheets test error:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Google Sheets. Please check your configuration."
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const extractSpreadsheetId = (url: string): string => {
    // Extract spreadsheet ID from Google Sheets URL
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleSpreadsheetIdChange = (value: string) => {
    const extractedId = extractSpreadsheetId(value);
    onUpdate({
      ...googleSheetsConfig,
      spreadsheetId: extractedId
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Sheets Integration
          {googleSheetsConfig.enabled && (
            <Badge variant="secondary">Enabled</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Automatically send form submissions to a Google Sheets spreadsheet using your Google account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google Account Connection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Google Account</Label>
            <div className="flex items-center gap-2">
              {loading ? (
                <Badge variant="outline">Checking...</Badge>
              ) : isConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
          </div>

          {isConnected ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your Google account is connected and ready to use with Google Sheets.
                {connectedAt && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Connected on {new Date(connectedAt).toLocaleDateString()}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect your Google account to enable Google Sheets integration for your forms.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {isConnected ? (
              <Button 
                onClick={disconnectGoogle} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Unlink className="h-4 w-4" />
                Disconnect Google Account
              </Button>
            ) : (
              <Button 
                onClick={connectGoogle} 
                disabled={loading}
                size="sm"
                className="flex items-center gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Connect Google Account
              </Button>
            )}
          </div>
        </div>

        {/* Google Sheets Integration Settings - Only show if connected */}
        {isConnected && (
          <>
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="google-sheets-enabled"
                  checked={googleSheetsConfig.enabled}
                  onCheckedChange={(enabled) =>
                    onUpdate({ ...googleSheetsConfig, enabled })
                  }
                />
                <Label htmlFor="google-sheets-enabled">
                  Enable Google Sheets integration
                </Label>
              </div>
            </div>

            {googleSheetsConfig.enabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spreadsheet-id">
                    Spreadsheet ID or URL
                  </Label>
                  <Input
                    id="spreadsheet-id"
                    placeholder="Enter Google Sheets URL or spreadsheet ID"
                    value={googleSheetsConfig.spreadsheetId}
                    onChange={(e) => handleSpreadsheetIdChange(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    You can paste the full Google Sheets URL or just the spreadsheet ID.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="worksheet-name">
                    Worksheet Name
                  </Label>
                  <Input
                    id="worksheet-name"
                    placeholder="Sheet1"
                    value={googleSheetsConfig.worksheetName}
                    onChange={(e) =>
                      onUpdate({
                        ...googleSheetsConfig,
                        worksheetName: e.target.value || 'Sheet1'
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Name of the worksheet tab where data will be added (default: Sheet1).
                  </p>
                </div>

                <div className="bg-muted p-3 rounded-md">
                  <h4 className="font-medium mb-2">Setup Instructions:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>Create a Google Sheets spreadsheet in your connected Google account</li>
                    <li>Copy the spreadsheet URL or ID and paste it above</li>
                    <li>Specify the worksheet name (optional, defaults to "Sheet1")</li>
                    <li>Save your form to activate the integration</li>
                  </ol>
                </div>

                {googleSheetsConfig.spreadsheetId && (
                  <div className="p-2 bg-muted rounded">
                    <p className="text-sm">
                      <strong>Spreadsheet ID:</strong>{' '}
                      <code className="bg-background px-1 py-0.5 rounded text-xs">
                        {googleSheetsConfig.spreadsheetId}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Show message if not connected and trying to enable */}
        {!isConnected && googleSheetsConfig.enabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your Google account first to enable Google Sheets integration.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsSettings;