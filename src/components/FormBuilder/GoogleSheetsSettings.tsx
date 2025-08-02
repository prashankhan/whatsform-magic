import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
          Automatically send form submissions to a Google Sheets spreadsheet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

            <Button
              onClick={testConnection}
              disabled={isTestingConnection || !googleSheetsConfig.spreadsheetId}
              variant="outline"
              className="w-full"
            >
              {isTestingConnection ? 'Testing Connection...' : 'Test Connection'}
            </Button>

            <div className="bg-muted p-3 rounded-md">
              <h4 className="font-medium mb-2">Setup Instructions:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Create a Google Sheets spreadsheet</li>
                <li>Make the spreadsheet public or share it with anyone with the link</li>
                <li>Copy the spreadsheet URL or ID and paste it above</li>
                <li>Test the connection to ensure everything works</li>
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
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsSettings;