-- Remove Airtable integration fields from forms table
ALTER TABLE public.forms 
DROP COLUMN IF EXISTS airtable_enabled,
DROP COLUMN IF EXISTS airtable_base_id,
DROP COLUMN IF EXISTS airtable_table_name,
DROP COLUMN IF EXISTS airtable_api_key,
DROP COLUMN IF EXISTS google_sheets_enabled,
DROP COLUMN IF EXISTS google_sheets_spreadsheet_id,
DROP COLUMN IF EXISTS google_sheets_worksheet_name,
DROP COLUMN IF EXISTS google_sheets_api_key;