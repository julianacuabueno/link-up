// Home.jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import Footer from '../components/Footer';

const BackendURL = 'https://guno6rd8a7.execute-api.us-west-2.amazonaws.com';

const Home = () => {
  const theme = useTheme();

  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [eventDates, setEventDates] = useState(new Set());

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = userEmail ? `?email=${encodeURIComponent(userEmail)}` : '';
        const res = await fetch(`${BackendURL}/api/calendar/events${params}`);
        const data = await res.json();

        if (data.success) {
          setEvents(data.data);
          setEventDates(
            new Set(
              data.data.map(e =>
                dayjs(e.start_datetime).format('YYYY-MM-DD')
              )
            )
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchEvents();
  }, [userEmail]);

  const selectedDateEvents = events.filter(e =>
    dayjs(e.start_datetime).isSame(selectedDate, 'day')
  );

  const upcomingEvents = events.filter(e =>
    dayjs(e.start_datetime).isAfter(dayjs()) &&
    dayjs(e.start_datetime).isBefore(dayjs().add(7, 'day'))
  );

  // Custom day component with event badges
  const ServerDay = ({ day, outsideCurrentMonth, ...other }) => {
    const hasEvent = eventDates.has(day.format('YYYY-MM-DD'));

    return (
      <Badge
        overlap="circular"
        badgeContent={hasEvent ? '•' : null}
        sx={{
          '& .MuiBadge-badge': {
            color: theme.palette.secondary.main,
            fontSize: '1.2rem',
            color: '#4a90e2',
            top: 8,
            right: 8,
          }
        }}
      >
        <PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
      </Badge>
    );
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '100%' }}>
      <Box>
        <Typography variant="h3" sx={{ color: 'black', mb: 3, fontWeight: 600 }}>
          Welcome to Link-Up
        </Typography>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          Make plans with ease. Connect with friends and organize events effortlessly.
        </Typography>
      </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: '#2a2a3e',
                border: '1px solid #3a3a4e',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                  Upcoming Events
                </Typography>
                <Typography variant="body2" sx={{ color: '#8e8ea0' }}>
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
                bgcolor: '#2a2a3e',
                border: '1px solid #3a3a4e',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600, textAlign: 'center' }}>
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
                      bgcolor: '#2a2a3e',
                      color: '#fff',
                      '& .MuiPickersCalendarHeader-root': {
                        color: '#fff',
                      },
                      '& .MuiDayCalendar-weekDayLabel': {
                        color: '#8e8ea0',
                      },
                      '& .MuiPickersDay-root': {
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#3a3a4e',
                        },
                        '&.Mui-selected': {
                          bgcolor: '#646cff',
                          '&:hover': {
                            bgcolor: '#535bf2',
                          },
                        },
                      },
                      '& .MuiPickersYear-yearButton': {
                        color: '#fff',
                        '&:hover': {
                          bgcolor: '#3a3a4e',
                        },
                        '&.Mui-selected': {
                          bgcolor: '#646cff',
                        },
                      },
                      '& .MuiIconButton-root': {
                        color: '#fff',
                      },
                    }}
                  />
                </LocalizationProvider>
              </CardContent>
            </Card>
          </Grid>

          {/* Events for selected date */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: '#2a2a3e',
                border: '1px solid #3a3a4e',
                borderRadius: 2,
                minHeight: 400,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                  Events on {selectedDate.format('MMM D, YYYY')}
                </Typography>

                {selectedDateEvents.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#8e8ea0' }}>
                    No events scheduled for this day
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedDateEvents.map((event) => (
                      <Box
                        key={event.id}
                        sx={{
                          p: 2,
                          bgcolor: '#3a3a4e',
                          borderRadius: 1,
                          borderLeft: '4px solid #4a90e2'
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8e8ea0' }}>
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

      <Footer />
    </Box>
  );
};

export default Home;
