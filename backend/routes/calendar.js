import { Router } from 'express';
import { google } from 'googleapis';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { getAuthenticatedClient } from './auth.js';

const router = Router();

// Generate a unique share token
function generateShareToken() {
  return crypto.randomBytes(16).toString('hex');
}
// changes made

// Database connection configuration (same as users.js)
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'app',
  password: 'app',
  database: 'app'
};

const pool = mysql.createPool(dbConfig);

// Initialize events and attendees tables
async function initializeTables() {
  try {
    const connection = await pool.getConnection();

    // Create events table with share_token
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        google_event_id VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255),
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        attendees INT DEFAULT 0,
        share_token VARCHAR(64) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create event_attendees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS event_attendees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
        role ENUM('owner', 'editor') DEFAULT 'editor',
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        responded_at TIMESTAMP NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        UNIQUE KEY unique_event_attendee (event_id, email)
      )
    `);

    // Add share_token column if it doesn't exist (for existing tables)
    try {
      await connection.execute(`
        ALTER TABLE events ADD COLUMN share_token VARCHAR(64) UNIQUE
      `);
    } catch (e) {
      // Column already exists, ignore error
    }

    connection.release();
    console.log('Events and attendees tables initialized successfully');
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
}

initializeTables();

// Helper: Check if user can edit event
async function canEditEvent(eventId, userEmail) {
  const connection = await pool.getConnection();
  try {
    // Check if user is owner
    const [ownerRows] = await connection.execute(
      'SELECT 1 FROM events WHERE id = ? AND user_email = ?',
      [eventId, userEmail]
    );
    if (ownerRows.length > 0) return true;

    // Check if user is an accepted attendee with editor role
    const [attendeeRows] = await connection.execute(
      `SELECT 1 FROM event_attendees
       WHERE event_id = ? AND email = ? AND role = 'editor' AND status = 'accepted'`,
      [eventId, userEmail]
    );
    return attendeeRows.length > 0;
  } finally {
    connection.release();
  }
}

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

        // Sync Google events to local database
        const connection = await pool.getConnection();

        for (const event of googleEvents) {
          const startDateTime = event.start.dateTime || event.start.date;
          const endDateTime = event.end.dateTime || event.end.date;

          await connection.execute(`
            INSERT INTO events (google_event_id, title, description, location, start_datetime, end_datetime, user_email, attendees)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              title = VALUES(title),
              description = VALUES(description),
              location = VALUES(location),
              start_datetime = VALUES(start_datetime),
              end_datetime = VALUES(end_datetime),
              attendees = VALUES(attendees)
          `, [
            event.id,
            event.summary || 'Untitled Event',
            event.description || '',
            event.location || '',
            new Date(startDateTime),
            new Date(endDateTime),
            email,
            event.attendees?.length || 0
          ]);
        }

        connection.release();
      }
    }

    // Fetch events from database
    const connection = await pool.getConnection();

    let query = 'SELECT * FROM events WHERE start_datetime >= NOW() ORDER BY start_datetime ASC';
    let params = [];

    if (email) {
      query = 'SELECT * FROM events WHERE user_email = ? AND start_datetime >= NOW() ORDER BY start_datetime ASC';
      params = [email];
    }

    const [rows] = await connection.execute(query, params);
    connection.release();

    res.json({
      success: true,
      data: rows,
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

    // Save to local database
    const connection = await pool.getConnection();
    const shareToken = generateShareToken();

    const [result] = await connection.execute(`
      INSERT INTO events (google_event_id, title, description, location, start_datetime, end_datetime, user_email, attendees, share_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      googleEventId,
      title,
      description || '',
      location || '',
      startDateTime,
      endDateTime,
      email || 'anonymous',
      1,
      shareToken
    ]);

    // Add creator as owner attendee
    const eventId = result.insertId;
    await connection.execute(`
      INSERT INTO event_attendees (event_id, email, name, status, role)
      VALUES (?, ?, ?, 'accepted', 'owner')
    `, [eventId, email || 'anonymous', '']);

    connection.release();

    res.json({
      success: true,
      message: 'Event created successfully',
      data: {
        id: eventId,
        google_event_id: googleEventId,
        title,
        description,
        location,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        share_token: shareToken
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

// DELETE /api/calendar/events/:id - Delete an event
router.delete('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.query;

  try {
    const connection = await pool.getConnection();

    // Get the event first to check for Google event ID
    const [events] = await connection.execute('SELECT * FROM events WHERE id = ?', [id]);

    if (events.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = events[0];

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

    // Delete from local database
    await connection.execute('DELETE FROM events WHERE id = ?', [id]);
    connection.release();

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

// NEW CHANGE: GET /api/calendar/events/shared/:token - Get event by share token (public)
router.get('/events/shared/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const connection = await pool.getConnection();

    const [events] = await connection.execute(
      'SELECT * FROM events WHERE share_token = ?',
      [token]
    );

    if (events.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Event not found or link is invalid'
      });
    }

    const event = events[0];

    // Get attendees
    const [attendees] = await connection.execute(
      `SELECT id, email, name, status, role, invited_at, responded_at
       FROM event_attendees WHERE event_id = ?`,
      [event.id]
    );

    connection.release();

    res.json({
      success: true,
      data: {
        ...event,
        attendeeList: attendees
      }
    });
  } catch (error) {
    console.error('Error fetching shared event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
});

// GET /api/calendar/events/:id - Get single event with attendees
router.get('/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    const [events] = await connection.execute(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );

    if (events.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = events[0];

    // Get attendees
    const [attendees] = await connection.execute(
      `SELECT id, email, name, status, role, invited_at, responded_at
       FROM event_attendees WHERE event_id = ?`,
      [event.id]
    );

    connection.release();

    res.json({
      success: true,
      data: {
        ...event,
        attendeeList: attendees
      }
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

// GET /api/calendar/events/:id/attendees - Get attendees for an event
router.get('/events/:id/attendees', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();

    const [attendees] = await connection.execute(
      `SELECT id, email, name, status, role, invited_at, responded_at
       FROM event_attendees WHERE event_id = ?`,
      [id]
    );

    connection.release();

    res.json({
      success: true,
      data: attendees
    });
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendees',
      error: error.message
    });
  }
});

// POST /api/calendar/events/:id/invite - Invite people to an event
router.post('/events/:id/invite', async (req, res) => {
  const { id } = req.params;
  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Emails array is required'
    });
  }

  try {
    const connection = await pool.getConnection();

    // Check if event exists
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );

    if (events.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    let invitedCount = 0;

    for (const email of emails) {
      try {
        await connection.execute(`
          INSERT INTO event_attendees (event_id, email, status, role)
          VALUES (?, ?, 'pending', 'editor')
          ON DUPLICATE KEY UPDATE status = status
        `, [id, email.trim()]);
        invitedCount++;
      } catch (e) {
        console.error(`Error inviting ${email}:`, e);
      }
    }

    connection.release();

    res.json({
      success: true,
      message: `Invited ${invitedCount} people`,
      invited: invitedCount
    });
  } catch (error) {
    console.error('Error inviting attendees:', error);
    res.status(500).json({
      success: false,
      message: 'Error inviting attendees',
      error: error.message
    });
  }
});

// POST /api/calendar/events/:id/respond - Accept or decline invitation
router.post('/events/:id/respond', async (req, res) => {
  const { id } = req.params;
  const { email, name, response } = req.body;

  if (!email || !response) {
    return res.status(400).json({
      success: false,
      message: 'Email and response are required'
    });
  }

  if (!['accepted', 'declined'].includes(response)) {
    return res.status(400).json({
      success: false,
      message: 'Response must be "accepted" or "declined"'
    });
  }

  try {
    const connection = await pool.getConnection();

    // Check if event exists
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );

    if (events.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Update or create attendee record
    await connection.execute(`
      INSERT INTO event_attendees (event_id, email, name, status, role, responded_at)
      VALUES (?, ?, ?, ?, 'editor', NOW())
      ON DUPLICATE KEY UPDATE
        name = COALESCE(VALUES(name), name),
        status = VALUES(status),
        responded_at = NOW()
    `, [id, email, name || '', response]);

    // Update attendee count
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as count FROM event_attendees
       WHERE event_id = ? AND status = 'accepted'`,
      [id]
    );

    await connection.execute(
      'UPDATE events SET attendees = ? WHERE id = ?',
      [countResult[0].count, id]
    );

    connection.release();

    res.json({
      success: true,
      message: `Invitation ${response}`
    });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to invitation',
      error: error.message
    });
  }
});

// PUT /api/calendar/events/:id - Update event (with permission check)
router.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, location, date, time, endTime, email } = req.body;

  if (!email) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    // Check permission
    const hasPermission = await canEditEvent(id, email);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this event'
      });
    }

    const connection = await pool.getConnection();

    // Get current event
    const [events] = await connection.execute(
      'SELECT * FROM events WHERE id = ?',
      [id]
    );

    if (events.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = events[0];

    // Parse new dates if provided
    let startDateTime = event.start_datetime;
    let endDateTime = event.end_datetime;

    if (date && time) {
      startDateTime = new Date(`${date}T${time}`);
      endDateTime = endTime
        ? new Date(`${date}T${endTime}`)
        : new Date(startDateTime.getTime() + 60 * 60 * 1000);
    }

    // Update event
    await connection.execute(`
      UPDATE events SET
        title = ?,
        description = ?,
        location = ?,
        start_datetime = ?,
        end_datetime = ?
      WHERE id = ?
    `, [
      title || event.title,
      description !== undefined ? description : event.description,
      location !== undefined ? location : event.location,
      startDateTime,
      endDateTime,
      id
    ]);

    // Update Google Calendar if connected
    if (event.google_event_id && event.user_email) {
      const authClient = getAuthenticatedClient(event.user_email);
      if (authClient) {
        const calendar = google.calendar({ version: 'v3', auth: authClient });
        try {
          await calendar.events.patch({
            calendarId: 'primary',
            eventId: event.google_event_id,
            requestBody: {
              summary: title || event.title,
              description: description !== undefined ? description : event.description,
              location: location !== undefined ? location : event.location,
              start: {
                dateTime: new Date(startDateTime).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              },
              end: {
                dateTime: new Date(endDateTime).toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              }
            }
          });
        } catch (googleError) {
          console.error('Error updating Google Calendar:', googleError);
        }
      }
    }

    connection.release();

    res.json({
      success: true,
      message: 'Event updated successfully'
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

export default router;
