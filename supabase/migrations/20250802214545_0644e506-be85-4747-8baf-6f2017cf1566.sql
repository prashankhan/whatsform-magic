-- Add Airtable integration fields to forms table
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS airtable_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS airtable_base_id text,
ADD COLUMN IF NOT EXISTS airtable_table_name text,
ADD COLUMN IF NOT EXISTS airtable_api_key text;