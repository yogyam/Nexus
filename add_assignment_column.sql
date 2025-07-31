-- Add assignment_text column to projects table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.projects 
ADD COLUMN assignment_text TEXT;

-- Add comment to explain the new field
COMMENT ON COLUMN public.projects.assignment_text IS 'Text-based assignment content that can be copied and pasted';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'assignment_text'; 