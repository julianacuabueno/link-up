import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, Alert, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Footer from '../components/Footer';

const Create = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time) {
      setSnackbar({ open: true, message: 'Please fill in title, date, and time', severity: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Get user email from localStorage if logged in with Google
      const userEmail = localStorage.getItem('userEmail');

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          email: userEmail
        })
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({ open: true, message: 'Event created successfully!', severity: 'success' });
        // Reset form
        setFormData({ title: '', date: '', time: '', location: '', description: '' });
        // Navigate to events page after short delay
        setTimeout(() => navigate('/events'), 1500);
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to create event', severity: 'error' });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setSnackbar({ open: true, message: 'Error creating event. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      '& fieldset': {
        borderColor: '#4a4a5e',
      },
      '&:hover fieldset': {
        borderColor: '#6a6a7e',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4a90e2',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#8e8ea0',
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ color: 'black', mb: 3, fontWeight: 600 }}>
          Create New Event
        </Typography>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          Plan a new event and invite your friends
        </Typography>

        <Card
          sx={{
            bgcolor: '#2a2a3e',
            border: '1px solid #3a3a4e',
            borderRadius: 2,
            maxWidth: 600,
          }}
        >
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  sx={textFieldSx}
                />

                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />

                <TextField
                  label="Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={textFieldSx}
                />

                <TextField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  sx={textFieldSx}
                />

                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  sx={textFieldSx}
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  disabled={loading}
                  sx={{
                    bgcolor: '#4a90e2',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#357abd',
                    },
                    '&:disabled': {
                      bgcolor: '#4a4a5e',
                    },
                  }}
                >
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </Box>
  );
};

export default Create;
