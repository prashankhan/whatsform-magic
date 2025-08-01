// WhatsApp message utilities
export interface FormField {
  id: string;
  type: 'text' | 'phone' | 'multiple-choice' | 'date' | 'file-upload';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For multiple-choice fields
}

export interface FormData {
  id?: string;
  title: string;
  description?: string;
  businessPhone: string;
  fields: FormField[];
  isPublished?: boolean;
}

export interface FormResponse {
  [fieldId: string]: string | string[] | File;
}

export const generateWhatsAppMessage = (formData: FormData, responses: FormResponse): string => {
  let message = `*${formData.title}*\n\n`;
  
  if (formData.description) {
    message += `${formData.description}\n\n`;
  }

  // Add field responses
  formData.fields.forEach((field) => {
    const response = responses[field.id];
    if (response) {
      message += `*${field.label}:*\n`;
      
      if (field.type === 'file-upload' && response instanceof File) {
        // For file uploads, we'll include the Cloudinary URL (placeholder for now)
        message += `📎 ${response.name}\n`;
        message += `🔗 https://cloudinary.com/uploaded-file-url\n\n`;
      } else if (Array.isArray(response)) {
        message += `${response.join(', ')}\n\n`;
      } else {
        message += `${response}\n\n`;
      }
    }
  });

  message += `_Sent via WhatsForm_`;
  
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
    switch (field.type) {
      case 'text':
        sampleResponses[field.id] = field.label.toLowerCase().includes('name') ? 'John Doe' : 'Sample response';
        break;
      case 'phone':
        sampleResponses[field.id] = '+1 (555) 123-4567';
        break;
      case 'multiple-choice':
        if (field.options && field.options.length > 0) {
          sampleResponses[field.id] = field.options[0];
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