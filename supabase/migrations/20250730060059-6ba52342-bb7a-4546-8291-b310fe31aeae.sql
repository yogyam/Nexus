-- Create enum for task status
CREATE TYPE task_status AS ENUM ('To Do', 'In Progress', 'Done');

-- Create profiles table for public user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  rubric_url TEXT,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_members junction table
CREATE TABLE public.project_members (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'To Do',
  due_date DATE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view projects they are members of" 
ON public.projects FOR SELECT 
USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    JOIN public.profiles p ON pm.user_id = p.id 
    WHERE pm.project_id = projects.id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can update projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete projects" 
ON public.projects FOR DELETE 
USING (auth.uid() = owner_id);

-- Create RLS policies for project_members
CREATE POLICY "Users can view project members for their projects" 
ON public.project_members FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = user_id AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = project_id AND proj.owner_id = auth.uid()
  )
);

CREATE POLICY "Project owners can manage members" 
ON public.project_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = project_id AND proj.owner_id = auth.uid()
  )
);

-- Create RLS policies for tasks
CREATE POLICY "Users can view tasks for their projects" 
ON public.tasks FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    JOIN public.profiles p ON pm.user_id = p.id 
    WHERE pm.project_id = tasks.project_id AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = tasks.project_id AND proj.owner_id = auth.uid()
  )
);

CREATE POLICY "Project members can create tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    JOIN public.profiles p ON pm.user_id = p.id 
    WHERE pm.project_id = tasks.project_id AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = tasks.project_id AND proj.owner_id = auth.uid()
  )
);

CREATE POLICY "Project members can update tasks" 
ON public.tasks FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    JOIN public.profiles p ON pm.user_id = p.id 
    WHERE pm.project_id = tasks.project_id AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = tasks.project_id AND proj.owner_id = auth.uid()
  )
);

CREATE POLICY "Project members can delete tasks" 
ON public.tasks FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm 
    JOIN public.profiles p ON pm.user_id = p.id 
    WHERE pm.project_id = tasks.project_id AND p.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.projects proj 
    WHERE proj.id = tasks.project_id AND proj.owner_id = auth.uid()
  )
);

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for rubrics
INSERT INTO storage.buckets (id, name, public) VALUES ('rubrics', 'rubrics', false);

-- Create storage policies for rubrics
CREATE POLICY "Users can view rubrics for their projects" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'rubrics' AND
  EXISTS (
    SELECT 1 FROM public.projects p 
    WHERE p.rubric_url = name AND (
      p.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.project_members pm 
        JOIN public.profiles prof ON pm.user_id = prof.id 
        WHERE pm.project_id = p.id AND prof.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Project owners can upload rubrics" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'rubrics');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();