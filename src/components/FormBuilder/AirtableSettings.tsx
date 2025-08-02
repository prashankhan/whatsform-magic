import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AirtableConfig {
  enabled: boolean;
  baseId: string;
  tableName: string;
  apiKey: string;
}

interface AirtableSettingsProps {
  airtableConfig: AirtableConfig;
  onUpdate: (config: AirtableConfig) => void;
}

const AirtableSettings: React.FC<AirtableSettingsProps> = ({ airtableConfig, onUpdate }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleConfigChange = (field: keyof AirtableConfig, value: any) => {
    onUpdate({
      ...airtableConfig,
      [field]: value,
    });
  };

  const extractBaseId = (input: string): string => {
    // Extract base ID from Airtable URL or return as-is if already an ID
    const urlMatch = input.match(/airtable\.com\/([a-zA-Z0-9]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }
    // Check if it looks like a base ID (starts with app)
    if (input.startsWith('app') && input.length > 10) {
      return input;
    }
    return input;
  };

  const handleBaseIdChange = (value: string) => {
    const baseId = extractBaseId(value);
    handleConfigChange('baseId', baseId);
  };

  const testConnection = async () => {
    if (!airtableConfig.apiKey || !airtableConfig.baseId || !airtableConfig.tableName) {
      setTestStatus('error');
      setTestMessage('Please fill in all required fields');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Testing connection...');

    try {
      // Test by attempting to get table schema
      const response = await fetch(
        `https://api.airtable.com/v0/${airtableConfig.baseId}/${encodeURIComponent(airtableConfig.tableName)}?maxRecords=1`,
        {
          headers: {
            'Authorization': `Bearer ${airtableConfig.apiKey}`,
          },
        }
      );

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('Connection successful! Airtable integration is ready.');
      } else if (response.status === 404) {
        setTestStatus('error');
        setTestMessage('Table not found. Please check the base ID and table name.');
      } else if (response.status === 401) {
        setTestStatus('error');
        setTestMessage('Authentication failed. Please check your API key.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setTestStatus('error');
        setTestMessage(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Airtable Integration
          <a
            href="https://airtable.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </CardTitle>
        <CardDescription>
          Send form submissions directly to your Airtable base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="airtable-enabled"
            checked={airtableConfig.enabled}
            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
          />
          <Label htmlFor="airtable-enabled">Enable Airtable integration</Label>
        </div>

        {airtableConfig.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="airtable-api-key">Personal Access Token *</Label>
              <Input
                id="airtable-api-key"
                type="password"
                placeholder="pat..."
                value={airtableConfig.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Create a Personal Access Token in your{' '}
                <a
                  href="https://airtable.com/create/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Airtable account settings
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="airtable-base-id">Base ID *</Label>
              <Input
                id="airtable-base-id"
                placeholder="app... or paste Airtable URL"
                value={airtableConfig.baseId}
                onChange={(e) => handleBaseIdChange(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Find your Base ID in the{' '}
                <a
                  href="https://airtable.com/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Airtable API documentation
                </a>{' '}
                or paste your Airtable URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="airtable-table-name">Table Name *</Label>
              <Input
                id="airtable-table-name"
                placeholder="e.g., Form Submissions"
                value={airtableConfig.tableName}
                onChange={(e) => handleConfigChange('tableName', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The exact name of the table where submissions will be added
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={testStatus === 'testing' || !airtableConfig.apiKey || !airtableConfig.baseId || !airtableConfig.tableName}
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </Button>
              
              {testStatus === 'success' && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Connected</span>
                </div>
              )}
              
              {testStatus === 'error' && (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">Failed</span>
                </div>
              )}
            </div>

            {testMessage && (
              <Alert className={testStatus === 'success' ? 'border-green-200 bg-green-50' : testStatus === 'error' ? 'border-red-200 bg-red-50' : ''}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{testMessage}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Setup Tips:</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Form fields will be mapped to Airtable columns by their labels</li>
                  <li>• New columns will be created automatically if they don't exist</li>
                  <li>• Multiple choice selections will be stored as comma-separated text</li>
                  <li>• File uploads will be stored as URLs</li>
                </ul>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AirtableSettings;