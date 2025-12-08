import { Router } from 'express';
import { google } from 'googleapis';

const router = Router();

// Google OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
);

// Scopes required for Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// In-memory token storage (in production, use database)
const tokenStore = new Map();

// GET /api/auth/google - Start OAuth flow
router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  res.json({
    success: true,
    authUrl: authUrl
  });
});

// GET /api/auth/google/callback - Handle OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code is required'
    });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Store tokens with user email as key
    const userEmail = userInfo.data.email;
    tokenStore.set(userEmail, {
      tokens,
      userInfo: userInfo.data
    });

    // Redirect to frontend with success
    res.redirect(`http://localhost:5173/account-settings?auth=success&email=${encodeURIComponent(userEmail)}`);
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.redirect('http://localhost:5173/account-settings?auth=error');
  }
});

// GET /api/auth/status - Check if user is authenticated
router.get('/status', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.json({
      success: true,
      authenticated: false
    });
  }

  const userData = tokenStore.get(email);

  res.json({
    success: true,
    authenticated: !!userData,
    user: userData ? userData.userInfo : null
  });
});

// POST /api/auth/logout - Clear user tokens
router.post('/logout', (req, res) => {
  const { email } = req.body;

  if (email) {
    tokenStore.delete(email);
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Helper function to get authenticated client for a user
export function getAuthenticatedClient(email) {
  const userData = tokenStore.get(email);

  if (!userData) {
    return null;
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
  );

  client.setCredentials(userData.tokens);
  return client;
}

export { tokenStore };
export default router;
