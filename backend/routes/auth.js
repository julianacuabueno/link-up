import { Router } from 'express';
import { google } from 'googleapis';
import {
  docClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  TABLES
} from '../db/dynamodb.js';

const router = Router();

// Google OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI ||
    "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com/api/auth/google/callback"
);

// Scopes required for Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Helper functions for DynamoDB token storage
async function storeTokens(email, tokens, userInfo) {
  await docClient.send(new PutCommand({
    TableName: TABLES.AUTH_TOKENS,
    Item: {
      email,
      tokens,
      userInfo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }));
}

async function getTokens(email) {
  const result = await docClient.send(new GetCommand({
    TableName: TABLES.AUTH_TOKENS,
    Key: { email }
  }));
  return result.Item || null;
}

async function deleteTokens(email) {
  await docClient.send(new DeleteCommand({
    TableName: TABLES.AUTH_TOKENS,
    Key: { email }
  }));
}

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

    // Store tokens in DynamoDB
    const userEmail = userInfo.data.email;
    await storeTokens(userEmail, tokens, userInfo.data);

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/account-settings?auth=success&email=${encodeURIComponent(userEmail)}`);
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/account-settings?auth=error`);
  }
});

// GET /api/auth/status - Check if user is authenticated
router.get('/status', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.json({
      success: true,
      authenticated: false
    });
  }

  try {
    const userData = await getTokens(email);

    res.json({
      success: true,
      authenticated: !!userData,
      user: userData ? userData.userInfo : null
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
    res.json({
      success: true,
      authenticated: false
    });
  }
});

// POST /api/auth/logout - Clear user tokens
router.post('/logout', async (req, res) => {
  const { email } = req.body;

  try {
    if (email) {
      await deleteTokens(email);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

// Helper function to get authenticated client for a user
export async function getAuthenticatedClient(email) {
  const userData = await getTokens(email);

  if (!userData) {
    return null;
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI ||
      "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com/api/auth/google/callback"
  );

  client.setCredentials(userData.tokens);
  return client;
}

export default router;
