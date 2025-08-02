import { useState, useEffect, useCallback } from 'react';
import { ErrorLogger } from '@/utils/errorLogger';
import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

export interface SystemHealth {
  errorRate: number;
  lastErrors: any[];
  performanceMetrics: PerformanceMetric[];
  databaseStatus: 'healthy' | 'degraded' | 'down';
  edgeFunctionStatus: 'healthy' | 'degraded' | 'down';
}

export function useMonitoring() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    errorRate: 0,
    lastErrors: [],
    performanceMetrics: [],
    databaseStatus: 'healthy',
    edgeFunctionStatus: 'healthy',
  });

  const [isLoading, setIsLoading] = useState(true);

  // Track performance metrics
  const trackPerformance = useCallback((name: string, value: number) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    };

    setSystemHealth(prev => ({
      ...prev,
      performanceMetrics: [
        ...prev.performanceMetrics.slice(-19), // Keep last 20 metrics
        metric,
      ],
    }));
  }, []);

  // Track form submission performance
  const trackFormSubmission = useCallback(async (
    formId: string,
    startTime: number,
    success: boolean,
    errorMessage?: string
  ) => {
    const duration = Date.now() - startTime;
    trackPerformance('form_submission', duration);

    if (!success && errorMessage) {
      await ErrorLogger.logSubmissionError(formId, 'unknown', errorMessage, {
        submissionDuration: duration,
      });
    }
  }, [trackPerformance]);

  // Track API call performance
  const trackApiCall = useCallback(async (
    endpoint: string,
    method: string,
    startTime: number,
    success: boolean,
    status?: number
  ) => {
    const duration = Date.now() - startTime;
    trackPerformance(`api_${endpoint}`, duration);

    if (!success && status) {
      await ErrorLogger.logNetworkError(endpoint, method, status, undefined, {
        apiCallDuration: duration,
      });
    }
  }, [trackPerformance]);

  // Check database health
  const checkDatabaseHealth = useCallback(async () => {
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('forms').select('id').limit(1);
      const duration = Date.now() - startTime;
      
      trackPerformance('database_query', duration);
      
      if (error) {
        setSystemHealth(prev => ({ ...prev, databaseStatus: 'degraded' }));
        return false;
      }
      
      setSystemHealth(prev => ({ 
        ...prev, 
        databaseStatus: duration > 2000 ? 'degraded' : 'healthy' 
      }));
      return true;
    } catch (e) {
      setSystemHealth(prev => ({ ...prev, databaseStatus: 'down' }));
      return false;
    }
  }, [trackPerformance]);

  // Check edge function health
  const checkEdgeFunctionHealth = useCallback(async () => {
    try {
      const startTime = Date.now();
      const { error } = await supabase.functions.invoke('test-webhook', {
        body: { test: true }
      });
      const duration = Date.now() - startTime;
      
      trackPerformance('edge_function', duration);
      
      if (error) {
        setSystemHealth(prev => ({ ...prev, edgeFunctionStatus: 'degraded' }));
        return false;
      }
      
      setSystemHealth(prev => ({ 
        ...prev, 
        edgeFunctionStatus: duration > 5000 ? 'degraded' : 'healthy' 
      }));
      return true;
    } catch (e) {
      setSystemHealth(prev => ({ ...prev, edgeFunctionStatus: 'down' }));
      return false;
    }
  }, [trackPerformance]);

  // Load error statistics
  const loadErrorStats = useCallback(async () => {
    try {
      const errors = await ErrorLogger.getErrorStats(24);
      if (errors) {
        const errorRate = errors.length;
        setSystemHealth(prev => ({
          ...prev,
          errorRate,
          lastErrors: errors.slice(0, 10),
        }));
      }
    } catch (e) {
      console.error('Failed to load error stats:', e);
    }
  }, []);

  // Initialize monitoring
  useEffect(() => {
    const initializeMonitoring = async () => {
      setIsLoading(true);
      
      await Promise.all([
        checkDatabaseHealth(),
        checkEdgeFunctionHealth(),
        loadErrorStats(),
      ]);
      
      setIsLoading(false);
    };

    initializeMonitoring();

    // Set up periodic health checks
    const interval = setInterval(() => {
      checkDatabaseHealth();
      loadErrorStats();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkDatabaseHealth, checkEdgeFunctionHealth, loadErrorStats]);

  // Monitor page performance
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          trackPerformance('page_load', navEntry.loadEventEnd - navEntry.fetchStart);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, [trackPerformance]);

  return {
    systemHealth,
    isLoading,
    trackPerformance,
    trackFormSubmission,
    trackApiCall,
    checkDatabaseHealth,
    checkEdgeFunctionHealth,
    loadErrorStats,
  };
}