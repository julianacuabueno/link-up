import { Router } from 'express';
import { google } from 'googleapis';
import mysql from 'mysql2/promise';
import { getAuthenticatedClient } from './auth.js';

const router = Router();

// Database connection configuration (same as users.js)
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'app',
  password: 'app',
  database: 'app'
};

const pool = mysql.createPool(dbConfig);

// Initialize events table
async function initializeEventsTable() {
  try {
    const connection = await pool.getConnection();

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    connection.release();
    console.log('Events table initialized successfully');
  } catch (error) {
    console.error('Error initializing events table:', error);
  }
}

initializeEventsTable();

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

    const [result] = await connection.execute(`
      INSERT INTO events (google_event_id, title, description, location, start_datetime, end_datetime, user_email, attendees)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      googleEventId,
      title,
      description || '',
      location || '',
      startDateTime,
      endDateTime,
      email || 'anonymous',
      0
    ]);

    connection.release();

    res.json({
      success: true,
      message: 'Event created successfully',
      data: {
        id: result.insertId,
        google_event_id: googleEventId,
        title,
        description,
        location,
        start_datetime: startDateTime,
        end_datetime: endDateTime
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

export default router;
