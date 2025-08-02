import { supabase } from '@/integrations/supabase/client';

export interface ErrorContext {
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  componentStack?: string;
  errorBoundary?: boolean;
  formId?: string;
  submissionId?: string;
  edgeFunctionName?: string;
  [key: string]: any;
}

export interface ErrorLog {
  id?: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  context: ErrorContext;
  created_at?: string;
  user_id?: string;
}

class ErrorLoggerClass {
  private queue: ErrorLog[] = [];
  private isProcessing = false;

  async logError(error: Error | string, context: ErrorContext = {}) {
    const errorLog: ErrorLog = {
      error_type: typeof error === 'string' ? 'Manual' : error.constructor.name,
      error_message: typeof error === 'string' ? error : error.message,
      error_stack: typeof error === 'string' ? undefined : error.stack,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: context.timestamp || new Date().toISOString(),
      },
    };

    // Get current user if available
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        errorLog.user_id = user.id;
        errorLog.context.userId = user.id;
      }
    } catch (e) {
      // Ignore auth errors during error logging
    }

    // Add to queue
    this.queue.push(errorLog);
    
    // Process queue
    this.processQueue();

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }
  }

  async logNetworkError(url: string, method: string, status: number, response?: any, context: ErrorContext = {}) {
    await this.logError(`Network Error: ${method} ${url} - ${status}`, {
      ...context,
      networkError: true,
      httpMethod: method,
      httpStatus: status,
      httpUrl: url,
      httpResponse: response,
    });
  }

  async logFormError(formId: string, fieldId: string, error: string, context: ErrorContext = {}) {
    await this.logError(`Form Error: ${error}`, {
      ...context,
      formError: true,
      formId,
      fieldId,
    });
  }

  async logSubmissionError(formId: string, submissionId: string, error: string, context: ErrorContext = {}) {
    await this.logError(`Submission Error: ${error}`, {
      ...context,
      submissionError: true,
      formId,
      submissionId,
    });
  }

  async logEdgeFunctionError(functionName: string, error: string, context: ErrorContext = {}) {
    await this.logError(`Edge Function Error: ${error}`, {
      ...context,
      edgeFunctionError: true,
      edgeFunctionName: functionName,
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process up to 10 errors at once
      const batch = this.queue.splice(0, 10);
      
      // Try to save to database
      try {
        const { error } = await supabase
          .from('error_logs')
          .insert(batch);
        
        if (error) {
          console.error('Failed to save error logs to database:', error);
          // Put errors back in queue for retry
          this.queue.unshift(...batch);
        }
      } catch (dbError) {
        console.error('Database error while logging:', dbError);
        // Put errors back in queue for retry
        this.queue.unshift(...batch);
      }
    } catch (e) {
      console.error('Error processing error log queue:', e);
    } finally {
      this.isProcessing = false;
      
      // If there are more errors, process them after a delay
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 5000);
      }
    }
  }

  // Get error statistics for monitoring
  async getErrorStats(hours = 24) {
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('error_type, created_at, context')
        .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch error stats:', error);
        return null;
      }

      return data;
    } catch (e) {
      console.error('Error fetching error stats:', e);
      return null;
    }
  }
}

export const ErrorLogger = new ErrorLoggerClass();

// Setup global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    ErrorLogger.logError(event.error || event.message, {
      globalError: true,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    ErrorLogger.logError(`Unhandled Promise Rejection: ${event.reason}`, {
      unhandledRejection: true,
      reason: event.reason,
    });
  });
}