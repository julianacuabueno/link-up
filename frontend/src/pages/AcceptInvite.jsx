import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttendeeList from '../components/AttendeeList';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail);
    }
  }, [userEmail]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calendar/events/shared/${token}`);
      const data = await response.json();

      if (data.success) {
        setEvent(data.data);
        // Check if user already responded
        const existingAttendee = data.data.attendeeList?.find(
          a => a.email === userEmail && a.status !== 'pending'
        );
        if (existingAttendee) {
          setResponded(true);
        }
      } else {
        setSnackbar({ open: true, message: 'Invalid or expired invitation link', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setSnackbar({ open: true, message: 'Failed to load event', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [token]);

  const handleRespond = async (response) => {
    if (!email || !email.includes('@')) {
      setSnackbar({ open: true, message: 'Please enter a valid email address', severity: 'error' });
      return;
    }

    setResponding(true);
    try {
      const res = await fetch(`/api/calendar/events/${event.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, response })
      });

      const data = await res.json();

      if (data.success) {
        setResponded(true);
        setSnackbar({
          open: true,
          message: response === 'accepted' ? "You're going! See you there." : 'You declined the invitation.',
          severity: response === 'accepted' ? 'success' : 'info'
        });

        if (response === 'accepted') {
          // Refresh to show updated attendee list
          fetchEvent();
        }
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to respond', severity: 'error' });
      }
    } catch (error) {
      console.error('Error responding:', error);
      setSnackbar({ open: true, message: 'Failed to respond to invitation', severity: 'error' });
    } finally {
      setResponding(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (!event) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: '#374151', mb: 2 }}>
          Event Not Found
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 4 }}>
          This invitation link is invalid or has expired.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ bgcolor: '#4a90e2', '&:hover': { bgcolor: '#357abd' } }}
        >
          Go to Home
        </Button>
      </Box>
    );
  }

  const acceptedCount = event.attendeeList?.filter(a => a.status === 'accepted').length || 0;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', width: '100%', py: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="overline" sx={{ color: '#4a90e2', fontWeight: 600 }}>
            You're Invited!
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827', mt: 1, mb: 3 }}>
            {event.title}
          </Typography>

          {event.description && (
            <Typography variant="body1" sx={{ color: '#4b5563', mb: 3 }}>
              {event.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EventIcon sx={{ color: '#4a90e2' }} />
              <Typography variant="body1" sx={{ color: '#374151' }}>
                {formatDate(event.start_datetime)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccessTimeIcon sx={{ color: '#4a90e2' }} />
              <Typography variant="body1" sx={{ color: '#374151' }}>
                {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
              </Typography>
            </Box>

            {event.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOnIcon sx={{ color: '#4a90e2' }} />
                <Typography variant="body1" sx={{ color: '#374151' }}>
                  {event.location}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleIcon sx={{ color: '#4a90e2' }} />
              <Typography variant="body1" sx={{ color: '#374151' }}>
                {acceptedCount} {acceptedCount === 1 ? 'person' : 'people'} attending
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {responded ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#111827', mb: 1 }}>
                You've responded!
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                Your response has been recorded.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(`/events/${event.id}`)}
                sx={{ bgcolor: '#4a90e2', '&:hover': { bgcolor: '#357abd' }, textTransform: 'none' }}
              >
                View Event Details
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 600, mb: 2 }}>
                Your Details
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  variant="outlined"
                  fullWidth
                  placeholder="Enter your name"
                />
                <TextField
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  fullWidth
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleRespond('accepted')}
                  disabled={responding}
                  startIcon={responding ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                  sx={{
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' },
                    textTransform: 'none',
                    py: 1.5
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleRespond('declined')}
                  disabled={responding}
                  startIcon={<CancelIcon />}
                  sx={{
                    borderColor: '#d1d5db',
                    color: '#6b7280',
                    textTransform: 'none',
                    py: 1.5,
                    '&:hover': { borderColor: '#9ca3af', bgcolor: '#f9fafb' }
                  }}
                >
                  Decline
                </Button>
              </Box>
            </>
          )}

          {event.attendeeList && event.attendeeList.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <AttendeeList attendees={event.attendeeList} compact />
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AcceptInvite;
