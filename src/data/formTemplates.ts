import { FormTemplate } from '@/lib/whatsapp';

export const formTemplates: FormTemplate[] = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Basic contact form for customer inquiries',
    category: 'General',
    defaultTitle: 'Contact Us',
    defaultDescription: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'text',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'How can we help you?',
        required: true,
        options: ['General Inquiry', 'Support Request', 'Partnership', 'Other']
      },
      {
        type: 'text',
        label: 'Message',
        placeholder: 'Tell us more about your inquiry...',
        required: true
      }
    ]
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Perfect for workshops, webinars, and events',
    category: 'Events',
    defaultTitle: 'Event Registration',
    defaultDescription: 'Register for our upcoming event. We\'ll send you all the details via WhatsApp.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'phone',
        label: 'WhatsApp Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'text',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'text',
        label: 'Organization/Company',
        placeholder: 'Your company name',
        required: false
      },
      {
        type: 'multiple-choice',
        label: 'Dietary Restrictions',
        required: false,
        options: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Other']
      }
    ]
  },
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Streamlined application form for job openings',
    category: 'HR',
    defaultTitle: 'Job Application',
    defaultDescription: 'Apply for this position by filling out the form below. We\'ll review your application and get back to you soon.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'text',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'text',
        label: 'Position Applied For',
        placeholder: 'Job title',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Years of Experience',
        required: true,
        options: ['0-1 years', '2-3 years', '4-5 years', '6-10 years', '10+ years']
      },
      {
        type: 'file-upload',
        label: 'Resume/CV',
        required: true
      },
      {
        type: 'text',
        label: 'Cover Letter',
        placeholder: 'Tell us why you\'re perfect for this role...',
        required: false
      }
    ]
  },
  {
    id: 'customer-feedback',
    name: 'Customer Feedback',
    description: 'Collect valuable feedback from your customers',
    category: 'Feedback',
    defaultTitle: 'Customer Feedback',
    defaultDescription: 'Your feedback helps us improve our services. Please take a moment to share your thoughts.',
    fields: [
      {
        type: 'text',
        label: 'Name',
        placeholder: 'Your name (optional)',
        required: false
      },
      {
        type: 'multiple-choice',
        label: 'Overall Satisfaction',
        required: true,
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
      },
      {
        type: 'multiple-choice',
        label: 'How did you hear about us?',
        required: false,
        options: ['Social Media', 'Google Search', 'Word of Mouth', 'Advertisement', 'Other']
      },
      {
        type: 'text',
        label: 'What did you like most?',
        placeholder: 'Tell us what you loved...',
        required: false
      },
      {
        type: 'text',
        label: 'How can we improve?',
        placeholder: 'Share your suggestions...',
        required: false
      }
    ]
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    description: 'Simple form to grow your subscriber list',
    category: 'Marketing',
    defaultTitle: 'Subscribe to Our Newsletter',
    defaultDescription: 'Stay updated with our latest news, tips, and exclusive offers delivered straight to your WhatsApp.',
    fields: [
      {
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true
      },
      {
        type: 'text',
        label: 'Email Address',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'phone',
        label: 'WhatsApp Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Interested Topics',
        required: false,
        options: ['Business Tips', 'Industry News', 'Product Updates', 'Special Offers', 'All of the above']
      }
    ]
  },
  {
    id: 'product-order',
    name: 'Product Order',
    description: 'Simple order form for products or services',
    category: 'E-commerce',
    defaultTitle: 'Place Your Order',
    defaultDescription: 'Fill out this form to place your order. We\'ll confirm the details and payment via WhatsApp.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'phone',
        label: 'WhatsApp Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'text',
        label: 'Delivery Address',
        placeholder: 'Your full address',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Product/Service',
        required: true,
        options: ['Product A', 'Product B', 'Service Package 1', 'Service Package 2', 'Custom Order']
      },
      {
        type: 'text',
        label: 'Quantity',
        placeholder: 'How many?',
        required: true
      },
      {
        type: 'text',
        label: 'Special Instructions',
        placeholder: 'Any special requests or notes...',
        required: false
      }
    ]
  }
];

export const getTemplatesByCategory = () => {
  const categories = [...new Set(formTemplates.map(template => template.category))];
  return categories.map(category => ({
    category,
    templates: formTemplates.filter(template => template.category === category)
  }));
};