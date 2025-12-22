import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Stack, Chip, CircularProgress, Button, Tabs, Tab, ButtonGroup, Grid, Dialog, DialogTitle, DialogContent, IconButton, Divider } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SyncIcon from '@mui/icons-material/Sync';
import DeleteIcon from '@mui/icons-material/Delete';
import Footer from '../components/Footer';
import PlaceSearch from '../components/PlaceSearch';
import EventSearch from '../components/EventSearch';

const BackendURL = "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com";
const Event = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeLocation, setPlaceLocation] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [calendarView, setCalendarView] = useState('week'); // 'week', '2weeks', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
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
    
    // Check if navigated from category selection
    if (location.state?.categoryName) {
      const { categoryName, categoryType, activeTab: newTab } = location.state;
      setActiveTab(newTab);
      
      if (categoryType === 'ticketmaster') {
        setEventSearch(categoryName);
      } else if (categoryType === 'yelp') {
        setPlaceSearch(categoryName);
      }
      
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.key, location.state]);

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

  // Get calendar date range based on view
  const getDateRange = () => {
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    
    if (calendarView === 'week') {
      start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end, days: 7 };
    } else if (calendarView === '2weeks') {
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 13);
      return { start, end, days: 14 };
    } else { // month
      start.setDate(1); // First day of month
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      return { start, end, days: end.getDate() };
    }
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Navigate calendar
  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (calendarView === '2weeks') {
      newDate.setDate(newDate.getDate() + (direction * 14));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  // Open/close day modal
  const openDayDialog = (date) => {
    const evts = getEventsForDate(date).sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
    setSelectedDate(new Date(date));
    setSelectedDayEvents(evts);
    setDayDialogOpen(true);
  };
  const closeDayDialog = () => setDayDialogOpen(false);

  // Next 5 upcoming events from now
  const getNextFiveEvents = () => {
    const now = new Date();
    return [...events]
      .filter(e => {
        const sd = new Date(e.start_datetime);
        return !isNaN(sd) && sd >= now;
      })
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
      .slice(0, 5);
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
        <Typography variant="h3" sx={{ color: 'black', mb: 3, fontWeight: 600 }}>
          Events & Places
        </Typography>

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
            <Tab label="Upcoming Events" />
            <Tab label="Find Events" />
            <Tab label="Find Places" />
          </Tabs>
        </Box>

        {/* Upcoming Events Tab */}
        {activeTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ButtonGroup variant="outlined" size="small">
                  <Button
                    variant={calendarView === 'week' ? 'contained' : 'outlined'}
                    onClick={() => setCalendarView('week')}
                    sx={{
                      bgcolor: calendarView === 'week' ? '#4a90e2' : 'transparent',
                      borderColor: '#4a90e2',
                      color: calendarView === 'week' ? '#fff' : '#4a90e2',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: calendarView === 'week' ? '#357abd' : 'rgba(74, 144, 226, 0.1)'
                      }
                    }}
                  >
                    Week
                  </Button>
                  <Button
                    variant={calendarView === '2weeks' ? 'contained' : 'outlined'}
                    onClick={() => setCalendarView('2weeks')}
                    sx={{
                      bgcolor: calendarView === '2weeks' ? '#4a90e2' : 'transparent',
                      borderColor: '#4a90e2',
                      color: calendarView === '2weeks' ? '#fff' : '#4a90e2',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: calendarView === '2weeks' ? '#357abd' : 'rgba(74, 144, 226, 0.1)'
                      }
                    }}
                  >
                    2 Weeks
                  </Button>
                  <Button
                    variant={calendarView === 'month' ? 'contained' : 'outlined'}
                    onClick={() => setCalendarView('month')}
                    sx={{
                      bgcolor: calendarView === 'month' ? '#4a90e2' : 'transparent',
                      borderColor: '#4a90e2',
                      color: calendarView === 'month' ? '#fff' : '#4a90e2',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: calendarView === 'month' ? '#357abd' : 'rgba(74, 144, 226, 0.1)'
                      }
                    }}
                  >
                    Month
                  </Button>
                </ButtonGroup>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => navigateCalendar(-1)}
                    sx={{ minWidth: 'auto', color: '#4a90e2' }}
                  >
                    <ChevronLeftIcon />
                  </Button>
                  <Typography variant="subtitle1" sx={{ color: '#fff', minWidth: 200, textAlign: 'center', fontWeight: 600 }}>
                    {calendarView === 'month' 
                      ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : `${getDateRange().start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${getDateRange().end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    }
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigateCalendar(1)}
                    sx={{ minWidth: 'auto', color: '#4a90e2' }}
                  >
                    <ChevronRightIcon />
                  </Button>
                  <Button
                    size="small"
                    startIcon={<TodayIcon />}
                    onClick={() => setCurrentDate(new Date())}
                    sx={{ textTransform: 'none', color: '#4a90e2' }}
                  >
                    Today
                  </Button>
                </Box>
              </Box>
              
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

            {/* Day Events Modal */}
            <Dialog open={dayDialogOpen} onClose={closeDayDialog} fullWidth maxWidth="sm">
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                </Typography>
                <IconButton onClick={closeDayDialog}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                {selectedDayEvents.length === 0 ? (
                  <Typography sx={{ color: '#8e8ea0' }}>No events for this day</Typography>
                ) : (
                  <Stack spacing={2}>
                    {selectedDayEvents.map((e) => (
                      <Box key={e.id}>
                        <Typography sx={{ fontWeight: 600 }}>{e.title}</Typography>
                        <Typography sx={{ color: '#6e6e80' }}>
                          {formatDate(e.start_datetime)} • {formatTime(e.start_datetime)}
                        </Typography>
                        {e.location && (
                          <Typography sx={{ color: '#8e8ea0' }}>{e.location}</Typography>
                        )}
                        <Divider sx={{ mt: 1 }} />
                      </Box>
                    ))}
                  </Stack>
                )}
              </DialogContent>
            </Dialog>

            {error && (
              <Typography sx={{ color: '#f44336', mb: 2 }}>{error}</Typography>
            )}

            {/* Calendar Grid */}
            <Box>
              {/* Show day headers only for 2weeks and month views */}
              {(calendarView === '2weeks' || calendarView === 'month') && (
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Grid item xs={12/7} key={day}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#8e8ea0',
                          fontWeight: 600,
                          display: 'block',
                          textAlign: 'center',
                          py: 1
                        }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              <Grid container spacing={1}>
                {(() => {
                  const { start, end, days } = getDateRange();
                  const dateArray = [];
                  
                  // For 2weeks and month views, add padding days from previous period
                  if (calendarView === '2weeks' || calendarView === 'month') {
                    const firstDayOfWeek = start.getDay();
                    for (let i = 0; i < firstDayOfWeek; i++) {
                      const paddingDate = new Date(start);
                      paddingDate.setDate(paddingDate.getDate() - (firstDayOfWeek - i));
                      dateArray.push({ date: paddingDate, isCurrentMonth: false });
                    }
                  }
                  
                  // Add current period days
                  for (let i = 0; i < days; i++) {
                    const date = new Date(start);
                    date.setDate(date.getDate() + i);
                    dateArray.push({ date, isCurrentMonth: true });
                  }
                  
                  // For 2weeks and month views, add padding days to complete the grid
                  if (calendarView === '2weeks' || calendarView === 'month') {
                    const remainingDays = 7 - (dateArray.length % 7);
                    if (remainingDays < 7) {
                      for (let i = 1; i <= remainingDays; i++) {
                        const paddingDate = new Date(end);
                        paddingDate.setDate(paddingDate.getDate() + i);
                        dateArray.push({ date: paddingDate, isCurrentMonth: false });
                      }
                    }
                  }
                  
                  return dateArray.map(({ date, isCurrentMonth }, index) => {
                    const dayEvents = getEventsForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    // For week view, show date inline with day name
                    if (calendarView === 'week') {
                      return (
                        <Grid item xs={12/7} key={index}>
                          <Box sx={{ textAlign: 'center', mb: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#8e8ea0',
                                fontWeight: 600,
                                display: 'block',
                              }}
                            >
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: isToday ? '#4a90e2' : '#fff',
                                fontWeight: isToday ? 700 : 600,
                              }}
                            >
                              {date.getDate()}
                            </Typography>
                          </Box>
                          <Card
                            sx={{
                              bgcolor: '#2a2a3e',
                              border: isToday ? '2px solid #4a90e2' : '1px solid #3a3a4e',
                              borderRadius: 2,
                              minHeight: 120,
                              p: 1,
                              cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: dayEvents.length > 0 ? '#4a90e2' : '#3a3a4e',
                                transform: dayEvents.length > 0 ? 'translateY(-2px)' : 'none',
                              },
                            }}
                            onClick={() => dayEvents.length > 0 && openDayDialog(date)}
                          >
                            {dayEvents.slice(0, 3).map((event, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  bgcolor: '#4a90e2',
                                  borderRadius: 1,
                                  px: 0.5,
                                  py: 0.25,
                                  mb: 0.5,
                                  overflow: 'hidden'
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {event.title}
                                </Typography>
                              </Box>
                            ))}
                            
                            {dayEvents.length > 3 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#8e8ea0',
                                  fontSize: '0.65rem'
                                }}
                              >
                                +{dayEvents.length - 3} more
                              </Typography>
                            )}
                          </Card>
                        </Grid>
                      );
                    }
                    
                    // For 2weeks and month views, show in grid format
                    return (
                      <Grid item xs={12/7} key={index}>
                        <Card
                          sx={{
                            bgcolor: isCurrentMonth ? '#2a2a3e' : '#1a1a2e',
                            border: isToday ? '2px solid #4a90e2' : '1px solid #3a3a4e',
                            borderRadius: 2,
                            minHeight: calendarView === 'month' ? 160 : 120,
                            p: 1,
                            cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: dayEvents.length > 0 ? '#4a90e2' : '#3a3a4e',
                              transform: dayEvents.length > 0 ? 'translateY(-2px)' : 'none',
                            },
                          }}
                          onClick={() => dayEvents.length > 0 && openDayDialog(date)}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: isToday ? '#4a90e2' : (isCurrentMonth ? '#fff' : '#6e6e80'),
                              fontWeight: isToday ? 700 : 600,
                              display: 'block',
                              mb: 0.5
                            }}
                          >
                            {date.getDate()}
                          </Typography>
                          
                          {dayEvents.slice(0, calendarView === 'month' ? 4 : 3).map((event, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                bgcolor: '#4a90e2',
                                borderRadius: 1,
                                px: 0.5,
                                py: 0.25,
                                mb: 0.5,
                                overflow: 'hidden'
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#fff',
                                  fontSize: '0.65rem',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {event.title}
                              </Typography>
                            </Box>
                          ))}
                          
                          {dayEvents.length > (calendarView === 'month' ? 4 : 3) && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#8e8ea0',
                                fontSize: '0.65rem'
                              }}
                            >
                              +{dayEvents.length - (calendarView === 'month' ? 4 : 3)} more
                            </Typography>
                          )}
                        </Card>
                      </Grid>
                    );
                  });
                })()}
              </Grid>
            </Box>
            
            {/* Next 5 Upcoming */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                Next 5 Upcoming
              </Typography>
              {getNextFiveEvents().length === 0 ? (
                <Typography sx={{ color: '#8e8ea0' }}>No upcoming events</Typography>
              ) : (
                <Stack spacing={1}>
                  {getNextFiveEvents().map((e) => (
                    <Box key={e.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: '#1f1f2f', borderRadius: 1, border: '1px solid #2f2f40' }}>
                      <Typography sx={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ color: '#b0b0c0' }}>{formatDate(e.start_datetime)}</Typography>
                        <Typography sx={{ color: '#8e8ea0' }}>{formatTime(e.start_datetime)}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Event List Below Calendar */}
            {events.length === 0 ? (
              <Card
                sx={{
                  bgcolor: '#2a2a3e',
                  border: '1px solid #3a3a4e',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  mt: 3
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
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                  All Events
                </Typography>
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
              </Box>
            )}
          </Box>
        )}

        {/* Find Events Tab */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
              Discover and search for concerts, sports, theatre, and other events from Ticketmaster
            </Typography>

            <EventSearch
              searchTerm={eventSearch}
              onSearchChange={setEventSearch}
              location={eventLocation}
              onLocationChange={setEventLocation}
              searchLabel="Search for events"
              locationLabel="Location"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#000',
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
                '& .MuiInputBase-input': {
                  color: '#000',
                  '&::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Find Places Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
              Search for restaurants, bars, venues, and other locations with reviews and ratings
            </Typography>

            <PlaceSearch
              searchTerm={placeSearch}
              onSearchChange={setPlaceSearch}
              location={placeLocation}
              onLocationChange={setPlaceLocation}
              searchLabel="Search for places"
              locationLabel="Location"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#000',
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
                '& .MuiInputBase-input': {
                  color: '#000',
                  '&::placeholder': {
                    color: '#999',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default Event;
