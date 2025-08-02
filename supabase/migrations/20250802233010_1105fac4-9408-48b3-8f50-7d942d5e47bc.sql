-- Add branding column to forms table
ALTER TABLE public.forms 
ADD COLUMN branding JSONB DEFAULT '{
  "coverImage": null,
  "logo": null,
  "primaryColor": "#3b82f6",
  "backgroundColor": "#ffffff",
  "backgroundImage": null,
  "removePoweredBy": false,
  "customFavicon": null,
  "footerText": null,
  "footerLinks": []
}'::jsonb;