import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, CheckCircle, AlertCircle, Key } from 'lucide-react';

interface GoogleSheetsConfig {
  enabled: boolean;
  spreadsheetId: string;
  worksheetName: string;
  apiKey: string;
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

  const testConnection = async () => {
    if (!googleSheetsConfig.spreadsheetId || !googleSheetsConfig.apiKey) {
      toast({
        variant: "destructive",
        title: "Missing Configuration",
        description: "Please enter both spreadsheet ID and API key first."
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      // Test Google Sheets API connection by trying to read the spreadsheet
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetsConfig.spreadsheetId}?key=${googleSheetsConfig.apiKey}`,
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
        {/* Enable/Disable Toggle */}
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

        {googleSheetsConfig.enabled && (
          <div className="space-y-4">
            {/* API Key Section */}
            <div className="space-y-2">
              <Label htmlFor="api-key" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Google Sheets API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Google Sheets API key"
                value={googleSheetsConfig.apiKey}
                onChange={(e) =>
                  onUpdate({
                    ...googleSheetsConfig,
                    apiKey: e.target.value
                  })
                }
              />
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium mb-2 text-sm">How to get your API Key:</h4>
                <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="h-3 w-3" /></a></li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the Google Sheets API in the API Library</li>
                  <li>Go to "Credentials" and click "Create Credentials" → "API Key"</li>
                  <li>Restrict the API key to only Google Sheets API for security</li>
                  <li>Copy and paste the API key above</li>
                </ol>
              </div>
            </div>

            {/* Spreadsheet Configuration */}
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

            {/* Test Connection Button */}
            {googleSheetsConfig.spreadsheetId && googleSheetsConfig.apiKey && (
              <Button
                onClick={testConnection}
                disabled={isTestingConnection}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isTestingConnection ? "Testing..." : "Test Connection"}
              </Button>
            )}

            {/* Configuration Summary */}
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

            {/* Important Notes */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Make sure your Google Sheets spreadsheet is accessible with your API key. 
                The spreadsheet should be either public or shared with your Google Cloud project's service account.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsSettings;