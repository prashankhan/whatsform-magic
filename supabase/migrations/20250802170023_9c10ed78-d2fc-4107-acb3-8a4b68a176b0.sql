-- Add Google Sheets API key field to forms table
ALTER TABLE public.forms 
ADD COLUMN google_sheets_api_key TEXT;