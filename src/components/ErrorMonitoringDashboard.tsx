import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Activity, Clock, TrendingDown } from 'lucide-react';
import { useMonitoring } from '@/hooks/useMonitoring';
import { ErrorLogger } from '@/utils/errorLogger';
import { supabase } from '@/integrations/supabase/client';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  context: any;
  created_at: string;
  user_id?: string;
}

export function ErrorMonitoringDashboard() {
  const { systemHealth, isLoading } = useMonitoring();
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    loadErrorLogs();
  }, [timeRange]);

  const loadErrorLogs = async () => {
    try {
      const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Failed to load error logs:', error);
        return;
      }

      setErrorLogs(data || []);
    } catch (error) {
      console.error('Error loading error logs:', error);
    }
  };

  const clearOldLogs = async () => {
    try {
      const { error } = await supabase.rpc('cleanup_old_error_logs');
      if (error) {
        console.error('Failed to cleanup old logs:', error);
        return;
      }
      loadErrorLogs();
    } catch (error) {
      console.error('Error cleaning up logs:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const groupErrorsByType = () => {
    const grouped = errorLogs.reduce((acc, log) => {
      acc[log.error_type] = (acc[log.error_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Error Monitoring</h1>
          <p className="text-muted-foreground">Monitor system errors and performance</p>
        </div>
        <Button onClick={clearOldLogs} variant="outline">
          <TrendingDown className="h-4 w-4 mr-2" />
          Cleanup Old Logs
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.errorRate.toFixed(2)}%</div>
            <Progress value={systemHealth.errorRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(systemHealth.databaseStatus)}`}></div>
              <span className="capitalize font-medium">{systemHealth.databaseStatus}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edge Functions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(systemHealth.edgeFunctionStatus)}`}></div>
              <span className="capitalize font-medium">{systemHealth.edgeFunctionStatus}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
        <TabsList>
          <TabsTrigger value="1h">Last Hour</TabsTrigger>
          <TabsTrigger value="24h">Last 24 Hours</TabsTrigger>
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-4">
          {/* Error Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
              <CardDescription>
                {errorLogs.length} errors in the {timeRange === '1h' ? 'last hour' : timeRange === '24h' ? 'last 24 hours' : 'last 7 days'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Top Error Types</h4>
                  <div className="space-y-2">
                    {groupErrorsByType().map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <Badge variant="outline">{type}</Badge>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recent Errors</h4>
                  <div className="space-y-2">
                    {errorLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="text-sm">
                        <div className="font-medium truncate">{log.error_message}</div>
                        <div className="text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Log Details */}
          <Card>
            <CardHeader>
              <CardTitle>Error Log Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {errorLogs.map((log) => (
                  <Alert key={log.id}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge variant="destructive">{log.error_type}</Badge>
                            <div className="mt-1 font-medium">{log.error_message}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </div>
                        {log.error_stack && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-muted-foreground">
                              Stack Trace
                            </summary>
                            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {log.error_stack}
                            </pre>
                          </details>
                        )}
                        {Object.keys(log.context).length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-muted-foreground">
                              Context
                            </summary>
                            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.context, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                {errorLogs.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No errors found in the selected time range.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}