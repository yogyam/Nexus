# Gmail API Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Nexus Collab Spark")
4. Click "Create"

## Step 2: Enable Gmail API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" → "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Select "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:8081/auth/callback`
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)
5. Click "Create"
6. **Save the Client ID and Client Secret**

## Step 4: Create API Key

1. In "Credentials", click "Create Credentials" → "API Key"
2. **Save the API Key**

## Step 5: Update Environment Variables

Add these to your `.env` file:

```env
VITE_GMAIL_API_KEY=your_api_key_here
VITE_GMAIL_CLIENT_ID=your_client_id_here
VITE_GMAIL_CLIENT_SECRET=your_client_secret_here
```

## Step 6: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "Nexus Collab Spark"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Add test users (your email addresses)

## Step 7: Test the Setup

1. Restart your development server
2. Try inviting someone to a project
3. Check the browser console for email content
4. Verify the invitation link works

## Troubleshooting

### Common Issues:
- **"Access denied"**: Check OAuth consent screen configuration
- **"Invalid credentials"**: Verify API key and client credentials
- **"Quota exceeded"**: Gmail API has daily limits

### Production Setup:
- Use a custom domain
- Add production redirect URIs
- Publish your OAuth consent screen
- Set up proper security headers

## Security Notes

- Never commit API keys to version control
- Use environment variables for all credentials
- Regularly rotate API keys
- Monitor API usage in Google Cloud Console 