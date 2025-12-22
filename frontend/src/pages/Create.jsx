import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, TextField, Button, Stack, Alert, Snackbar, Tabs, Tab, Grid, Chip, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import Footer from '../components/Footer';

const BackendURL = "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com";

const Create = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
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

  // Map category names to icons
  const getCategoryIcon = (categoryName, type) => {
    const lowerName = categoryName?.toLowerCase() || '';
    
    // Ticketmaster icon mapping
    if (type === 'ticketmaster') {
      if (lowerName.includes('music')) return MusicNoteIcon;
      if (lowerName.includes('sport')) return SportsBasketballIcon;
      if (lowerName.includes('comedy') || lowerName.includes('theater')) return TheaterComedyIcon;
      return EventIcon;
    }
    
    // Yelp icon mapping
    if (type === 'yelp') {
      if (lowerName.includes('restaurant') || lowerName.includes('food')) return LocalDiningIcon;
      return LocalDiningIcon;
    }
    
    return EventIcon;
  };

  // Load categories from both Ticketmaster and Yelp
  const loadAllCategories = async () => {
    setLoadingCategories(true);
    try {
      const allCategories = [];
      
      // Fetch Ticketmaster categories
      try {
        const tmResponse = await fetch(`${BackendURL}/api/TicketMaster/search?keyword=&size=100&sort=date,asc`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const tmData = await tmResponse.json();
        
        console.log('Ticketmaster API Response:', tmData);
        
        if (tmData.success && tmData.events && tmData.events.length > 0) {
          const tmCategories = Array.from(
            new Map(
              tmData.events
                .flatMap(event => event.classifications || [])
                .filter(classification => classification.segment?.name || classification.genre?.name)
                .map(classification => {
                  const name = classification.segment?.name || classification.genre?.name;
                  return [name, { name, type: 'ticketmaster', icon: getCategoryIcon(name, 'ticketmaster') }];
                })
            ).values()
          );
          console.log('Ticketmaster categories found:', tmCategories.length);
          allCategories.push(...tmCategories);
        } else {
          console.log('No Ticketmaster events found');
        }
      } catch (error) {
        console.error('Error loading Ticketmaster categories:', error);
      }
      
      // Fetch Yelp categories
      try {
        const yelpResponse = await fetch(`${BackendURL}/api/yelp/search?term=&location=New+York&limit=50`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const yelpData = await yelpResponse.json();
        
        console.log('Yelp API Response:', yelpData);
        
        if (yelpData.success && yelpData.businesses && yelpData.businesses.length > 0) {
          const yelpCategories = Array.from(
            new Map(
              yelpData.businesses
                .flatMap(business => business.categories || [])
                .filter(category => category.title)
                .map(category => {
                  const name = category.title;
                  return [name, { name, type: 'yelp', icon: getCategoryIcon(name, 'yelp') }];
                })
            ).values()
          );
          console.log('Yelp categories found:', yelpCategories.length);
          allCategories.push(...yelpCategories);
        } else {
          console.log('No Yelp businesses found');
        }
      } catch (error) {
        console.error('Error loading Yelp categories:', error);
      }
      
      console.log('Total categories before deduplication:', allCategories.length);
      
      // Deduplicate categories by name (case-insensitive)
      const uniqueMap = new Map();
      allCategories.forEach(cat => {
        const key = cat.name?.toLowerCase();
        if (key && !uniqueMap.has(key)) {
          uniqueMap.set(key, cat);
        }
      });
      
      const finalCategories = Array.from(uniqueMap.values())
        .sort((a, b) => a.name.localeCompare(b.name));
      console.log('Final unique categories:', finalCategories.length);

      setCategories(finalCategories);
      
      if (finalCategories.length === 0) {
        setSnackbar({ open: true, message: 'No categories found', severity: 'info' });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setSnackbar({ open: true, message: 'Failed to load categories', severity: 'error' });
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    loadAllCategories();
  }, []);

  // Handle category selection
  const handleCategorySelect = (category) => {
    // Navigate to Events page with category info
    navigate('/events', {
      state: {
        categoryName: category.name,
        categoryType: category.type,
        activeTab: category.type === 'ticketmaster' ? 1 : 2
      }
    });
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

      console.log('Creating event with data:', { ...formData, email: userEmail });

      const response = await fetch(`${BackendURL}/api/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          email: userEmail,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: '#8e8ea0',
                '&.Mui-selected': {
                  color: '#4a90e2',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#4a90e2',
              },
            }}
          >
            <Tab label="Browse Categories" />
            <Tab label="Create Event" />
          </Tabs>
        </Box>

        {/* Browse Categories Tab */}
        {activeTab === 0 && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 3 }}>
            <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 3 }}>
              Browse popular categories from Ticketmaster and Yelp. Click on any category to start creating an event!
            </Typography>
            
            {loadingCategories ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <CircularProgress sx={{ color: '#4a90e2' }} />
              </Box>
            ) : categories.length > 0 ? (
              <Grid container spacing={2}>
                {categories.map((category, index) => (
                  <Grid item xs={12} sm={6} md={3} lg={2.4} key={index}>
                    <Card
                      onClick={() => handleCategorySelect(category)}
                      sx={{
                        bgcolor: '#2a2a3e',
                        border: '1px solid #3a3a4e',
                        borderRadius: 2,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 2,
                        height: 100,
                        minHeight: 100,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#3a3a4e',
                          borderColor: '#4a90e2',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 4px 12px rgba(74, 144, 226, 0.2)',
                        },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: '#fff',
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          textAlign: 'center',
                        }}
                      >
                        {category.name}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                <Typography sx={{ color: '#8e8ea0' }}>No categories found</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Create Event Tab */}
        {activeTab === 1 && (
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
        )}
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
