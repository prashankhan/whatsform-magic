import { FormBranding } from '@/lib/whatsapp';

export const generateBrandingStyles = (branding: FormBranding): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Page background
  if (branding.pageBackgroundColor) {
    styles.backgroundColor = branding.pageBackgroundColor;
  } else if (branding.backgroundColor) {
    // Fallback to legacy color
    styles.backgroundColor = branding.backgroundColor;
  }
  
  // Background image
  if (branding.backgroundImage) {
    styles.backgroundImage = `url(${branding.backgroundImage})`;
    styles.backgroundSize = 'cover';
    styles.backgroundPosition = 'center';
    styles.backgroundRepeat = 'no-repeat';
  }
  
  return styles;
};

export const generateFormCardStyles = (branding: FormBranding): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  if (branding.formBackgroundColor) {
    styles.backgroundColor = branding.formBackgroundColor;
  }
  
  return styles;
};

export const generateButtonStyles = (branding: FormBranding): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  // Button color
  if (branding.buttonColor) {
    styles.backgroundColor = branding.buttonColor;
    styles.borderColor = branding.buttonColor;
  } else if (branding.primaryColor) {
    // Fallback to legacy color
    styles.backgroundColor = branding.primaryColor;
    styles.borderColor = branding.primaryColor;
  }
  
  // Button text color
  if (branding.buttonTextColor) {
    styles.color = branding.buttonTextColor;
  }
  
  // Button border radius
  if (branding.buttonBorderRadius !== undefined) {
    styles.borderRadius = `${branding.buttonBorderRadius}px`;
  }
  
  return styles;
};

export const generateTextStyles = (branding: FormBranding, type: 'title' | 'description' | 'fieldLabel' | 'footerText'): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  switch (type) {
    case 'title':
      if (branding.titleColor) {
        styles.color = branding.titleColor;
      }
      break;
    case 'description':
      if (branding.descriptionColor) {
        styles.color = branding.descriptionColor;
      }
      break;
    case 'fieldLabel':
      if (branding.fieldLabelColor) {
        styles.color = branding.fieldLabelColor;
      }
      break;
    case 'footerText':
      if (branding.footerTextColor) {
        styles.color = branding.footerTextColor;
      }
      break;
  }
  
  return styles;
};

export const generateFieldStyles = (branding: FormBranding): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  if (branding.fieldBorderColor) {
    styles.borderColor = branding.fieldBorderColor;
  }
  
  return styles;
};

export const generateLinkStyles = (branding: FormBranding, type: 'general' | 'footer'): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  
  if (type === 'general' && branding.linkColor) {
    styles.color = branding.linkColor;
  } else if (type === 'footer' && branding.footerLinkColor) {
    styles.color = branding.footerLinkColor;
  } else if (branding.primaryColor) {
    // Fallback to legacy color
    styles.color = branding.primaryColor;
  }
  
  return styles;
};

export const generateCSSVariables = (branding: FormBranding): React.CSSProperties => {
  const cssVars: React.CSSProperties = {};
  
  // Set CSS custom properties for placeholder text and other dynamic styles
  if (branding.placeholderTextColor) {
    cssVars['--placeholder-color' as any] = branding.placeholderTextColor;
  }
  
  if (branding.fieldBorderColor) {
    cssVars['--field-border-color' as any] = branding.fieldBorderColor;
  }
  
  if (branding.fieldFocusColor) {
    cssVars['--field-focus-color' as any] = branding.fieldFocusColor;
  }
  
  // Form Controls
  if (branding.checkboxColor) {
    cssVars['--checkbox-color' as any] = branding.checkboxColor;
  }
  
  if (branding.checkboxBorderColor) {
    cssVars['--checkbox-border-color' as any] = branding.checkboxBorderColor;
  }
  
  if (branding.radioButtonColor) {
    cssVars['--radio-color' as any] = branding.radioButtonColor;
  }
  
  if (branding.radioButtonBorderColor) {
    cssVars['--radio-border-color' as any] = branding.radioButtonBorderColor;
  }
  
  // File Upload
  if (branding.fileUploadBorderColor) {
    cssVars['--file-upload-border-color' as any] = branding.fileUploadBorderColor;
  }
  
  if (branding.fileUploadBackgroundColor) {
    cssVars['--file-upload-background-color' as any] = branding.fileUploadBackgroundColor;
  }
  
  if (branding.fileUploadPlaceholderTextColor) {
    cssVars['--file-upload-placeholder-color' as any] = branding.fileUploadPlaceholderTextColor;
  }
  
  return cssVars;
};