# Gmail API Quick Reference

## 🔑 Required Credentials

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_GMAIL_API_KEY` | API Key for Gmail API | Google Cloud Console → Credentials → API Key |
| `VITE_GMAIL_CLIENT_ID` | OAuth 2.0 Client ID | Google Cloud Console → Credentials → OAuth 2.0 Client IDs |
| `VITE_GMAIL_CLIENT_SECRET` | OAuth 2.0 Client Secret | Google Cloud Console → Credentials → OAuth 2.0 Client IDs |

## 🚀 Quick Setup (5 minutes)

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Enable Gmail API**
   - APIs & Services → Library → Search "Gmail API" → Enable

3. **Create Credentials**
   - APIs & Services → Credentials → Create Credentials
   - Create both API Key and OAuth 2.0 Client ID

4. **Update .env file**
   ```env
   VITE_GMAIL_API_KEY=your_api_key_here
   VITE_GMAIL_CLIENT_ID=your_client_id_here
   VITE_GMAIL_CLIENT_SECRET=your_client_secret_here
   ```

5. **Test**
   - Restart dev server
   - Try inviting someone to a project
   - Check console for email content

## 🔧 OAuth Consent Screen Setup

**Required Scopes:**
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/userinfo.email`

**Authorized Redirect URIs:**
- `http://localhost:8081/auth/callback`
- `http://localhost:3000/auth/callback`

## 🧪 Testing

**Development Mode:**
- Emails are logged to browser console
- No actual emails sent (for safety)

**Production Mode:**
- Real emails sent via Gmail API
- Requires proper OAuth consent screen setup

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Access denied" | Check OAuth consent screen configuration |
| "Invalid credentials" | Verify API key and client credentials |
| "Quota exceeded" | Gmail API has daily limits |
| "Redirect URI mismatch" | Add correct redirect URIs |

## 📞 Support

- **Google Cloud Console**: https://console.cloud.google.com/
- **Gmail API Docs**: https://developers.google.com/gmail/api
- **OAuth 2.0 Guide**: https://developers.google.com/identity/protocols/oauth2 