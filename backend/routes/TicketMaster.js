import { Router } from 'express';
import axios from 'axios';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const router = Router();

// AWS Secrets Manager configuration
const TICKETMASTER_SECRET_NAME = "TicketMaster_API";
const AWS_REGION = "us-west-2";

async function getTicketMasterCredentials() {
  try {
    const client = new SecretsManagerClient({
      region: AWS_REGION,
    });

    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: TICKETMASTER_SECRET_NAME,
        VersionStage: "AWSCURRENT",
      })
    );

    const secret = JSON.parse(response.SecretString);

    return {
      apiKey: secret.Consumer_Key,
    };
  } catch (error) {
    console.warn(
      "Failed to retrieve TicketMaster credentials from AWS Secrets Manager:",
      error.message
    );

    // Fallback to environment variables for local development
    const envApiKey = process.env.Consumer_Key;

    if (envApiKey) {
      console.log("Using Consumer_Key from environment variable");
      return {
        apiKey: envApiKey,
      };
    }

    throw new Error("TicketMaster API credentials not available");
  }
}

// Cache the credentials to avoid repeated AWS calls
let cachedCredentials = null;
let credentialsPromise = null;

async function getCachedTicketMasterCredentials() {
  if (cachedCredentials) {
    return cachedCredentials;
  }

  if (!credentialsPromise) {
    credentialsPromise = getTicketMasterCredentials();
  }

  cachedCredentials = await credentialsPromise;
  return cachedCredentials;
}

// GET /api/TicketMaster/search - Search for events
router.get("/search", async (req, res) => {
  const {
    keyword,
    city,
    stateCode,
    countryCode,
    postalCode,
    latlong,
    radius,
    unit = "miles",
    startDateTime,
    endDateTime,
    size = 20,
    sort = "date,asc",
    classificationName,
  } = req.query;

  try {
    const { apiKey } = await getCachedTicketMasterCredentials();

    const params = {
      apikey: apiKey,
      keyword,
      city,
      stateCode,
      countryCode,
      postalCode,
      latlong,
      radius,
      unit,
      startDateTime,
      endDateTime,
      size: Math.min(parseInt(size) || 20, 200),
      sort,
      classificationName,
    };

    // Remove undefined params
    Object.keys(params).forEach(
      (key) => params[key] === undefined && delete params[key]
    );

    const response = await axios.get(
      "https://app.ticketmaster.com/discovery/v2/events.json",
      { params }
    );

    const events = response.data._embedded?.events || [];

    res.json({
      success: true,
      events: events,
      total: response.data.page?.totalElements || 0,
      page: response.data.page,
    });
  } catch (error) {
    console.error("Error searching TicketMaster events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search events",
    });
  }
});

// GET /api/TicketMaster/event/:id - Get detailed event info
router.get("/event/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { apiKey } = await getCachedTicketMasterCredentials();

    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events/${id}.json`,
      {
        params: { apikey: apiKey },
      }
    );

    res.json({
      success: true,
      event: response.data,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event details",
    });
  }
});

export default router;
