# Team Management Guide

## How to Add Team Members to Your Project

### For Project Owners:

1. **Navigate to your project** - Go to your dashboard and click on any project you own
2. **Click the "Team" button** - You'll see a "Team" button in the project header
3. **Invite by email** - Enter the email address of the person you want to invite
4. **Send invitation** - Click "Invite" to add them to the project

### Important Notes:

- **Users must sign up first** - The person you're inviting must have already created an account on Nexus
- **Email must match** - The email address must exactly match their registered email
- **Only owners can invite** - Only the project owner can add or remove team members
- **Immediate access** - Once invited, team members can immediately access the project

### For Team Members:

1. **Check your dashboard** - After being invited, the project will appear in your dashboard
2. **Access project** - Click on the project to view tasks and collaborate
3. **View team** - Click the "Team" button to see all project members

### Managing Team Members:

- **Remove members** - Project owners can remove team members using the "Team" dialog
- **View member info** - See when each member joined and their contact information
- **Role indicators** - Clear badges show who is the owner and who is a member

### Security Features:

- **Row Level Security** - Database policies ensure users can only access projects they're members of
- **Owner-only management** - Only project owners can modify team composition
- **Audit trail** - All team changes are logged with timestamps

## Troubleshooting

### "User not found" error:
- Make sure the person has signed up for Nexus first
- Verify the email address is correct
- Check for typos in the email address

### Can't see the Team button:
- Only project owners see the Team management button
- Make sure you're the owner of the project

### Can't access a project:
- Contact the project owner to be added as a team member
- Make sure you're logged in with the correct account

## Database Migration

If you're setting up a new instance, run the following migration to enable team management:

```sql
-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN email TEXT;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
``` 