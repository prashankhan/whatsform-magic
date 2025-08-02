-- Add Google Sheets integration fields to forms table
ALTER TABLE forms 
ADD COLUMN google_sheets_enabled BOOLEAN DEFAULT false,
ADD COLUMN google_sheets_spreadsheet_id TEXT,
ADD COLUMN google_sheets_worksheet_name TEXT DEFAULT 'Sheet1';