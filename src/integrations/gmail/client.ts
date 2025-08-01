// Gmail API client for sending email invitations
const GMAIL_API_KEY = import.meta.env.VITE_GMAIL_API_KEY;
const GMAIL_CLIENT_ID = import.meta.env.VITE_GMAIL_CLIENT_ID;
const GMAIL_CLIENT_SECRET = import.meta.env.VITE_GMAIL_CLIENT_SECRET;

export interface EmailInvitation {
  to: string;
  projectTitle: string;
  projectId: string;
  invitationToken: string;
  inviterName: string;
  inviterEmail: string;
}

export class GmailClient {
  private accessToken: string | null = null;

  constructor() {
    if (!GMAIL_API_KEY || !GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET) {
      console.warn('Gmail API credentials not found. Please set VITE_GMAIL_API_KEY, VITE_GMAIL_CLIENT_ID, and VITE_GMAIL_CLIENT_SECRET in your environment variables.');
    }
  }

  async sendInvitationEmail(invitation: EmailInvitation): Promise<boolean> {
    try {
      // For now, we'll use a simple email service or mock implementation
      // In production, you'd integrate with Gmail API or a service like SendGrid
      
      const acceptUrl = `${window.location.origin}/accept-invitation?token=${invitation.invitationToken}&project=${invitation.projectId}`;
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You've been invited to join a project!</h2>
          
          <p><strong>${invitation.inviterName}</strong> (${invitation.inviterEmail}) has invited you to collaborate on:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #2563eb;">${invitation.projectTitle}</h3>
          </div>
          
          <p>Click the button below to accept the invitation and join the project:</p>
          
          <a href="${acceptUrl}" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Accept Invitation
          </a>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${acceptUrl}">${acceptUrl}</a>
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">
            This invitation was sent from Nexus Collab Spark. If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
      `;

      // For development, we'll log the email content
      console.log('Email invitation would be sent:', {
        to: invitation.to,
        subject: `Invitation to join: ${invitation.projectTitle}`,
        content: emailContent,
        acceptUrl
      });

      // In production, you would send the actual email here
      // For now, return true to simulate success
      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      return false;
    }
  }

  async authenticate(): Promise<boolean> {
    // Gmail API authentication would go here
    // For now, return true to simulate authentication
    return true;
  }
}

export const gmailClient = new GmailClient(); 