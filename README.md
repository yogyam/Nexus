# Nexus Collab Spark

A collaborative project management platform built with React, TypeScript, and Supabase.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

## Gemini API Setup

To use the AI task generation feature:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to your `.env` file as `VITE_GEMINI_API_KEY`
3. The AI will automatically break down assignments into tasks based on team size

## Gmail API Setup

To use the email invitation system:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Web application type)
5. Add the credentials to your `.env` file:
   - `VITE_GMAIL_API_KEY`
   - `VITE_GMAIL_CLIENT_ID`
   - `VITE_GMAIL_CLIENT_SECRET`

## Troubleshooting Database Issues

If you're experiencing "Failed to load projects" errors, follow these steps:

### 1. Fix RLS Policies
Run the following SQL in your Supabase SQL Editor:

```sql
-- Drop existing RLS policies for projects table
DROP POLICY IF EXISTS "Users can view projects they are members of" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;

-- Create simpler RLS policies for projects
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
```

### 2. Check Database Connection
The application includes a debug component that will help identify specific database issues. Look for the "Database Connection Test" section when no projects are found.

### 3. Verify Migrations
Make sure all database migrations have been applied:
- `20250730060059-6ba52342-bb7a-4546-8291-b310fe31aeae.sql` - Initial schema
- `20250731063200_add_assignment_text.sql` - Assignment text column
- `20250731063201_add_email_to_profiles.sql` - Email column
- `20250731063202_create_invitations.sql` - Team invitations system

## Team Invitations

The application now supports a complete invitation system:

- **Existing Users**: If the email is already registered, users are added immediately to the project
- **New Users**: If the email isn't registered, an invitation is created and stored in the database
- **Invitation Management**: Project owners can view pending invitations and cancel them if needed
- **Future Email Integration**: The system is ready for email notifications (requires additional setup)

## Database Schema

The application uses the following main tables:
- **profiles** - User profiles with authentication data
- **projects** - Project information and ownership
- **project_members** - Junction table for project membership
- **tasks** - Task management within projects

## Features

- User authentication with Supabase Auth
- Project creation and management
- Task tracking with status updates
- Team collaboration features
- **AI-powered task generation** using Gemini API
- **Email invitations** via Gmail API
- **Assignment editing** - Edit project assignments anytime
- **Task editing** - Edit individual tasks anytime
- **Invitation acceptance** - Click-to-accept email links
- Modern UI with Tailwind CSS and shadcn/ui components
