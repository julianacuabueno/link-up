import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Stack, Chip, CircularProgress, Button } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SyncIcon from '@mui/icons-material/Sync';
import DeleteIcon from '@mui/icons-material/Delete';
import Footer from '../components/Footer';

const BackendURL = "http://127.0.0.1:3000";
const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  const userEmail = localStorage.getItem('userEmail');

  const fetchEvents = async (sync = false) => {
    try {
      if (sync) setSyncing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (userEmail) params.append('email', userEmail);
      if (sync) params.append('sync', 'true');

      const response = await fetch(`${BackendURL}/api/calendar/events?${params}`, {
        cache: 'no-store'
      });
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const params = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const response = await fetch(`/api/calendar/events/${eventId}${params}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setEvents(prev => prev.filter(e => e.id !== eventId));
      } else {
        alert(data.message || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      alert('Failed to delete event');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [location.key]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#4a90e2' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" sx={{ color: 'black', fontWeight: 600 }}>
            Upcoming Events
          </Typography>
          {userEmail && (
            <Button
              variant="outlined"
              startIcon={syncing ? <CircularProgress size={16} /> : <SyncIcon />}
              onClick={() => fetchEvents(true)}
              disabled={syncing}
              sx={{
                borderColor: '#4a90e2',
                color: '#4a90e2',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#357abd',
                  bgcolor: 'rgba(74, 144, 226, 0.1)'
                }
              }}
            >
              {syncing ? 'Syncing...' : 'Sync with Google'}
            </Button>
          )}
        </Box>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          View and manage your upcoming events and activities
        </Typography>

        {error && (
          <Typography sx={{ color: '#f44336', mb: 2 }}>{error}</Typography>
        )}

        {events.length === 0 ? (
          <Card
            sx={{
              bgcolor: '#2a2a3e',
              border: '1px solid #3a3a4e',
              borderRadius: 2,
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" sx={{ color: '#8e8ea0' }}>
              No upcoming events
            </Typography>
            <Typography variant="body2" sx={{ color: '#6e6e80', mt: 1 }}>
              Create a new event to get started!
            </Typography>
          </Card>
        ) : (
          <Stack spacing={3}>
            {events.map((event) => (
              <Card
                key={event.id}
                sx={{
                  bgcolor: '#2a2a3e',
                  border: '1px solid #3a3a4e',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#4a90e2',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                      {event.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {event.google_event_id && (
                        <Chip
                          label="Google"
                          size="small"
                          sx={{ bgcolor: '#4285f4', color: '#fff' }}
                        />
                      )}
                      <Chip
                        label={`${event.attendees || 0} attending`}
                        size="small"
                        sx={{ bgcolor: '#4a90e2', color: '#fff' }}
                      />
                      <Button
                        size="small"
                        onClick={() => handleDelete(event.id)}
                        sx={{ minWidth: 'auto', color: '#f44336' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Box>

                  {event.description && (
                    <Typography variant="body2" sx={{ color: '#b0b0c0', mb: 2 }}>
                      {event.description}
                    </Typography>
                  )}

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon sx={{ color: '#8e8ea0', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#b0b0c0' }}>
                        {formatDate(event.start_datetime)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon sx={{ color: '#8e8ea0', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#b0b0c0' }}>
                        {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                      </Typography>
                    </Box>

                    {event.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ color: '#8e8ea0', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ color: '#b0b0c0' }}>
                          {event.location}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default Event;
