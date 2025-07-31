-- Add assignment_text column to projects table
ALTER TABLE public.projects 
ADD COLUMN assignment_text TEXT;

-- Add comment to explain the new field
COMMENT ON COLUMN public.projects.assignment_text IS 'Text-based assignment content that can be copied and pasted'; 