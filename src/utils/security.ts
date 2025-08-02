// Security utilities for input validation and sanitization
export class SecurityValidator {
  // XSS protection - sanitize HTML content
  static sanitizeHtml(input: string): string {
    if (!input) return '';
    
    // Remove potentially dangerous HTML tags and attributes
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^>]*>/gi, '')
      .replace(/<meta\b[^>]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  // Validate webhook URLs to prevent SSRF
  static validateWebhookUrl(url: string): boolean {
    if (!url) return false;

    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTPS for security
      if (parsedUrl.protocol !== 'https:') {
        return false;
      }

      // Prevent localhost and private IP ranges
      const hostname = parsedUrl.hostname.toLowerCase();
      
      // Block localhost variations
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
        return false;
      }

      // Block private IP ranges (basic check)
      if (hostname.startsWith('192.168.') || 
          hostname.startsWith('10.') || 
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
        return false;
      }

      // Block metadata endpoints
      if (hostname.includes('metadata.google') || 
          hostname.includes('169.254.169.254') ||
          hostname.includes('metadata.azure') ||
          hostname.includes('metadata.ec2')) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  // Validate file uploads
  static validateFileUpload(file: File, maxSizeBytes: number = 5 * 1024 * 1024): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size exceeds ${maxSizeBytes / 1024 / 1024}MB limit` };
    }

    // Check file type against allowed types
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Basic file name validation
    const fileName = file.name;
    if (!fileName || fileName.length > 255) {
      return { valid: false, error: 'Invalid file name' };
    }

    // Prevent executable file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.js', '.vbs', '.jar'];
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    
    if (dangerousExtensions.includes(fileExtension)) {
      return { valid: false, error: 'File extension not allowed' };
    }

    return { valid: true };
  }

  // Validate form field content
  static validateFormField(value: any, fieldType: string): { valid: boolean; sanitized: any; error?: string } {
    if (value === null || value === undefined) {
      return { valid: true, sanitized: value };
    }

    switch (fieldType) {
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          return { valid: false, sanitized: null, error: 'Invalid text value' };
        }
        
        // Check for overly long content
        if (value.length > 10000) {
          return { valid: false, sanitized: null, error: 'Text content too long' };
        }

        return { 
          valid: true, 
          sanitized: this.sanitizeHtml(value.trim())
        };

      case 'email':
        if (typeof value !== 'string') {
          return { valid: false, sanitized: null, error: 'Invalid email value' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { valid: false, sanitized: null, error: 'Invalid email format' };
        }

        return { valid: true, sanitized: value.toLowerCase().trim() };

      case 'phone':
        if (typeof value !== 'string') {
          return { valid: false, sanitized: null, error: 'Invalid phone value' };
        }

        // Basic phone validation - numbers, spaces, dashes, parentheses, plus
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(value)) {
          return { valid: false, sanitized: null, error: 'Invalid phone format' };
        }

        return { valid: true, sanitized: value.trim() };

      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return { valid: false, sanitized: null, error: 'Invalid number value' };
        }

        return { valid: true, sanitized: numValue };

      case 'multiple-choice':
      case 'checkbox':
        if (Array.isArray(value)) {
          // Validate each option
          const sanitizedOptions = value.map(option => {
            if (typeof option !== 'string') return '';
            return this.sanitizeHtml(option.trim());
          }).filter(option => option.length > 0);

          return { valid: true, sanitized: sanitizedOptions };
        } else if (typeof value === 'string') {
          return { valid: true, sanitized: this.sanitizeHtml(value.trim()) };
        }

        return { valid: false, sanitized: null, error: 'Invalid selection value' };

      default:
        // For unknown field types, just sanitize as string
        if (typeof value === 'string') {
          return { valid: true, sanitized: this.sanitizeHtml(value.trim()) };
        }
        return { valid: true, sanitized: value };
    }
  }

  // Rate limiting check helper
  static generateClientFingerprint(userAgent?: string, acceptLanguage?: string): string {
    // Create a simple fingerprint from available headers
    const components = [
      userAgent || '',
      acceptLanguage || '',
      // Add timestamp to prevent caching issues
      Math.floor(Date.now() / (1000 * 60)) // Hour-based component
    ];
    
    return btoa(components.join('|')).substring(0, 16);
  }
}