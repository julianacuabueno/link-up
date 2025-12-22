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
  Button,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ClearIcon from '@mui/icons-material/Clear';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const BackendURL = "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com";

/**
 * PlaceSearch component that integrates with Yelp API for location search
 * Displays places with reviews and ratings
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Search term (e.g., "pizza")
 * @param {function} props.onSearchChange - Callback when search term changes
 * @param {string} props.location - Location value (e.g., "New York")
 * @param {function} props.onLocationChange - Callback when location changes
 * @param {string} props.searchLabel - Label for the search field
 * @param {string} props.locationLabel - Label for the location field
 * @param {Object} props.sx - Additional styles for the text fields
 * @param {function} props.onPlaceSelect - Callback when user selects a place to use for creating an event
 */
const PlaceSearch = ({
  searchTerm = '',
  onSearchChange,
  location = '',
  onLocationChange,
  searchLabel = "Search for places",
  locationLabel = "Location",
  sx = {},
  onPlaceSelect
}) => {
  const [search, setSearch] = useState(searchTerm || '');
  const [loc, setLoc] = useState(location || '');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [expandedPlace, setExpandedPlace] = useState(null);
  const [placeDetails, setPlaceDetails] = useState({});
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
   * Searches for places using the Yelp API
   * @param {string} term - Search term for places
   * @param {string} searchLocation - Location for search
   */
  const searchPlaces = async (term, searchLocation) => {
    if (!term.trim() || term.length < 2) {
      setPlaces([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('term', term);
      params.append('limit', '10');
      params.append('sort_by', 'rating');

      if (searchLocation && searchLocation.trim()) {
        params.append('location', searchLocation);
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
      searchPlaces(search, loc);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, loc]);

  /**
   * Handles selection of a place from search results
   * @param {Object} business - Selected business from Yelp
   */
  const handleSelectPlace = (business) => {
    const locationString = `${business.name}, ${business.location.address1 || ''} ${business.location.city}, ${business.location.state} ${business.location.zip_code || ''}`.trim();
    setSearch('');
    setLoc('');
    if (onSearchChange) onSearchChange('');
    if (onLocationChange) onLocationChange('');
    setShowResults(false);
    setSelectedIndex(-1);
    setExpandedPlace(null);
  };

  /**
   * Handles search input change
   */
  const handleSearchChange = (e) => {
    const newValue = e.target.value;
    setSearch(newValue);
    if (onSearchChange) onSearchChange(newValue);
    setSelectedIndex(-1);
    setExpandedPlace(null);
  };

  /**
   * Handles location input change
   */
  const handleLocationChange = (e) => {
    const newValue = e.target.value;
    setLoc(newValue);
    if (onLocationChange) onLocationChange(newValue);
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
    setSearch('');
    setLoc('');
    if (onSearchChange) onSearchChange('');
    if (onLocationChange) onLocationChange('');
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

  /**
   * Handles selecting a place to use for creating an event
   * @param {Object} place - Selected place from Yelp
   */
  const handleUseForEvent = (place) => {
    if (!onPlaceSelect) return;

    // Build full address
    const addressParts = [];
    if (place.location?.address1) addressParts.push(place.location.address1);
    if (place.location?.city) addressParts.push(place.location.city);
    if (place.location?.state) addressParts.push(place.location.state);
    if (place.location?.zip_code) addressParts.push(place.location.zip_code);
    const fullAddress = addressParts.join(', ');

    // Build description from categories
    const categoryNames = place.categories?.map(cat => cat.title).join(', ') || '';
    const description = categoryNames ? `${place.name} - ${categoryNames}` : place.name;

    const placeData = {
      title: place.name || '',
      date: '', // Yelp places don't have event dates
      time: '', // Yelp places don't have event times
      location: fullAddress,
      description
    };

    onPlaceSelect(placeData);
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
          placeholder="e.g., 'pizza', 'bars', 'restaurants'"
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
          placeholder="e.g., 'New York', 'San Francisco'"
        />
      </Box>

      {/* Search Results */}
      {showResults && places.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#000' }}>
            Search Results ({places.length})
          </Typography>
          <Grid container spacing={3}>
            {places.map((place, index) => (
              <Grid item xs={12} md={4} key={place.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    bgcolor: selectedIndex === index ? '#f5f5f5' : '#fff',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                  onClick={() => handleSelectPlace(place)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <LocationOnIcon sx={{ mr: 1, color: '#8e8ea0', fontSize: 20, mt: 0.5 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5 }}>
                          {place.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8e8ea0', fontSize: '0.85rem' }}>
                          {place.location.address1 && `${place.location.address1}, `}
                          {place.location.city}, {place.location.state}
                          {place.location.zip_code && ` ${place.location.zip_code}`}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
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
                          sx={{ fontSize: '0.7rem', ml: 'auto' }}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {place.categories?.slice(0, 3).map((category, catIndex) => (
                        <Chip
                          key={catIndex}
                          label={category.title}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem' }}
                        />
                      ))}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
                    <Button
                      fullWidth
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlaceExpansion(place.id);
                      }}
                      sx={{
                        fontSize: '0.75rem',
                        textTransform: 'none',
                      }}
                    >
                      {expandedPlace === place.id ? (
                        <>Hide Reviews <ExpandLessIcon fontSize="small" /></>
                      ) : (
                        <>Show Reviews <ExpandMoreIcon fontSize="small" /></>
                      )}
                    </Button>
                    {onPlaceSelect && (
                      <Button
                        fullWidth
                        size="small"
                        variant="contained"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseForEvent(place);
                        }}
                        startIcon={<AddCircleOutlineIcon fontSize="small" />}
                        sx={{
                          fontSize: '0.75rem',
                          textTransform: 'none',
                          bgcolor: '#2a2a3e',
                          color: '#fff',
                          border: '1px solid #3a3a4e',
                          whiteSpace: 'nowrap',
                          '&:hover': {
                            bgcolor: '#3a3a4e',
                            borderColor: '#4a90e2',
                          },
                        }}
                      >
                        Use for Event
                      </Button>
                    )}
                  </CardActions>

                  {/* Expanded reviews section */}
                  <Collapse in={expandedPlace === place.id}>
                    <Box sx={{ px: 2, pb: 2, bgcolor: '#fafafa', borderTop: '1px solid #e0e0e0' }}>
                      {placeDetails[place.id] ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, mt: 1, fontWeight: 600 }}>
                            Recent Reviews
                          </Typography>
                          {placeDetails[place.id].reviews?.map((review, reviewIndex) => (
                            <Box key={reviewIndex} sx={{ mb: 1.5, p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Rating value={review.rating} readOnly size="small" sx={{ color: '#ff6b35' }} />
                                <Typography variant="caption" sx={{ ml: 1, color: '#666' }}>
                                  by {review.user.name}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}>
                                "{review.text}"
                              </Typography>
                            </Box>
                          ))}
                          {(!placeDetails[place.id].reviews || placeDetails[place.id].reviews.length === 0) && (
                            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.8rem' }}>
                              No reviews available
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                          <CircularProgress size={20} />
                          <Typography variant="body2" sx={{ ml: 1, color: '#666' }}>
                            Loading reviews...
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default PlaceSearch;