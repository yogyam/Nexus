-- Fix infinite recursion in RLS policies for projects table
-- Run this in your Supabase SQL Editor

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;

-- Create simplified, non-recursive policies
CREATE POLICY "Users can view their own projects" 
ON public.projects FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete projects" 
ON public.projects FOR DELETE 
USING (auth.uid() = owner_id);

-- Also fix project_members policies to avoid recursion
DROP POLICY IF EXISTS "Users can view project members for their projects" ON public.project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON public.project_members;

CREATE POLICY "Users can view project members" 
ON public.project_members FOR SELECT 
USING (true);

CREATE POLICY "Project owners can manage members" 
ON public.project_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = project_id AND proj.owner_id = auth.uid()
  )
);

-- Fix tasks policies
DROP POLICY IF EXISTS "Users can view tasks for their projects" ON public.tasks;
DROP POLICY IF EXISTS "Project members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Project members can delete tasks" ON public.tasks;

CREATE POLICY "Users can view tasks for their projects" 
ON public.tasks FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = tasks.project_id AND proj.owner_id = auth.uid()
  )
);

CREATE POLICY "Project owners can manage tasks" 
ON public.tasks FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = tasks.project_id AND proj.owner_id = auth.uid()
  )
); 