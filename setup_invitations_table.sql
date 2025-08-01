-- Run this in your Supabase SQL Editor to create the invitations table

-- Create invitations table for team invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on invitations table
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invitations
DROP POLICY IF EXISTS "Project owners can view invitations" ON public.invitations;
DROP POLICY IF EXISTS "Project owners can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Project owners can update invitations" ON public.invitations;
DROP POLICY IF EXISTS "Project owners can delete invitations" ON public.invitations;

CREATE POLICY "Project owners can view invitations" 
ON public.invitations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = project_id AND proj.owner_id = auth.uid()
  )
);

CREATE POLICY "Project owners can create invitations" 
ON public.invitations FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = project_id AND proj.owner_id = auth.uid()
  )
);

CREATE POLICY "Project owners can update invitations" 
ON public.invitations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = project_id AND proj.owner_id = auth.uid()
  )
);

CREATE POLICY "Project owners can delete invitations" 
ON public.invitations FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = project_id AND proj.owner_id = auth.uid()
  )
);

-- Create function to generate invitation token (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invitations_updated_at ON public.invitations;
CREATE TRIGGER update_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Test the table creation
SELECT 'Invitations table created successfully!' as status; 