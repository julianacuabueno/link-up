import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Rating,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const BackendURL = "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com";

/**
 * EventSearch component that integrates with Ticketmaster API for event search
 * Displays events with images, dates, venues, and ticket links
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current search value
 * @param {function} props.onSearchChange - Callback when search changes
 * @param {string} props.location - Current location value
 * @param {function} props.onLocationChange - Callback when location changes
 * @param {string} props.searchLabel - Label for the search field
 * @param {string} props.locationLabel - Label for the location field
 * @param {Object} props.sx - Additional styles for the text fields
 * @param {function} props.onEventSelect - Callback when user selects an event to use for creating
 */
const EventSearch = ({
  searchTerm = '',
  onSearchChange,
  location = '',
  onLocationChange,
  searchLabel = "Search for events",
  locationLabel = "Location",
  sx = {},
  onEventSelect
}) => {
  const [search, setSearch] = useState(searchTerm || '');
  const [loc, setLoc] = useState(location || '');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const inputRef = useRef(null);

  // Update search term when prop changes
  useEffect(() => {
    setSearch(searchTerm || '');
  }, [searchTerm]);

  // Update location when prop changes
  useEffect(() => {
    setLoc(location || '');
  }, [location]);

  /**
   * Searches for events using the Ticketmaster API
   * @param {string} term - Search term for events
   * @param {string} eventLocation - Location for search
   */
  const searchEvents = async (term, eventLocation) => {
    if (!term.trim() || term.length < 2) {
      setEvents([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('keyword', term);
      params.append('size', '20');
      params.append('sort', 'date,asc');

      if (eventLocation && eventLocation.trim()) {
        params.append('city', eventLocation);
      }

      const response = await fetch(`${BackendURL}/api/TicketMaster/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      console.log('Ticketmaster API Response:', data);

      if (data.success && data.events) {
        setEvents(data.events);
        setShowResults(true);
      } else {
        console.error('No events found or API error:', data.message);
        setEvents([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Error searching events:', error);
      setEvents([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchEvents(search, loc);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, loc]);

  /**
   * Handles search input change
   */
  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearch(newValue);
    if (onSearchChange) onSearchChange(newValue);
  };

  /**
   * Handles location input change
   */
  const handleLocationChange = (e) => {
    const newValue = e.target.value;
    setLoc(newValue);
    if (onLocationChange) onLocationChange(newValue);
  };

  /**
   * Clears the search input
   */
  const handleClear = () => {
    setSearch('');
    setLoc('');
    if (onSearchChange) onSearchChange('');
    if (onLocationChange) onLocationChange('');
    setEvents([]);
    setShowResults(false);
    setExpandedEvent(null);
    inputRef.current?.focus();
  };

  /**
   * Toggles expanded view for an event
   */
  const toggleEventExpansion = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  /**
   * Formats date and time from ISO string
   */
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  /**
   * Gets venue information from event
   */
  const getVenue = (event) => {
    const venue = event._embedded?.venues?.[0];
    if (!venue) return 'Venue TBA';
    let location = venue.name;
    if (venue.city?.name) {
      location += `, ${venue.city.name}`;
    }
    if (venue.state?.stateCode) {
      location += ` ${venue.state.stateCode}`;
    }
    return location;
  };

  /**
   * Gets ticket URL from event
   */
  const getTicketUrl = (event) => {
    return event.url || event.ticketmaster?.ticketsUrl || null;
  };

  /**
   * Gets full venue address from event
   */
  const getFullVenueAddress = (event) => {
    const venue = event._embedded?.venues?.[0];
    if (!venue) return '';
    let address = venue.name || '';
    if (venue.address?.line1) {
      address += `, ${venue.address.line1}`;
    }
    if (venue.city?.name) {
      address += `, ${venue.city.name}`;
    }
    if (venue.state?.stateCode) {
      address += ` ${venue.state.stateCode}`;
    }
    if (venue.postalCode) {
      address += ` ${venue.postalCode}`;
    }
    return address;
  };

  /**
   * Handles selecting an event to use for creating
   */
  const handleUseForEvent = (event) => {
    if (!onEventSelect) return;

    // Parse date and time from ISO string
    let date = '';
    let time = '';
    if (event.dates?.start?.dateTime) {
      const dateObj = new Date(event.dates.start.dateTime);
      date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      time = dateObj.toTimeString().slice(0, 5); // HH:MM
    } else if (event.dates?.start?.localDate) {
      date = event.dates.start.localDate;
      if (event.dates?.start?.localTime) {
        time = event.dates.start.localTime.slice(0, 5);
      }
    }

    const eventData = {
      title: event.name || '',
      date,
      time,
      location: getFullVenueAddress(event),
      description: event.info || event.pleaseNote || ''
    };

    onEventSelect(eventData);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
        <TextField
          inputRef={inputRef}
          label={searchLabel}
          value={search}
          onChange={handleSearchChange}
          onFocus={() => search.length >= 2 && setShowResults(true)}
          onBlur={() => {
            setTimeout(() => setShowResults(false), 200);
          }}
          variant="outlined"
          fullWidth
          sx={{ ...sx, flex: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: '#8e8ea0', mr: 1 }} />,
            endAdornment: (
              <>
                {loading && <CircularProgress size={20} sx={{ color: '#8e8ea0' }} />}
                {search && (
                  <IconButton size="small" onClick={handleClear} sx={{ color: '#8e8ea0' }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            ),
          }}
          placeholder="e.g., 'Taylor Swift', 'NBA Finals', 'concerts'"
        />
        <TextField
          label={locationLabel}
          value={loc}
          onChange={handleLocationChange}
          onFocus={() => search.length >= 2 && setShowResults(true)}
          variant="outlined"
          sx={{ ...sx, flex: 1.5 }}
          InputProps={{
            startAdornment: <LocationOnIcon sx={{ color: '#8e8ea0', mr: 1 }} />,
          }}
          placeholder="e.g., 'New York', 'Los Angeles'"
        />
      </Box>

      {/* Search Results */}
      {showResults && events.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#000' }}>
            Events Found ({events.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {events.map((event) => {
              const ticketUrl = getTicketUrl(event);
              const imageUrl = event.images?.find(img => img.ratio === '16_9')?.url || event.images?.[0]?.url;

              return (
                <Card
                  key={event.id}
                  sx={{
                    display: 'flex',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  {/* Event Image */}
                  {imageUrl && (
                    <Box
                      sx={{
                        width: '250px',
                        minWidth: '250px',
                        height: '200px',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* Event Name */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1.1rem', lineHeight: 1.3 }}>
                      {event.name}
                    </Typography>

                    {/* Date and Time */}
                    {event.dates?.start?.dateTime && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EventIcon sx={{ mr: 1, color: '#8e8ea0', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: '#8e8ea0', fontSize: '0.85rem' }}>
                          {formatDateTime(event.dates.start.dateTime)}
                        </Typography>
                      </Box>
                    )}

                    {/* Venue */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                      <LocationOnIcon sx={{ mr: 1, color: '#8e8ea0', fontSize: 18, mt: 0.3 }} />
                      <Typography variant="body2" sx={{ color: '#8e8ea0', fontSize: '0.85rem' }}>
                        {getVenue(event)}
                      </Typography>
                    </Box>

                    {/* Classifications/Categories */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {event.classifications?.slice(0, 2).map((classification, idx) => (
                        <Chip
                          key={idx}
                          label={classification.segment?.name || classification.genre?.name}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem' }}
                        />
                      ))}
                    </Box>

                    {/* Event Details Button */}
                    {event.priceRanges?.length > 0 && (
                      <Typography variant="body2" sx={{ color: '#ff6b35', fontWeight: 600, fontSize: '0.9rem', mb: 1 }}>
                        From ${event.priceRanges[0].min || 'Contact venue'}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        onClick={() => toggleEventExpansion(event.id)}
                        sx={{
                          fontSize: '0.75rem',
                          textTransform: 'none',
                        }}
                      >
                        {expandedEvent === event.id ? (
                          <>Details <ExpandLessIcon fontSize="small" /></>
                        ) : (
                          <>Details <ExpandMoreIcon fontSize="small" /></>
                        )}
                      </Button>
                      {ticketUrl && (
                        <Button
                          size="small"
                          href={ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            minWidth: 'auto',
                            px: 1,
                          }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </Button>
                      )}
                      {onEventSelect && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleUseForEvent(event)}
                          startIcon={<AddCircleOutlineIcon fontSize="small" />}
                          sx={{
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            bgcolor: '#c5d4b2',
                            color: '#fff',
                            border: '1px solid #c5d4b2',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              bgcolor: '#b8c9a3',
                              borderColor: '#386641',
                            },
                            ml: 'auto',
                          }}
                        >
                          Use for Event
                        </Button>
                      )}
                    </Box>
                  </CardContent>

                  {/* Expanded Details */}
                  <Collapse in={expandedEvent === event.id} sx={{ width: '100%' }}>
                    <Box sx={{ px: 2, pb: 2, bgcolor: '#fafafa', borderTop: '1px solid #e0e0e0' }}>
                      {event.info && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Information
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                            {event.info}
                          </Typography>
                        </Box>
                      )}

                      {event.pleaseNote && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Note
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                            {event.pleaseNote}
                          </Typography>
                        </Box>
                      )}

                      {event._embedded?.attractions && (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Performers
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {event._embedded.attractions.map((attraction, idx) => (
                              <Chip
                                key={idx}
                                label={attraction.name}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {/* No Results Message */}
      {showResults && events.length === 0 && !loading && (
        <Paper
          sx={{
            p: 2,
            mt: 2,
            textAlign: 'center',
            bgcolor: '#f5f5f5',
          }}
        >
          <Typography variant="body2" sx={{ color: '#8e8ea0' }}>
            No events found. Try a different search.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default EventSearch;
