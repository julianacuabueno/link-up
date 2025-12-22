import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Rating,
  Divider,
  Collapse,
  Button
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';

const BackendURL = "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com";

/**
 * PlaceSearch component that integrates with Yelp API for location search
 * Displays places with reviews and ratings
 * @param {Object} props - Component props
 * @param {string} props.value - Current location value
 * @param {function} props.onChange - Callback when location changes
 * @param {string} props.label - Label for the text field
 * @param {Object} props.sx - Additional styles for the text field
 */
const PlaceSearch = ({ value, onChange, label = "Search for places", sx = {} }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [expandedPlace, setExpandedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState({});
  const inputRef = useRef(null);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  /**
   * Searches for places using the Yelp API
   * Supports queries like "pizza in New York" or "bars near me"
   * @param {string} term - Search term for places
   */
  const searchPlaces = async (term) => {
    if (!term.trim() || term.length < 2) {
      setPlaces([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      // Parse the search term to extract location
      // Support queries like "pizza in New York", "bars near San Francisco", etc.
      const locationKeywords = [' in ', ' near ', ' at ', ' around ', ' by '];
      let searchTerm = term;
      let location = '';

      // Find the first location keyword and split the query
      for (const keyword of locationKeywords) {
        const index = term.toLowerCase().indexOf(keyword);
        if (index !== -1) {
          searchTerm = term.substring(0, index).trim();
          location = term.substring(index + keyword.length).trim();
          break;
        }
      }

      // If no location keyword found, use the entire term as search term
      // and try to get user's location or use a default
      if (!location) {
        searchTerm = term;
        // For location-based searches, we could get user's geolocation
        // For now, we'll let Yelp handle locationless searches
      }

      // Build query parameters
      const params = new URLSearchParams();
      params.append('term', searchTerm);
      params.append('limit', '10');
      params.append('sort_by', 'rating');

      if (location) {
        params.append('location', location);
      }

      const response = await fetch(`${BackendURL}/api/yelp/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.businesses) {
        setPlaces(data.businesses);
        setShowResults(true);
      } else {
        setPlaces([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setPlaces([]);
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  /**
   * Handles selection of a place from search results
   * @param {Object} business - Selected business from Yelp
   */
  const handleSelectPlace = (business) => {
    const locationString = `${business.name}, ${business.location.address1 || ''} ${business.location.city}, ${business.location.state} ${business.location.zip_code || ''}`.trim();
    setSearchTerm(locationString);
    onChange(locationString);
    setShowResults(false);
    setSelectedIndex(-1);
    setExpandedPlace(null);
  };

  /**
   * Handles input change
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setSelectedIndex(-1);
    setExpandedPlace(null);
  };

  /**
   * Handles keyboard navigation
   * @param {Event} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (!showResults || places.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < places.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < places.length) {
          handleSelectPlace(places[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        setExpandedPlace(null);
        break;
    }
  };

  /**
   * Toggles expanded view for a place to show reviews
   * @param {string} placeId - ID of the place to expand
   */
  const togglePlaceExpansion = async (placeId) => {
    if (expandedPlace === placeId) {
      setExpandedPlace(null);
      return;
    }

    setExpandedPlace(placeId);

    // Fetch place details and reviews if not already cached
    if (!placeDetails[placeId]) {
      try {
        const response = await fetch(`${BackendURL}/api/yelp/business/${placeId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setPlaceDetails(prev => ({
            ...prev,
            [placeId]: {
              business: data.business,
              reviews: data.reviews
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    }
  };

  /**
   * Clears the search input
   */
  const handleClear = () => {
    setSearchTerm('');
    onChange('');
    setPlaces([]);
    setShowResults(false);
    setSelectedIndex(-1);
    setExpandedPlace(null);
    setPlaceDetails({});
    inputRef.current?.focus();
  };

  /**
   * Formats price range display
   * @param {string} price - Price string from Yelp
   * @returns {string} Formatted price display
   */
  const formatPrice = (price) => {
    if (!price) return '';
    return price.replace(/\$/g, '💰');
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        inputRef={inputRef}
        label={label}
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
        onBlur={() => {
          // Delay hiding results to allow for clicks
          setTimeout(() => setShowResults(false), 200);
        }}
        variant="outlined"
        fullWidth
        sx={sx}
        InputProps={{
          startAdornment: <SearchIcon sx={{ color: '#8e8ea0', mr: 1 }} />,
          endAdornment: (
            <>
              {loading && <CircularProgress size={20} sx={{ color: '#8e8ea0' }} />}
              {searchTerm && (
                <IconButton size="small" onClick={handleClear} sx={{ color: '#8e8ea0' }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </>
          ),
        }}
        placeholder="Search for places (e.g., 'pizza in New York' or 'bars near me')"
      />

      {/* Search Results */}
      {showResults && places.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 600,
            overflow: 'auto',
            mt: 0.5,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
        >
          <List dense>
            {places.map((place, index) => (
              <Box key={place.id}>
                <ListItem
                  button
                  onClick={() => handleSelectPlace(place)}
                  sx={{
                    bgcolor: selectedIndex === index ? '#f5f5f5' : 'transparent',
                    '&:hover': {
                      bgcolor: '#f0f0f0',
                    },
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    py: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, color: '#8e8ea0', fontSize: 20 }} />
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {place.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ color: '#8e8ea0' }}>
                          {place.location.address1 && `${place.location.address1}, `}
                          {place.location.city}, {place.location.state}
                          {place.location.zip_code && ` ${place.location.zip_code}`}
                        </Typography>
                      }
                    />
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating
                        value={place.rating}
                        readOnly
                        size="small"
                        precision={0.5}
                        sx={{ color: '#ff6b35' }}
                      />
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        ({place.review_count})
                      </Typography>
                      {place.price && (
                        <Chip
                          label={formatPrice(place.price)}
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                    {place.categories?.slice(0, 3).map((category, catIndex) => (
                      <Chip
                        key={catIndex}
                        label={category.title}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlaceExpansion(place.id);
                      }}
                      sx={{
                        ml: 'auto',
                        minWidth: 'auto',
                        px: 1,
                        fontSize: '0.7rem'
                      }}
                    >
                      {expandedPlace === place.id ? (
                        <>Hide Reviews <ExpandLessIcon fontSize="small" /></>
                      ) : (
                        <>Show Reviews <ExpandMoreIcon fontSize="small" /></>
                      )}
                    </Button>
                  </Box>
                </ListItem>

                {/* Expanded reviews section */}
                <Collapse in={expandedPlace === place.id}>
                  <Box sx={{ px: 2, pb: 2, bgcolor: '#fafafa' }}>
                    {placeDetails[place.id] ? (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontSize: '0.9rem' }}>
                          Recent Reviews
                        </Typography>
                        {placeDetails[place.id].reviews?.map((review, reviewIndex) => (
                          <Box key={reviewIndex} sx={{ mb: 2, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Rating value={review.rating} readOnly size="small" sx={{ color: '#ff6b35' }} />
                              <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                                by {review.user.name}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              "{review.text}"
                            </Typography>
                          </Box>
                        ))}
                        {(!placeDetails[place.id].reviews || placeDetails[place.id].reviews.length === 0) && (
                          <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                            No reviews available
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                          Loading reviews...
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Collapse>

                {index < places.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default PlaceSearch;