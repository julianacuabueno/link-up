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
  IconButton,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttendeeList from '../components/AttendeeList';
import InviteDialog from '../components/InviteDialog';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const userEmail = localStorage.getItem('userEmail');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    endTime: ''
  });

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/calendar/events/${id}`);
      const data = await response.json();

      if (data.success) {
        setEvent(data.data);
        const startDate = new Date(data.data.start_datetime);
        const endDate = new Date(data.data.end_datetime);
        setFormData({
          title: data.data.title,
          description: data.data.description || '',
          location: data.data.location || '',
          date: startDate.toISOString().split('T')[0],
          time: startDate.toTimeString().slice(0, 5),
          endTime: endDate.toTimeString().slice(0, 5)
        });
      } else {
        setSnackbar({ open: true, message: 'Event not found', severity: 'error' });
        navigate('/events');
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
  }, [id]);

  const isOwner = event?.user_email === userEmail;
  const isEditor = event?.attendeeList?.some(
    a => a.email === userEmail && a.role === 'editor' && a.status === 'accepted'
  );
  const canEdit = isOwner || isEditor;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/calendar/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email: userEmail })
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({ open: true, message: 'Event updated successfully', severity: 'success' });
        setEditing(false);
        fetchEvent();
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to update event', severity: 'error' });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      setSnackbar({ open: true, message: 'Failed to update event', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const params = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
      const response = await fetch(`/api/calendar/events/${id}${params}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({ open: true, message: 'Event deleted', severity: 'success' });
        navigate('/events');
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to delete event', severity: 'error' });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setSnackbar({ open: true, message: 'Failed to delete event', severity: 'error' });
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

  if (!event) return null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/events')}
        sx={{ mb: 3, color: '#4a90e2', textTransform: 'none' }}
      >
        Back to Events
      </Button>

      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            {editing ? (
              <TextField
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                sx={{ mr: 2 }}
                placeholder="Event Title"
              />
            ) : (
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#111827' }}>
                {event.title}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              {canEdit && !editing && (
                <IconButton onClick={() => setEditing(true)} sx={{ color: '#4a90e2' }}>
                  <EditIcon />
                </IconButton>
              )}
              {editing && (
                <>
                  <IconButton onClick={handleSave} disabled={saving} sx={{ color: '#10b981' }}>
                    {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  </IconButton>
                  <IconButton onClick={() => setEditing(false)} sx={{ color: '#6b7280' }}>
                    <CancelIcon />
                  </IconButton>
                </>
              )}
              {isOwner && (
                <IconButton onClick={handleDelete} sx={{ color: '#ef4444' }}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Event Details */}
          <Box sx={{ mb: 4 }}>
            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Description"
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  variant="outlined"
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    variant="outlined"
                    label="Date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                    variant="outlined"
                    label="Start Time"
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                    variant="outlined"
                    label="End Time"
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            ) : (
              <>
                {event.description && (
                  <Typography variant="body1" sx={{ color: '#4b5563', mb: 3 }}>
                    {event.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                </Box>
              </>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setInviteOpen(true)}
              sx={{
                bgcolor: '#4a90e2',
                '&:hover': { bgcolor: '#357abd' },
                textTransform: 'none'
              }}
            >
              Invite People
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={() => setInviteOpen(true)}
              sx={{
                borderColor: '#4a90e2',
                color: '#4a90e2',
                textTransform: 'none',
                '&:hover': { borderColor: '#357abd', bgcolor: 'rgba(74, 144, 226, 0.1)' }
              }}
            >
              Share Link
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Attendees */}
          <AttendeeList
            attendees={event.attendeeList || []}
            isOwner={isOwner}
            onRemove={null}
          />
        </CardContent>
      </Card>

      <InviteDialog
        open={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          fetchEvent();
        }}
        eventId={event.id}
        eventTitle={event.title}
        shareToken={event.share_token}
      />

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

export default EventDetail;
