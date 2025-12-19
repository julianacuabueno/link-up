import { Router } from 'express';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { getAuthenticatedClient } from './auth.js';
import {
  docClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand,
  TABLES
} from '../db/dynamodb.js';

const router = Router();

// GET /api/calendar/events - Get all events (from DB and optionally sync with Google)
router.get('/events', async (req, res) => {
  const { email, sync } = req.query;

  try {
    // If sync requested and user is authenticated, fetch from Google Calendar
    if (sync === 'true' && email) {
      const authClient = getAuthenticatedClient(email);

      if (authClient) {
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        const response = await calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          maxResults: 50,
          singleEvents: true,
          orderBy: 'startTime'
        });

        const googleEvents = response.data.items || [];

        // Sync Google events to DynamoDB
        for (const event of googleEvents) {
          const startDateTime = event.start.dateTime || event.start.date;
          const endDateTime = event.end.dateTime || event.end.date;

          // Check if event already exists by google_event_id
          const existingResult = await docClient.send(new ScanCommand({
            TableName: TABLES.EVENTS,
            FilterExpression: 'google_event_id = :gid',
            ExpressionAttributeValues: { ':gid': event.id }
          }));

          if (existingResult.Items && existingResult.Items.length > 0) {
            // Update existing event
            const existingEvent = existingResult.Items[0];
            await docClient.send(new UpdateCommand({
              TableName: TABLES.EVENTS,
              Key: { id: existingEvent.id },
              UpdateExpression: 'SET title = :title, description = :desc, #loc = :loc, start_datetime = :start, end_datetime = :end, attendees = :att, updated_at = :updated',
              ExpressionAttributeNames: { '#loc': 'location' },
              ExpressionAttributeValues: {
                ':title': event.summary || 'Untitled Event',
                ':desc': event.description || '',
                ':loc': event.location || '',
                ':start': new Date(startDateTime).toISOString(),
                ':end': new Date(endDateTime).toISOString(),
                ':att': event.attendees?.length || 0,
                ':updated': new Date().toISOString()
              }
            }));
          } else {
            // Insert new event
            await docClient.send(new PutCommand({
              TableName: TABLES.EVENTS,
              Item: {
                id: uuidv4(),
                google_event_id: event.id,
                title: event.summary || 'Untitled Event',
                description: event.description || '',
                location: event.location || '',
                start_datetime: new Date(startDateTime).toISOString(),
                end_datetime: new Date(endDateTime).toISOString(),
                user_email: email,
                attendees: event.attendees?.length || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }));
          }
        }
      }
    }

    // Fetch events from DynamoDB
    let result;
    const now = new Date().toISOString();

    if (email) {
      // Query by user_email using GSI
      result = await docClient.send(new QueryCommand({
        TableName: TABLES.EVENTS,
        IndexName: 'user_email-index',
        KeyConditionExpression: 'user_email = :email',
        FilterExpression: 'start_datetime >= :now',
        ExpressionAttributeValues: {
          ':email': email,
          ':now': now
        }
      }));
    } else {
      // Scan all events (with filter for future events)
      result = await docClient.send(new ScanCommand({
        TableName: TABLES.EVENTS,
        FilterExpression: 'start_datetime >= :now',
        ExpressionAttributeValues: { ':now': now }
      }));
    }

    // Sort by start_datetime
    const events = (result.Items || []).sort((a, b) =>
      new Date(a.start_datetime) - new Date(b.start_datetime)
    );

    res.json({
      success: true,
      data: events,
      message: 'Events retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// POST /api/calendar/events - Create a new event
router.post('/events', async (req, res) => {
  const { title, description, location, date, time, endTime, email } = req.body;

  if (!title || !date || !time) {
    return res.status(400).json({
      success: false,
      message: 'Title, date, and time are required'
    });
  }

  try {
    // Parse date and time
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = endTime
      ? new Date(`${date}T${endTime}`)
      : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    let googleEventId = null;

    // If user is authenticated, create event in Google Calendar
    if (email) {
      const authClient = getAuthenticatedClient(email);

      if (authClient) {
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        const googleEvent = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: title,
            description: description || '',
            location: location || '',
            start: {
              dateTime: startDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
          }
        });

        googleEventId = googleEvent.data.id;
      }
    }

    // Save to DynamoDB
    const eventId = uuidv4();
    const now = new Date().toISOString();

    const eventItem = {
      id: eventId,
      google_event_id: googleEventId,
      title,
      description: description || '',
      location: location || '',
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      user_email: email || 'anonymous',
      attendees: 0,
      created_at: now,
      updated_at: now
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.EVENTS,
      Item: eventItem
    }));

    res.json({
      success: true,
      message: 'Event created successfully',
      data: {
        id: eventId,
        google_event_id: googleEventId,
        title,
        description,
        location,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
});

// GET /api/calendar/events/:id - Get a single event
router.get('/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.EVENTS,
      Key: { id }
    }));

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: result.Item,
      message: 'Event retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
});

