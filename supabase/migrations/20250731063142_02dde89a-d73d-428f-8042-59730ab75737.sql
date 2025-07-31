-- Fix the recursive RLS policy for project_members
DROP POLICY IF EXISTS "Users can view project members for their projects" ON public.project_members;

-- Create a simpler, non-recursive policy
CREATE POLICY "Users can view project members for their projects" 
ON public.project_members 
FOR SELECT 
USING (
  -- Users can see members of projects they own
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  )
  OR
  -- Users can see themselves as members
  project_members.user_id = (
    SELECT user_id FROM profiles WHERE user_id = auth.uid()
  )
);

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can view rubrics for their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload rubrics to their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can update rubrics for their projects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete rubrics for their projects" ON storage.objects;

-- Create storage policies for rubrics bucket
CREATE POLICY "Users can upload rubrics to their projects"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'rubrics' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view rubrics for their projects"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'rubrics' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.owner_id = auth.uid() 
      AND projects.rubric_url LIKE '%' || name || '%'
    )
  )
);

CREATE POLICY "Users can update rubrics for their projects"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'rubrics' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete rubrics for their projects"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'rubrics' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);