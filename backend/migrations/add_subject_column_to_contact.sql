-- Add subject column to contact_message table if it doesn't exist
USE cooking_app;

-- Check if column exists and add if not
ALTER TABLE contact_message 
ADD COLUMN IF NOT EXISTS subject VARCHAR(190) NOT NULL DEFAULT 'General Inquiry';


