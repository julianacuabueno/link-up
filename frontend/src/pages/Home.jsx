import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Badge } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import Footer from '../components/Footer';

const BackendURL = "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [eventDates, setEventDates] = useState(new Set());

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
        const response = await fetch(`${BackendURL}/api/calendar/events${params}`);
        const data = await response.json();

        if (data.success) {
          setEvents(data.data);
          // Create a set of dates that have events
          const dates = new Set(
            data.data.map(event => dayjs(event.start_datetime).format('YYYY-MM-DD'))
          );
          setEventDates(dates);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };

    fetchEvents();
  }, [userEmail]);

  // Get events for the selected date
  const selectedDateEvents = events.filter(event =>
    dayjs(event.start_datetime).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
  );

  // Get upcoming events (next 7 days)
  const upcomingEvents = events.filter(event => {
    const eventDate = dayjs(event.start_datetime);
    const now = dayjs();
    return eventDate.isAfter(now) && eventDate.isBefore(now.add(7, 'day'));
  });

  // Custom day component to show dots on days with events
  const ServerDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dateStr = day.format('YYYY-MM-DD');
    const hasEvent = eventDates.has(dateStr);

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={hasEvent ? '•' : undefined}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '1.2rem',
            color: '#386641',
            top: 8,
            right: 8,
          }
        }}
      >
        <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
      </Badge>
    );
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '100%' }}>
      <Box>
        {/* Title and description at top */}
        <Typography variant="h3" sx={{ color: 'black', mb: 3, fontWeight: 600 }}>
          Welcome to Link-Up 🔗‍️
        </Typography>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          Make plans with ease. Connect with friends and organize events effortlessly. ✎𓂃
        </Typography>

        <Grid container spacing={3}>
          {/* Left side: Upcoming Events */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: '#c5d4b2',
                border: '1px solid #c5d4b2',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#000', mb: 1, fontWeight: 600 }}>
                  Upcoming Events
                </Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  You have {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''} coming up this week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Calendar */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: '#c5d4b2',
                border: '1px solid #c5d4b2',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#000', mb: 2, fontWeight: 600, textAlign: 'center' }}>
                  Calendar
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slots={{
                      day: ServerDay
                    }}
                    sx={{
                      bgcolor: '#c5d4b2',
                      color: '#000',
                      '& .MuiPickersCalendarHeader-root': {
                        color: '#000',
                      },
                      '& .MuiDayCalendar-weekDayLabel': {
                        color: '#333',
                      },
                      '& .MuiPickersDay-root': {
                        color: '#000',
                        '&:hover': {
                          bgcolor: '#b8c9a3',
                        },
                        '&.Mui-selected': {
                          bgcolor: '#386641',
                          color: '#fff',
                          '&:hover': {
                            bgcolor: '#2d4d30',
                          },
                        },
                      },
                      '& .MuiPickersYear-yearButton': {
                        color: '#000',
                        '&:hover': {
                          bgcolor: '#b8c9a3',
                        },
                        '&.Mui-selected': {
                          bgcolor: '#386641',
                          color: '#fff',
                        },
                      },
                      '& .MuiIconButton-root': {
                        color: '#000',
                      },
                    }}
                  />
                </LocalizationProvider>
              </CardContent>
            </Card>
          </Grid>

          {/* Right side: Events on selected date */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: '#c5d4b2',
                border: '1px solid #c5d4b2',
                borderRadius: 2,
                minHeight: 200,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#000', mb: 2, fontWeight: 600 }}>
                  📆 Today, {selectedDate.format('MMM D, YYYY')}
                </Typography>

                {selectedDateEvents.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    No events scheduled for this day
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedDateEvents.map((event) => (
                      <Box
                        key={event.id}
                        sx={{
                          p: 2,
                          bgcolor: '#c5d4b2',
                          borderRadius: 1,
                          borderLeft: '4px solid #386641'
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ color: '#000', fontWeight: 600 }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#333' }}>
                          {formatTime(event.start_datetime)}
                          {event.location && ` • ${event.location}`}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
