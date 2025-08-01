import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, Users } from 'lucide-react';
import { Logo } from '@/components/Logo';

interface InvitationData {
  id: string;
  project_id: string;
  email: string;
  status: string;
  project: {
    title: string;
    description: string;
  };
  inviter: {
    full_name: string;
    email: string;
  };
}

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');
  const projectId = searchParams.get('project');

  useEffect(() => {
    if (token && projectId) {
      fetchInvitation();
    } else {
      setError('Invalid invitation link');
      setLoading(false);
    }
  }, [token, projectId]);

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          id,
          project_id,
          email,
          status,
          projects (
            title,
            description
          ),
          profiles!invitations_invited_by_fkey (
            full_name,
            email
          )
        `)
        .eq('token', token)
        .eq('project_id', projectId)
        .eq('status', 'pending')
        .single();

      if (error) {
        setError('Invitation not found or already used');
        return;
      }

      setInvitation(data);
    } catch (error) {
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!user || !invitation) return;

    setProcessing(true);
    try {
      // Check if user's email matches invitation email
      if (user.email !== invitation.email) {
        setError('This invitation was sent to a different email address');
        return;
      }

      // Get user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        setError('Failed to load user profile');
        return;
      }

      // Add user to project
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: invitation.project_id,
          user_id: profile.id,
        });

      if (memberError) {
        setError('Failed to join project');
        return;
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Failed to update invitation status:', updateError);
      }

      toast({
        title: "Success!",
        description: `You've successfully joined "${invitation.project.title}"`,
      });

      // Redirect to the project
      navigate(`/project/${invitation.project_id}`);
    } catch (error) {
      setError('Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">This invitation link is invalid or has expired.</p>
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Logo />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Project Invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                <strong>{invitation.inviter.full_name || invitation.inviter.email}</strong> has invited you to join:
              </p>
              
              <div className="bg-muted rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-foreground">{invitation.project.title}</h3>
                {invitation.project.description && (
                  <p className="text-muted-foreground mt-2">{invitation.project.description}</p>
                )}
              </div>

              {!user ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You need to sign in to accept this invitation.
                  </p>
                  <Button onClick={() => navigate('/auth')} className="w-full">
                    Sign In to Accept
                  </Button>
                </div>
              ) : user.email !== invitation.email ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    This invitation was sent to <strong>{invitation.email}</strong>, but you're signed in as <strong>{user.email}</strong>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please sign in with the correct email address to accept this invitation.
                  </p>
                  <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
                    Sign In with Different Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Click the button below to accept this invitation and join the project.
                  </p>
                  <Button 
                    onClick={acceptInvitation} 
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Invitation
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvitation; 