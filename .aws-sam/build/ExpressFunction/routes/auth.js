import { Router } from 'express';
import { google } from 'googleapis';
import {
  docClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
  UpdateCommand,
  TABLES
} from '../db/dynamodb.js';

// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "GoogleAPI";

const client = new SecretsManagerClient({
  region: "us-west-2",
});

let response;

try {
  response = await client.send(
    new GetSecretValueCommand({
      SecretId: secret_name,
      VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
    })
  );
} catch (error) {
  // For a list of exceptions thrown, see
  // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
  throw error;
}

const secret = response.SecretString;


const router = Router();

// Google OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  secret.GOOGLE_CLIENT_ID,
  secret.GOOGLE_CLIENT_SECRET,
  secret.GOOGLE_REDIRECT_URI ||
    "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com/api/auth/google/callback"
);
console.log(secret.GOOGLE_CLIENT_ID, secret.GOOGLE_CLIENT_SECRET, secret.GOOGLE_REDIRECT_URI);
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

    // Sync any anonymous events to Google Calendar
    // This runs in the background - we don't wait for it to complete
    syncAnonymousEventsToGoogle(userEmail, oauth2Client)
      .then(result => {
        if (result.synced > 0) {
          console.log(`Auto-synced ${result.synced} anonymous events to Google Calendar for ${userEmail}`);
        }
      })
      .catch(err => console.error('Background sync error:', err));

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
    secret.GOOGLE_CLIENT_ID,
    secret.GOOGLE_CLIENT_SECRET,
    secret.GOOGLE_REDIRECT_URI || 'https://guno6rd8a7.execute-api.us-west-2.amazonaws.com/api/auth/google/callback'
  );

  client.setCredentials(userData.tokens);
  return client;
}

// Sync anonymous events to Google Calendar when user connects
async function syncAnonymousEventsToGoogle(userEmail, authClient) {
  try {
    // Find all anonymous events (created before user connected to Google)
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.EVENTS,
      FilterExpression: 'user_email = :anon AND attribute_not_exists(google_event_id)',
      ExpressionAttributeValues: {
        ':anon': 'anonymous'
      }
    }));

    const anonymousEvents = result.Items || [];
    console.log(`Found ${anonymousEvents.length} anonymous events to sync to Google Calendar`);

    if (anonymousEvents.length === 0) {
      return { synced: 0 };
    }

    const calendar = google.calendar({ version: 'v3', auth: authClient });
    let syncedCount = 0;

    for (const event of anonymousEvents) {
      try {
        // Create event in Google Calendar
        const googleEvent = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: event.title,
            description: event.description || '',
            location: event.location || '',
            start: {
              dateTime: event.start_datetime,
              timeZone: 'UTC'
            },
            end: {
              dateTime: event.end_datetime,
              timeZone: 'UTC'
            }
          }
        });

        // Update local event with google_event_id and user_email
        await docClient.send(new UpdateCommand({
          TableName: TABLES.EVENTS,
          Key: { id: event.id },
          UpdateExpression: 'SET google_event_id = :gid, user_email = :email, updated_at = :updated',
          ExpressionAttributeValues: {
            ':gid': googleEvent.data.id,
            ':email': userEmail,
            ':updated': new Date().toISOString()
          }
        }));

        syncedCount++;
        console.log(`Synced event "${event.title}" to Google Calendar`);
      } catch (eventError) {
        console.error(`Failed to sync event "${event.title}":`, eventError.message);
      }
    }

    return { synced: syncedCount, total: anonymousEvents.length };
  } catch (error) {
    console.error('Error syncing anonymous events:', error);
    return { synced: 0, error: error.message };
  }
}

export default router;
