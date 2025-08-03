import { FormTemplate } from '@/lib/whatsapp';

export const formTemplates: FormTemplate[] = [
  // General (4 templates)
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
    id: 'support-ticket',
    name: 'Support Ticket',
    description: 'Technical support and issue reporting form',
    category: 'General',
    defaultTitle: 'Submit Support Ticket',
    defaultDescription: 'Experiencing an issue? Submit a support ticket and our team will help you resolve it quickly.',
    fields: [
      {
        type: 'text',
        label: 'Your Name',
        placeholder: 'Enter your name',
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
        label: 'Priority Level',
        required: true,
        options: ['Low', 'Medium', 'High', 'Critical']
      },
      {
        type: 'multiple-choice',
        label: 'Issue Category',
        required: true,
        options: ['Technical Issue', 'Account Problem', 'Billing Question', 'Feature Request', 'Other']
      },
      {
        type: 'text',
        label: 'Issue Description',
        placeholder: 'Describe the issue in detail...',
        required: true
      },
      {
        type: 'file-upload',
        label: 'Attachments',
        required: false
      }
    ]
  },
  {
    id: 'general-inquiry',
    name: 'General Inquiry',
    description: 'Simple form for general questions and information requests',
    category: 'General',
    defaultTitle: 'General Inquiry',
    defaultDescription: 'Have a question? We\'re here to help. Fill out this form and we\'ll get back to you.',
    fields: [
      {
        type: 'text',
        label: 'Name',
        placeholder: 'Your name',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'text',
        label: 'Subject',
        placeholder: 'What is this regarding?',
        required: true
      },
      {
        type: 'text',
        label: 'Message',
        placeholder: 'Your message...',
        required: true
      }
    ]
  },
  {
    id: 'quick-quote',
    name: 'Quick Quote Request',
    description: 'Fast quote request form for services or products',
    category: 'General',
    defaultTitle: 'Request a Quote',
    defaultDescription: 'Get a personalized quote for our services. Fill out this form and we\'ll send you a detailed estimate.',
    fields: [
      {
        type: 'text',
        label: 'Company Name',
        placeholder: 'Your company',
        required: true
      },
      {
        type: 'text',
        label: 'Contact Person',
        placeholder: 'Your name',
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
        label: 'Email',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Service Needed',
        required: true,
        options: ['Consulting', 'Development', 'Design', 'Marketing', 'Other']
      },
      {
        type: 'text',
        label: 'Project Details',
        placeholder: 'Describe your project requirements...',
        required: true
      }
    ]
  },

  // Events (4 templates)
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
    id: 'workshop-signup',
    name: 'Workshop Signup',
    description: 'Registration form for workshops and training sessions',
    category: 'Events',
    defaultTitle: 'Workshop Registration',
    defaultDescription: 'Join our hands-on workshop. Register now to secure your spot.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Experience Level',
        required: true,
        options: ['Beginner', 'Intermediate', 'Advanced']
      },
      {
        type: 'text',
        label: 'What do you hope to learn?',
        placeholder: 'Your goals for this workshop...',
        required: false
      }
    ]
  },
  {
    id: 'conference-registration',
    name: 'Conference Registration',
    description: 'Comprehensive registration for conferences and large events',
    category: 'Events',
    defaultTitle: 'Conference Registration',
    defaultDescription: 'Register for our annual conference. Early bird pricing available.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Job Title',
        placeholder: 'Your position',
        required: true
      },
      {
        type: 'text',
        label: 'Company/Organization',
        placeholder: 'Your company',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Ticket Type',
        required: true,
        options: ['Early Bird', 'Regular', 'Student', 'Group (5+)']
      },
      {
        type: 'multiple-choice',
        label: 'Dietary Requirements',
        required: false,
        options: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher', 'Other']
      }
    ]
  },
  {
    id: 'webinar-registration',
    name: 'Webinar Registration',
    description: 'Quick registration for online webinars and virtual events',
    category: 'Events',
    defaultTitle: 'Webinar Registration',
    defaultDescription: 'Join our live webinar. Registration is free and takes just a minute.',
    fields: [
      {
        type: 'text',
        label: 'First Name',
        placeholder: 'Your first name',
        required: true
      },
      {
        type: 'text',
        label: 'Last Name',
        placeholder: 'Your last name',
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
        label: 'Company',
        placeholder: 'Your company (optional)',
        required: false
      },
      {
        type: 'multiple-choice',
        label: 'How did you hear about this webinar?',
        required: false,
        options: ['Email', 'Social Media', 'Website', 'Colleague', 'Other']
      }
    ]
  },

  // HR (5 templates)
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
    id: 'interview-scheduling',
    name: 'Interview Scheduling',
    description: 'Schedule interviews with candidates efficiently',
    category: 'HR',
    defaultTitle: 'Schedule Your Interview',
    defaultDescription: 'Congratulations! We\'d like to schedule an interview with you. Please select your preferred time.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
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
        label: 'Position',
        placeholder: 'Position you applied for',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Preferred Interview Format',
        required: true,
        options: ['In-person', 'Video call', 'Phone call']
      },
      {
        type: 'multiple-choice',
        label: 'Preferred Time',
        required: true,
        options: ['Morning (9-12 AM)', 'Afternoon (12-5 PM)', 'Evening (5-7 PM)']
      }
    ]
  },
  {
    id: 'employee-feedback',
    name: 'Employee Feedback',
    description: 'Collect feedback from team members and employees',
    category: 'HR',
    defaultTitle: 'Employee Feedback',
    defaultDescription: 'Your feedback is valuable to us. Help us improve our workplace and culture.',
    fields: [
      {
        type: 'text',
        label: 'Name (Optional)',
        placeholder: 'Your name',
        required: false
      },
      {
        type: 'text',
        label: 'Department',
        placeholder: 'Your department',
        required: false
      },
      {
        type: 'multiple-choice',
        label: 'Job Satisfaction',
        required: true,
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
      },
      {
        type: 'multiple-choice',
        label: 'Work-Life Balance',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor']
      },
      {
        type: 'text',
        label: 'What do you like most about working here?',
        placeholder: 'Your thoughts...',
        required: false
      },
      {
        type: 'text',
        label: 'What could we improve?',
        placeholder: 'Your suggestions...',
        required: false
      }
    ]
  },
  {
    id: 'onboarding-form',
    name: 'Employee Onboarding',
    description: 'Collect new employee information for onboarding',
    category: 'HR',
    defaultTitle: 'New Employee Onboarding',
    defaultDescription: 'Welcome to the team! Please fill out this form to help us prepare for your first day.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Personal Email',
        placeholder: 'your.personal@email.com',
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
        label: 'Emergency Contact',
        placeholder: 'Name and phone number',
        required: true
      },
      {
        type: 'text',
        label: 'Start Date',
        placeholder: 'MM/DD/YYYY',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'T-Shirt Size',
        required: true,
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      }
    ]
  },
  {
    id: 'exit-interview',
    name: 'Exit Interview',
    description: 'Gather feedback from departing employees',
    category: 'HR',
    defaultTitle: 'Exit Interview',
    defaultDescription: 'We value your feedback. Please help us understand your experience and how we can improve.',
    fields: [
      {
        type: 'text',
        label: 'Name',
        placeholder: 'Your name',
        required: true
      },
      {
        type: 'text',
        label: 'Position',
        placeholder: 'Your position',
        required: true
      },
      {
        type: 'text',
        label: 'Department',
        placeholder: 'Your department',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Reason for Leaving',
        required: true,
        options: ['Better Opportunity', 'Career Change', 'Relocation', 'Personal Reasons', 'Retirement', 'Other']
      },
      {
        type: 'multiple-choice',
        label: 'Would you recommend this company to others?',
        required: true,
        options: ['Definitely', 'Probably', 'Maybe', 'Probably Not', 'Definitely Not']
      },
      {
        type: 'text',
        label: 'Additional Comments',
        placeholder: 'Any other feedback...',
        required: false
      }
    ]
  },

  // Feedback (4 templates)
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
    id: 'product-review',
    name: 'Product Review',
    description: 'Detailed product feedback and rating form',
    category: 'Feedback',
    defaultTitle: 'Product Review',
    defaultDescription: 'Share your experience with our product. Your review helps other customers make informed decisions.',
    fields: [
      {
        type: 'text',
        label: 'Product Name',
        placeholder: 'Which product are you reviewing?',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Overall Rating',
        required: true,
        options: ['5 Stars - Excellent', '4 Stars - Good', '3 Stars - Average', '2 Stars - Poor', '1 Star - Terrible']
      },
      {
        type: 'text',
        label: 'Review Title',
        placeholder: 'Summarize your experience',
        required: true
      },
      {
        type: 'text',
        label: 'Detailed Review',
        placeholder: 'Tell us about your experience...',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Would you recommend this product?',
        required: true,
        options: ['Definitely', 'Probably', 'Maybe', 'Probably Not', 'Definitely Not']
      },
      {
        type: 'text',
        label: 'Reviewer Name',
        placeholder: 'Your name (optional)',
        required: false
      }
    ]
  },
  {
    id: 'service-rating',
    name: 'Service Rating',
    description: 'Rate and review service quality',
    category: 'Feedback',
    defaultTitle: 'Service Rating',
    defaultDescription: 'How was your service experience? Your feedback helps us maintain high standards.',
    fields: [
      {
        type: 'text',
        label: 'Service Date',
        placeholder: 'When did you receive service?',
        required: true
      },
      {
        type: 'text',
        label: 'Service Type',
        placeholder: 'What service did you receive?',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Service Quality',
        required: true,
        options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
      },
      {
        type: 'multiple-choice',
        label: 'Staff Professionalism',
        required: true,
        options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
      },
      {
        type: 'multiple-choice',
        label: 'Timeliness',
        required: true,
        options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
      },
      {
        type: 'text',
        label: 'Additional Comments',
        placeholder: 'Any other feedback...',
        required: false
      }
    ]
  },
  {
    id: 'nps-survey',
    name: 'NPS Survey',
    description: 'Net Promoter Score survey to measure customer loyalty',
    category: 'Feedback',
    defaultTitle: 'Customer Satisfaction Survey',
    defaultDescription: 'Help us understand how we\'re doing and how we can serve you better.',
    fields: [
      {
        type: 'multiple-choice',
        label: 'How likely are you to recommend us to a friend or colleague?',
        required: true,
        options: ['10 - Extremely Likely', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0 - Not at all Likely']
      },
      {
        type: 'text',
        label: 'What is the primary reason for your score?',
        placeholder: 'Please explain...',
        required: false
      },
      {
        type: 'text',
        label: 'What could we do to improve your experience?',
        placeholder: 'Your suggestions...',
        required: false
      },
      {
        type: 'text',
        label: 'Any additional comments?',
        placeholder: 'Anything else you\'d like to share...',
        required: false
      }
    ]
  },

  // Marketing (5 templates)
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
    id: 'lead-generation',
    name: 'Lead Generation',
    description: 'Capture and qualify potential customers',
    category: 'Marketing',
    defaultTitle: 'Get Started Today',
    defaultDescription: 'Interested in our services? Fill out this form and we\'ll contact you with more information.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Company',
        placeholder: 'Your company name',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Company Size',
        required: true,
        options: ['1-10 employees', '11-50 employees', '51-200 employees', '201-1000 employees', '1000+ employees']
      },
      {
        type: 'multiple-choice',
        label: 'Budget Range',
        required: false,
        options: ['Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $25,000', '$25,000+']
      },
      {
        type: 'text',
        label: 'How can we help you?',
        placeholder: 'Describe your needs...',
        required: true
      }
    ]
  },
  {
    id: 'market-research',
    name: 'Market Research',
    description: 'Gather market insights and customer preferences',
    category: 'Marketing',
    defaultTitle: 'Market Research Survey',
    defaultDescription: 'Help us understand your preferences. Your input shapes our future products and services.',
    fields: [
      {
        type: 'text',
        label: 'Age Range',
        placeholder: 'e.g., 25-34',
        required: false
      },
      {
        type: 'multiple-choice',
        label: 'Industry',
        required: false,
        options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Other']
      },
      {
        type: 'multiple-choice',
        label: 'How often do you use our type of product/service?',
        required: true,
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        type: 'multiple-choice',
        label: 'What influences your purchasing decisions most?',
        required: true,
        options: ['Price', 'Quality', 'Brand Reputation', 'Reviews', 'Recommendations', 'Features']
      },
      {
        type: 'text',
        label: 'What features would you like to see in future products?',
        placeholder: 'Your suggestions...',
        required: false
      }
    ]
  },
  {
    id: 'contest-entry',
    name: 'Contest Entry',
    description: 'Entry form for contests, giveaways, and competitions',
    category: 'Marketing',
    defaultTitle: 'Contest Entry',
    defaultDescription: 'Enter our exciting contest for a chance to win amazing prizes!',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
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
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'text',
        label: 'City',
        placeholder: 'Your city',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'How did you hear about this contest?',
        required: false,
        options: ['Social Media', 'Website', 'Email', 'Friend', 'Advertisement', 'Other']
      },
      {
        type: 'text',
        label: 'Why do you want to win?',
        placeholder: 'Tell us your reason...',
        required: false
      }
    ]
  },
  {
    id: 'download-request',
    name: 'Download Request',
    description: 'Gate content downloads with lead capture',
    category: 'Marketing',
    defaultTitle: 'Download Free Resource',
    defaultDescription: 'Get instant access to our exclusive resource. Just fill out this quick form.',
    fields: [
      {
        type: 'text',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true
      },
      {
        type: 'text',
        label: 'Last Name',
        placeholder: 'Enter your last name',
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
        label: 'Company',
        placeholder: 'Your company (optional)',
        required: false
      },
      {
        type: 'multiple-choice',
        label: 'Job Role',
        required: false,
        options: ['Executive', 'Manager', 'Individual Contributor', 'Consultant', 'Student', 'Other']
      }
    ]
  },

  // E-commerce (4 templates)
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
  },
  {
    id: 'custom-quote',
    name: 'Custom Quote',
    description: 'Request custom pricing for products or services',
    category: 'E-commerce',
    defaultTitle: 'Request Custom Quote',
    defaultDescription: 'Need a custom solution? Tell us your requirements and we\'ll provide a personalized quote.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Company',
        placeholder: 'Your company name',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
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
        label: 'Project Description',
        placeholder: 'Describe your requirements in detail...',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Timeline',
        required: true,
        options: ['ASAP', '1-2 weeks', '1 month', '2-3 months', '3+ months']
      },
      {
        type: 'multiple-choice',
        label: 'Budget Range',
        required: false,
        options: ['Under $1,000', '$1,000 - $5,000', '$5,000 - $15,000', '$15,000+', 'Not sure']
      }
    ]
  },
  {
    id: 'return-request',
    name: 'Return Request',
    description: 'Handle product returns and exchanges',
    category: 'E-commerce',
    defaultTitle: 'Return Request',
    defaultDescription: 'Need to return or exchange an item? Fill out this form and we\'ll guide you through the process.',
    fields: [
      {
        type: 'text',
        label: 'Order Number',
        placeholder: 'Your order number',
        required: true
      },
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'text',
        label: 'Product Name',
        placeholder: 'Which product do you want to return?',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Reason for Return',
        required: true,
        options: ['Defective Product', 'Wrong Size', 'Not as Described', 'Changed Mind', 'Damaged in Shipping', 'Other']
      },
      {
        type: 'multiple-choice',
        label: 'Preferred Resolution',
        required: true,
        options: ['Full Refund', 'Exchange for Same Item', 'Exchange for Different Item', 'Store Credit']
      },
      {
        type: 'text',
        label: 'Additional Details',
        placeholder: 'Any other information...',
        required: false
      }
    ]
  },
  {
    id: 'wholesale-inquiry',
    name: 'Wholesale Inquiry',
    description: 'B2B wholesale and bulk order inquiries',
    category: 'E-commerce',
    defaultTitle: 'Wholesale Inquiry',
    defaultDescription: 'Interested in wholesale pricing? Let us know your requirements and we\'ll get back to you.',
    fields: [
      {
        type: 'text',
        label: 'Company Name',
        placeholder: 'Your business name',
        required: true
      },
      {
        type: 'text',
        label: 'Contact Person',
        placeholder: 'Your name',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
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
        label: 'Business Address',
        placeholder: 'Your business address',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Business Type',
        required: true,
        options: ['Retailer', 'Distributor', 'Reseller', 'Online Store', 'Other']
      },
      {
        type: 'text',
        label: 'Products of Interest',
        placeholder: 'Which products are you interested in?',
        required: true
      },
      {
        type: 'text',
        label: 'Expected Monthly Volume',
        placeholder: 'Estimated monthly order quantity',
        required: false
      }
    ]
  },

  // Education (3 templates)
  {
    id: 'course-enrollment',
    name: 'Course Enrollment',
    description: 'Student enrollment form for courses and programs',
    category: 'Education',
    defaultTitle: 'Course Enrollment',
    defaultDescription: 'Enroll in our course today. Fill out this form to secure your spot.',
    fields: [
      {
        type: 'text',
        label: 'Student Name',
        placeholder: 'Enter your full name',
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
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Course Selection',
        required: true,
        options: ['Web Development', 'Data Science', 'Digital Marketing', 'Graphic Design', 'Business Analytics']
      },
      {
        type: 'multiple-choice',
        label: 'Experience Level',
        required: true,
        options: ['Complete Beginner', 'Some Experience', 'Intermediate', 'Advanced']
      },
      {
        type: 'text',
        label: 'Goals and Expectations',
        placeholder: 'What do you hope to achieve?',
        required: false
      }
    ]
  },
  {
    id: 'student-information',
    name: 'Student Information',
    description: 'Collect comprehensive student information for enrollment',
    category: 'Education',
    defaultTitle: 'Student Information Form',
    defaultDescription: 'Please provide your information for our records and to customize your learning experience.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Date of Birth',
        placeholder: 'MM/DD/YYYY',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
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
        label: 'Address',
        placeholder: 'Your full address',
        required: true
      },
      {
        type: 'text',
        label: 'Emergency Contact',
        placeholder: 'Name and phone number',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Education Level',
        required: true,
        options: ['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other']
      }
    ]
  },
  {
    id: 'parent-teacher-meeting',
    name: 'Parent-Teacher Meeting',
    description: 'Schedule meetings between parents and teachers',
    category: 'Education',
    defaultTitle: 'Schedule Parent-Teacher Meeting',
    defaultDescription: 'We\'d like to schedule a meeting to discuss your child\'s progress. Please select your preferred time.',
    fields: [
      {
        type: 'text',
        label: 'Parent/Guardian Name',
        placeholder: 'Enter your name',
        required: true
      },
      {
        type: 'text',
        label: 'Student Name',
        placeholder: 'Your child\'s name',
        required: true
      },
      {
        type: 'text',
        label: 'Grade/Class',
        placeholder: 'Student\'s grade or class',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
        required: true
      },
      {
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Preferred Meeting Format',
        required: true,
        options: ['In-person', 'Video call', 'Phone call']
      },
      {
        type: 'multiple-choice',
        label: 'Preferred Time',
        required: true,
        options: ['Morning (8-11 AM)', 'Afternoon (12-3 PM)', 'Evening (4-7 PM)']
      }
    ]
  },

  // Healthcare (3 templates)
  {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    description: 'Book medical or consultation appointments',
    category: 'Healthcare',
    defaultTitle: 'Book an Appointment',
    defaultDescription: 'Schedule your appointment with us. We\'ll confirm your booking and send you the details.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Date of Birth',
        placeholder: 'MM/DD/YYYY',
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
        label: 'Email',
        placeholder: 'your.email@example.com',
        required: false
      },
      {
        type: 'multiple-choice',
        label: 'Appointment Type',
        required: true,
        options: ['General Consultation', 'Follow-up Visit', 'Specialist Consultation', 'Routine Check-up', 'Emergency']
      },
      {
        type: 'multiple-choice',
        label: 'Preferred Time',
        required: true,
        options: ['Morning (8-12 AM)', 'Afternoon (12-5 PM)', 'Evening (5-8 PM)']
      },
      {
        type: 'text',
        label: 'Reason for Visit',
        placeholder: 'Brief description of your concern...',
        required: false
      }
    ]
  },
  {
    id: 'patient-information',
    name: 'Patient Information',
    description: 'Collect patient details for medical records',
    category: 'Healthcare',
    defaultTitle: 'Patient Information Form',
    defaultDescription: 'Please provide your information for our medical records and to ensure proper care.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Date of Birth',
        placeholder: 'MM/DD/YYYY',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Gender',
        required: true,
        options: ['Male', 'Female', 'Other', 'Prefer not to say']
      },
      {
        type: 'text',
        label: 'Address',
        placeholder: 'Your full address',
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
        label: 'Emergency Contact',
        placeholder: 'Name and phone number',
        required: true
      },
      {
        type: 'text',
        label: 'Current Medications',
        placeholder: 'List any medications you\'re taking...',
        required: false
      },
      {
        type: 'text',
        label: 'Allergies',
        placeholder: 'List any known allergies...',
        required: false
      }
    ]
  },
  {
    id: 'health-survey',
    name: 'Health Survey',
    description: 'General health assessment and wellness survey',
    category: 'Healthcare',
    defaultTitle: 'Health & Wellness Survey',
    defaultDescription: 'Help us understand your health needs better with this quick assessment.',
    fields: [
      {
        type: 'text',
        label: 'Age',
        placeholder: 'Your age',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Overall Health',
        required: true,
        options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
      },
      {
        type: 'multiple-choice',
        label: 'Exercise Frequency',
        required: true,
        options: ['Daily', '3-5 times/week', '1-2 times/week', 'Rarely', 'Never']
      },
      {
        type: 'multiple-choice',
        label: 'Stress Level',
        required: true,
        options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
      },
      {
        type: 'multiple-choice',
        label: 'Sleep Quality',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']
      },
      {
        type: 'text',
        label: 'Health Goals',
        placeholder: 'What are your main health goals?',
        required: false
      }
    ]
  },

  // Real Estate (3 templates)
  {
    id: 'property-inquiry',
    name: 'Property Inquiry',
    description: 'Inquire about properties for sale or rent',
    category: 'Real Estate',
    defaultTitle: 'Property Inquiry',
    defaultDescription: 'Interested in this property? Fill out this form and we\'ll get back to you with more details.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
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
        label: 'Property Address',
        placeholder: 'Which property are you interested in?',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Interest Type',
        required: true,
        options: ['Buying', 'Renting', 'Just Looking', 'Investment']
      },
      {
        type: 'multiple-choice',
        label: 'Timeline',
        required: true,
        options: ['ASAP', 'Within 1 month', '1-3 months', '3-6 months', '6+ months']
      },
      {
        type: 'text',
        label: 'Additional Questions',
        placeholder: 'Any specific questions about the property?',
        required: false
      }
    ]
  },
  {
    id: 'viewing-request',
    name: 'Property Viewing',
    description: 'Schedule property viewings and tours',
    category: 'Real Estate',
    defaultTitle: 'Schedule Property Viewing',
    defaultDescription: 'Want to see this property in person? Schedule a viewing at your convenience.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
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
        label: 'Property Address',
        placeholder: 'Which property would you like to view?',
        required: true
      },
      {
        type: 'multiple-choice',
        label: 'Preferred Day',
        required: true,
        options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      {
        type: 'multiple-choice',
        label: 'Preferred Time',
        required: true,
        options: ['Morning (9-12 AM)', 'Afternoon (12-5 PM)', 'Evening (5-8 PM)']
      },
      {
        type: 'text',
        label: 'Number of People',
        placeholder: 'How many people will attend?',
        required: false
      }
    ]
  },
  {
    id: 'rental-application',
    name: 'Rental Application',
    description: 'Apply for rental properties',
    category: 'Real Estate',
    defaultTitle: 'Rental Application',
    defaultDescription: 'Apply for this rental property. Please provide accurate information for a faster approval process.',
    fields: [
      {
        type: 'text',
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        type: 'text',
        label: 'Date of Birth',
        placeholder: 'MM/DD/YYYY',
        required: true
      },
      {
        type: 'text',
        label: 'Email',
        placeholder: 'your.email@example.com',
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
        label: 'Current Address',
        placeholder: 'Your current address',
        required: true
      },
      {
        type: 'text',
        label: 'Employment',
        placeholder: 'Your employer and position',
        required: true
      },
      {
        type: 'text',
        label: 'Monthly Income',
        placeholder: 'Your monthly income',
        required: true
      },
      {
        type: 'text',
        label: 'Desired Move-in Date',
        placeholder: 'MM/DD/YYYY',
        required: true
      },
      {
        type: 'text',
        label: 'Number of Occupants',
        placeholder: 'How many people will live here?',
        required: true
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