// PUT /api/calendar/events/:id - Update an event
router.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, location, date, time, endTime, email } = req.body;

  try {
    // Check if event exists
    const existingResult = await docClient.send(new GetCommand({
      TableName: TABLES.EVENTS,
      Key: { id }
    }));

    if (!existingResult.Item) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const existingEvent = existingResult.Item;

    // Parse date and time if provided
    let startDateTime = existingEvent.start_datetime;
    let endDateTime = existingEvent.end_datetime;

    if (date && time) {
      startDateTime = new Date(`${date}T${time}`).toISOString();
      endDateTime = endTime
        ? new Date(`${date}T${endTime}`).toISOString()
        : new Date(new Date(`${date}T${time}`).getTime() + 60 * 60 * 1000).toISOString();
    }

    // Update in Google Calendar if authenticated and has Google event ID
    if (email && existingEvent.google_event_id) {
      const authClient = getAuthenticatedClient(email);

      if (authClient) {
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        try {
          await calendar.events.update({
            calendarId: 'primary',
            eventId: existingEvent.google_event_id,
            requestBody: {
              summary: title || existingEvent.title,
              description: description !== undefined ? description : existingEvent.description,
              location: location !== undefined ? location : existingEvent.location,
              start: {
                dateTime: startDateTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              },
              end: {
                dateTime: endDateTime,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            }
          });
        } catch (googleError) {
          console.error('Error updating Google Calendar:', googleError);
        }
      }
    }

    // Update in DynamoDB
    await docClient.send(new UpdateCommand({
      TableName: TABLES.EVENTS,
      Key: { id },
      UpdateExpression: 'SET title = :title, description = :desc, #loc = :loc, start_datetime = :start, end_datetime = :end, updated_at = :updated',
      ExpressionAttributeNames: { '#loc': 'location' },
      ExpressionAttributeValues: {
        ':title': title || existingEvent.title,
        ':desc': description !== undefined ? description : existingEvent.description,
        ':loc': location !== undefined ? location : existingEvent.location,
        ':start': startDateTime,
        ':end': endDateTime,
        ':updated': new Date().toISOString()
      }
    }));

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        id,
        title: title || existingEvent.title,
        description: description !== undefined ? description : existingEvent.description,
        location: location !== undefined ? location : existingEvent.location,
        start_datetime: startDateTime,
        end_datetime: endDateTime
      }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
});

// DELETE /api/calendar/events/:id - Delete an event
router.delete('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.query;

  try {
    // Get the event first to check for Google event ID
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.EVENTS,
      Key: { id }
    }));

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = result.Item;

    // Delete from Google Calendar if authenticated and has Google event ID
    if (email && event.google_event_id) {
      const authClient = getAuthenticatedClient(email);

      if (authClient) {
        const calendar = google.calendar({ version: 'v3', auth: authClient });

        try {
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: event.google_event_id
          });
        } catch (googleError) {
          console.error('Error deleting from Google Calendar:', googleError);
        }
      }
    }

    // Delete from DynamoDB
    await docClient.send(new DeleteCommand({
      TableName: TABLES.EVENTS,
      Key: { id }
    }));

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
});

export default router;
