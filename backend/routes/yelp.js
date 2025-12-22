import { Router } from 'express';
import axios from 'axios';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const router = Router();

// AWS Secrets Manager configuration
const YELP_SECRET_NAME = "YelpAPI"; // The name of the secret in AWS Secrets Manager
const AWS_REGION = "us-west-2";

/**
 * Retrieves the Yelp API credentials from AWS Secrets Manager
 * Falls back to environment variables for local development
 * @returns {Promise<Object>} Object containing YELP_API_KEY and YELP_CLIENT_ID
 */
// async function getYelpCredentials() {
//   try {
//     // Try to get the secret from AWS Secrets Manager first
//     const client = new SecretsManagerClient({
//       region: AWS_REGION,
//     });

//     const response = await client.send(
//       new GetSecretValueCommand({
//         SecretId: YELP_SECRET_NAME,
//         VersionStage: "AWSCURRENT",
//       })
//     );

//     // Parse the secret string as JSON
//     const secret = JSON.parse(response.SecretString);

//     // Return the credentials from the secret
//     return {
//       apiKey: secret.YELP_API_KEY,
//       clientId: secret.YELP_CLIENT_ID
//     };
//   } catch (error) {
//     console.warn('Failed to retrieve Yelp credentials from AWS Secrets Manager:', error.message);

//     // Fallback to environment variables for local development
//     // const envApiKey = process.env.YELP_API_KEY;
//     // const envClientId = process.env.YELP_CLIENT_ID;

//     if (envApiKey) {
//       console.log('Using YELP_API_KEY from environment variable');
//       return {
//         apiKey: envApiKey,
//         clientId: envClientId || null
//       };
//     }

//     throw new Error('Yelp API credentials not available from AWS Secrets Manager or environment variables');
//   }
// }

async function getYelpCredentials() {
  try {
    const client = new SecretsManagerClient({
      region: AWS_REGION,
    });

    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: YELP_SECRET_NAME,
        VersionStage: "AWSCURRENT",
      })
    );

    const secret = JSON.parse(response.SecretString);

    return {
      apiKey: secret.YELP_API_KEY,
      clientId: secret.YELP_CLIENT_ID
    };
  } catch (error) {
    console.warn('Failed to retrieve Yelp credentials from AWS Secrets Manager:', error.message);

    // Fallback to environment variables for local development
    const envApiKey = process.env.YELP_API_KEY;
    const envClientId = process.env.YELP_CLIENT_ID;

    if (envApiKey) {
      console.log('Using YELP_API_KEY from environment variable');
      return {
        apiKey: envApiKey,
        clientId: envClientId || null
      };
    }

    throw new Error('Yelp API credentials not available');
  }
}


// Cache the credentials to avoid repeated AWS calls
let cachedCredentials = null;
let credentialsPromise = null;

/**
 * Gets the cached Yelp credentials or fetches them if not available
 * @returns {Promise<Object>} Object containing apiKey and clientId
 */
async function getCachedYelpCredentials() {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  if (!credentialsPromise) {
    credentialsPromise = getYelpCredentials();
  }

  cachedCredentials = await credentialsPromise;
  return cachedCredentials;
}

// GET /api/yelp/search - Search for businesses on Yelp
router.get('/search', async (req, res) => {
  const { term, location, latitude, longitude, radius, categories, limit = 20, sort_by = 'best_match' } = req.query;

  try {
    // Get the API credentials from AWS Secrets Manager or environment
    const { apiKey } = await getCachedYelpCredentials();

    // Require either location or coordinates
    if (!location && (!latitude || !longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Location or coordinates are required'
      });
    }

    const params = {
      term,
      location,
      latitude,
      longitude,
      radius: radius ? parseInt(radius) : undefined, // in meters
      categories,
      limit: Math.min(parseInt(limit) || 20, 50), // Yelp max is 50
      sort_by
    };

    // Remove undefined params
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      params
    });

    res.json({
      success: true,
      businesses: response.data.businesses,
      total: response.data.total,
      region: response.data.region
    });
  } catch (error) {
    console.error('Error searching Yelp businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search businesses'
    });
  }
});

// GET /api/yelp/business/:id - Get detailed business info including reviews
router.get('/business/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Get the API credentials from AWS Secrets Manager or environment
    const { apiKey } = await getCachedYelpCredentials();
    // Get business details
    const businessResponse = await axios.get(`https://api.yelp.com/v3/businesses/${id}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // Get reviews
    const reviewsResponse = await axios.get(`https://api.yelp.com/v3/businesses/${id}/reviews`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      params: { limit: 3 } // Get up to 3 reviews
    });

    res.json({
      success: true,
      business: businessResponse.data,
      reviews: reviewsResponse.data.reviews
    });
  } catch (error) {
    console.error('Error fetching business details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business details'
    });
  }
});

export default router;