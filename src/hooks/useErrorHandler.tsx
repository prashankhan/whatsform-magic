import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ErrorLogger } from '@/utils/errorLogger';

export interface UseErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  context?: Record<string, any>;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { toast } = useToast();
  const { 
    showToast = true, 
    logError = true, 
    context = {} 
  } = options;

  const handleError = useCallback(async (
    error: Error | string,
    customMessage?: string,
    additionalContext?: Record<string, any>
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const displayMessage = customMessage || errorMessage || 'An unexpected error occurred';

    // Log the error
    if (logError) {
      await ErrorLogger.logError(error, {
        ...context,
        ...additionalContext,
        customMessage,
      });
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: 'Error',
        description: displayMessage,
        variant: 'destructive',
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error, { customMessage, additionalContext });
    }

    return { error: errorMessage };
  }, [toast, showToast, logError, context]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    customMessage?: string,
    additionalContext?: Record<string, any>
  ): Promise<{ data?: T; error?: string }> => {
    try {
      const data = await asyncFn();
      return { data };
    } catch (error) {
      const result = await handleError(error as Error, customMessage, additionalContext);
      return result;
    }
  }, [handleError]);

  const handleNetworkError = useCallback(async (
    url: string,
    method: string,
    status: number,
    response?: any,
    customMessage?: string
  ) => {
    await ErrorLogger.logNetworkError(url, method, status, response, context);
    
    if (showToast) {
      const message = customMessage || `Network error: ${status}`;
      toast({
        title: 'Connection Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [toast, showToast, context]);

  const handleFormError = useCallback(async (
    formId: string,
    fieldId: string,
    error: string,
    customMessage?: string
  ) => {
    await ErrorLogger.logFormError(formId, fieldId, error, context);
    
    if (showToast) {
      const message = customMessage || `Form validation error: ${error}`;
      toast({
        title: 'Form Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [toast, showToast, context]);

  return {
    handleError,
    handleAsyncError,
    handleNetworkError,
    handleFormError,
  };
}