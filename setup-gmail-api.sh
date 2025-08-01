#!/bin/bash

echo "🚀 Nexus Collab Spark - Gmail API Setup"
echo "========================================"
echo ""

echo "📋 Prerequisites:"
echo "1. Google account with access to Google Cloud Console"
echo "2. Basic understanding of APIs and OAuth"
echo ""

echo "🔧 Step-by-Step Setup:"
echo ""
echo "1. Go to Google Cloud Console:"
echo "   https://console.cloud.google.com/"
echo ""
echo "2. Create a new project or select existing one"
echo ""
echo "3. Enable Gmail API:"
echo "   - Go to 'APIs & Services' → 'Library'"
echo "   - Search for 'Gmail API'"
echo "   - Click 'Enable'"
echo ""
echo "4. Create OAuth 2.0 credentials:"
echo "   - Go to 'APIs & Services' → 'Credentials'"
echo "   - Click 'Create Credentials' → 'OAuth 2.0 Client IDs'"
echo "   - Select 'Web application'"
echo "   - Add authorized redirect URIs:"
echo "     * http://localhost:8081/auth/callback"
echo "     * http://localhost:3000/auth/callback"
echo "   - Click 'Create'"
echo "   - Save the Client ID and Client Secret"
echo ""
echo "5. Create API Key:"
echo "   - In 'Credentials', click 'Create Credentials' → 'API Key'"
echo "   - Save the API Key"
echo ""
echo "6. Configure OAuth consent screen:"
echo "   - Go to 'APIs & Services' → 'OAuth consent screen'"
echo "   - Choose 'External' user type"
echo "   - Fill in required information"
echo "   - Add scopes:"
echo "     * https://www.googleapis.com/auth/gmail.send"
echo "     * https://www.googleapis.com/auth/userinfo.email"
echo "   - Add test users (your email addresses)"
echo ""
echo "7. Update your .env file with the credentials:"
echo "   VITE_GMAIL_API_KEY=your_api_key_here"
echo "   VITE_GMAIL_CLIENT_ID=your_client_id_here"
echo "   VITE_GMAIL_CLIENT_SECRET=your_client_secret_here"
echo ""
echo "8. Test the setup:"
echo "   - Restart your development server"
echo "   - Try inviting someone to a project"
echo "   - Check browser console for email content"
echo ""

echo "✅ Setup complete! Your Gmail API integration is ready."
echo ""
echo "📚 For detailed instructions, see: GMAIL_API_SETUP.md"
echo "📖 For project design, see: DESIGN.md" 