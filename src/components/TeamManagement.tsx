import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { gmailClient } from '@/integrations/gmail/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthProvider';
import { Users, UserPlus, UserMinus, Mail, Clock, CheckCircle, XCircle, Send } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  joined_at: string;
}

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
}

interface TeamManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  isOwner: boolean;
}

export const TeamManagement = ({ open, onOpenChange, projectId, projectTitle, isOwner }: TeamManagementProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      fetchTeamMembers();
      fetchInvitations();
    }
  }, [open, projectId]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      // Get project info first
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('owner_id, created_at')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Get all members
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select('user_id, joined_at')
        .eq('project_id', projectId);

      if (membersError) throw membersError;

      // Get owner profile
      const { data: ownerProfile, error: ownerError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email')
        .eq('user_id', projectData.owner_id)
        .single();

      if (ownerError) throw ownerError;

      const allMembers: TeamMember[] = [];
      
      // Add owner
      allMembers.push({
        id: ownerProfile.id,
        user_id: projectData.owner_id,
        full_name: ownerProfile.full_name,
        email: ownerProfile.email || 'Unknown',
        joined_at: projectData.created_at || new Date().toISOString(),
      });

      // Add other members one by one to avoid RLS issues
      if (membersData) {
        for (const member of membersData) {
          try {
            const { data: memberProfile, error: memberProfileError } = await supabase
              .from('profiles')
              .select('id, user_id, full_name, email')
              .eq('id', member.user_id)
              .single();

            if (!memberProfileError && memberProfile) {
              allMembers.push({
                id: memberProfile.id,
                user_id: memberProfile.user_id,
                full_name: memberProfile.full_name,
                email: memberProfile.email || 'Unknown',
                joined_at: member.joined_at,
              });
            }
          } catch (error) {
            console.error('Error fetching member profile:', error);
            // Continue with other members even if one fails
          }
        }
      }

      setMembers(allMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data: invitationsData, error } = await supabase
        .from('invitations')
        .select('id, email, status, created_at, expires_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((invitationsData || []).map(inv => ({
        ...inv,
        status: inv.status as 'pending' | 'accepted' | 'expired'
      })));
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !isOwner) return;

    setInviting(true);
    try {
      // First, check if user already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('email', inviteEmail.trim())
        .single();

      if (!profileError && existingProfile) {
        // User exists - add them directly to the project
        const isAlreadyMember = members.some(member => member.user_id === existingProfile.user_id);
        if (isAlreadyMember) {
          toast({
            title: "Already a member",
            description: "This user is already a member of the project",
            variant: "destructive",
          });
          return;
        }

        // Add user to project
        const { error: addError } = await supabase
          .from('project_members')
          .insert({
            project_id: projectId,
            user_id: existingProfile.id,
          });

        if (addError) throw addError;

        toast({
          title: "Success",
          description: `${inviteEmail} has been added to the project`,
        });

        setInviteEmail('');
        fetchTeamMembers();
        return;
      }

      // User doesn't exist - create an invitation
      const { data: currentUserProfile, error: currentUserError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (currentUserError) throw currentUserError;

      // Check if invitation already exists
      const { data: existingInvitation, error: invitationCheckError } = await supabase
        .from('invitations')
        .select('id')
        .eq('project_id', projectId)
        .eq('email', inviteEmail.trim())
        .eq('status', 'pending')
        .single();

      if (!invitationCheckError && existingInvitation) {
        toast({
          title: "Invitation already sent",
          description: "An invitation has already been sent to this email address",
          variant: "destructive",
        });
        return;
      }

      // Create new invitation
      const { error: invitationError } = await supabase
        .from('invitations')
        .insert({
          project_id: projectId,
          invited_by: currentUserProfile.id,
          email: inviteEmail.trim(),
          token: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });

      if (invitationError) throw invitationError;

      // Get the created invitation to send email
      const { data: newInvitation, error: fetchError } = await supabase
        .from('invitations')
        .select('id, token')
        .eq('project_id', projectId)
        .eq('email', inviteEmail.trim())
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      // Send email invitation
      const emailSent = await gmailClient.sendInvitationEmail({
        to: inviteEmail.trim(),
        projectTitle: projectTitle,
        projectId: projectId,
        invitationToken: newInvitation.token,
        inviterName: user?.user_metadata?.full_name || user?.email || 'Team Member',
        inviterEmail: user?.email || '',
      });

      if (emailSent) {
        toast({
          title: "Invitation sent",
          description: `An email invitation has been sent to ${inviteEmail}. They will receive an email to join the project.`,
        });
      } else {
        toast({
          title: "Invitation created",
          description: `Invitation created for ${inviteEmail}, but email delivery failed. They can still join using the invitation link.`,
          variant: "destructive",
        });
      }

      setInviteEmail('');
      fetchInvitations();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (memberId: string, memberEmail: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${memberEmail} has been removed from the project`,
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const cancelInvitation = async (invitationId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation cancelled",
        description: `Invitation to ${email} has been cancelled`,
      });

      fetchInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const getInvitationStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management: {projectTitle}
          </DialogTitle>
          <DialogDescription>
            Manage team members for this project. Only project owners can invite and remove members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Section */}
          {isOwner && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Invite Team Member</h3>
              <form onSubmit={inviteMember} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="invite-email" className="sr-only">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={inviting || !inviteEmail.trim()}>
                  {inviting ? (
                    "Inviting..."
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </>
                  )}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground">
                If the user is already registered, they'll be added immediately. Otherwise, they'll receive an email invitation.
              </p>
            </div>
          )}

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pending Invitations ({invitations.length})</h3>
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted">
                          {getInitials(invitation.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{invitation.email}</p>
                          <Badge variant="outline" className={getInvitationStatusColor(invitation.status)}>
                            {invitation.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Invited {new Date(invitation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {isOwner && invitation.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel the invitation to {invitation.email}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => cancelInvitation(invitation.id, invitation.email)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Cancel Invitation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Members List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Team Members ({members.length})</h3>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading team members...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(member.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.full_name || member.email}</p>
                          {member.user_id === user?.id && (
                            <Badge variant="secondary">You</Badge>
                          )}
                          {member.user_id === user?.id && isOwner && (
                            <Badge variant="default">Owner</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {isOwner && member.user_id !== user?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {member.full_name || member.email} from the project? 
                              They will lose access to all project data and tasks.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMember(member.id, member.email)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove Member
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 