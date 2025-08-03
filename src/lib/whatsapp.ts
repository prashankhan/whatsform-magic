// WhatsApp message utilities

export interface FormOption {
  text: string;
  image?: string;
  showImageUpload?: boolean;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'phone' | 'multiple-choice' | 'checkbox' | 'date' | 'file-upload' | 'information';
  label: string;
  placeholder?: string;
  required: boolean;
  image?: string; // Optional image for the field itself
  showImageUpload?: boolean; // Toggle for showing image upload UI
  options?: string[] | FormOption[]; // For multiple-choice and checkbox fields
  content?: string; // For information fields
}

export interface FormBranding {
  // Images
  coverImage?: string;
  logo?: string;
  backgroundImage?: string;
  customFavicon?: string;
  
  // Page & Form Colors
  pageBackgroundColor?: string;
  formBackgroundColor?: string;
  
  // Button Styling
  buttonColor?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: number;
  
  // Text Colors
  titleColor?: string;
  descriptionColor?: string;
  fieldLabelColor?: string;
  footerTextColor?: string;
  
  // Field Styling
  fieldBorderColor?: string;
  placeholderTextColor?: string;
  fieldFocusColor?: string;
  
  // Form Controls
  checkboxColor?: string;
  checkboxBorderColor?: string;
  radioButtonColor?: string;
  radioButtonBorderColor?: string;
  
  // File Upload Styling
  fileUploadBorderColor?: string;
  fileUploadBackgroundColor?: string;
  fileUploadPlaceholderTextColor?: string;
  
  // Link Colors
  linkColor?: string;
  footerLinkColor?: string;
  
  // Legacy colors (for backward compatibility)
  primaryColor?: string;
  backgroundColor?: string;
  
  // Footer & Branding
  footerText?: string;
  footerLinks?: Array<{ text: string; url: string }>;
  removePoweredBy?: boolean;
}

export interface FormData {
  id?: string;
  title: string;
  description?: string;
  businessPhone: string;
  fields: FormField[];
  isPublished?: boolean;
  thankYouPage?: {
    message: string;
    redirectUrl?: string;
    showBranding?: boolean;
  };
  webhook_enabled?: boolean;
  webhook_url?: string;
  webhook_method?: string;
  webhook_headers?: Record<string, string>;
  branding?: FormBranding;
}

export interface FormResponse {
  [fieldId: string]: string | string[] | File;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: Omit<FormField, 'id'>[];
  defaultTitle: string;
  defaultDescription: string;
}

export const generateWhatsAppMessage = (formData: FormData, responses: FormResponse): string => {
  let message = `*${formData.title}*\n\n`;
  
  if (formData.description) {
    message += `${formData.description}\n\n`;
  }

  // Add field responses (skip information fields)
  formData.fields.forEach((field) => {
    // Skip information fields - they don't collect responses
    if (field.type === 'information') return;
    
    const response = responses[field.id];
    if (response) {
      message += `*${field.label}:*\n`;
      
      if (field.type === 'file-upload' && response instanceof File) {
        const file = response as File & { publicUrl?: string };
        message += `📎 ${file.name}\n`;
        if (file.publicUrl) {
          message += `🔗 ${file.publicUrl}\n\n`;
        } else {
          message += `🔗 File uploaded\n\n`;
        }
      } else if (Array.isArray(response)) {
        // Handle both string arrays and FormOption arrays for responses
        const responseText = response.map(item => 
          typeof item === 'string' ? item : item
        ).join(', ');
        message += `${responseText}\n\n`;
      } else {
        message += `${response}\n\n`;
      }
      
    }
  });

  message += `_Sent via formlychat_`;
  
  return message;
};

export const generateWhatsAppUrl = (formData: FormData, responses: FormResponse): string => {
  const message = generateWhatsAppMessage(formData, responses);
  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = formData.businessPhone.replace(/[^\d]/g, ''); // Remove non-digits
  
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export const truncateMessage = (message: string, maxLength: number = 1800): { message: string; isTruncated: boolean } => {
  if (message.length <= maxLength) {
    return { message, isTruncated: false };
  }
  
  const truncated = message.substring(0, maxLength - 3) + '...';
  return { message: truncated, isTruncated: true };
};

// Generate sample responses for preview
export const generateSampleResponses = (fields: FormField[]): FormResponse => {
  const sampleResponses: FormResponse = {};
  
  fields.forEach((field) => {
    // Skip information fields - they don't collect responses
    if (field.type === 'information') return;
    
    switch (field.type) {
      case 'text':
        sampleResponses[field.id] = field.label.toLowerCase().includes('name') ? 'John Doe' : 'Sample response';
        break;
      case 'textarea':
        sampleResponses[field.id] = 'This is a longer sample response that demonstrates how multi-line text would appear in the WhatsApp message.';
        break;
      case 'phone':
        sampleResponses[field.id] = '+1 (555) 123-4567';
        break;
      case 'multiple-choice':
        if (field.options && field.options.length > 0) {
          const firstOption = field.options[0];
          sampleResponses[field.id] = typeof firstOption === 'string' ? firstOption : firstOption.text;
        }
        break;
      case 'checkbox':
        if (field.options && field.options.length > 0) {
          const options = field.options.slice(0, 2);
          sampleResponses[field.id] = options.map(option => 
            typeof option === 'string' ? option : option.text
          ).filter(Boolean);
        }
        break;
      case 'date':
        sampleResponses[field.id] = new Date().toLocaleDateString();
        break;
      case 'file-upload':
        sampleResponses[field.id] = 'document.pdf' as any; // Placeholder
        break;
      default:
        sampleResponses[field.id] = 'Sample response';
    }
  });
  
  return sampleResponses;
};