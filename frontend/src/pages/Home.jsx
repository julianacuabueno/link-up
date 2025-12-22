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
            top: 6,
            right: 6,
          },
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
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h3" color="text.primary" gutterBottom>
          Welcome to Link-Up
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Make plans with ease. Connect and organize effortlessly.
        </Typography>
      </Box>

      {/* Upcoming Events */}
      <Grid container justifyContent="center" spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Upcoming Events
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You have {upcomingEvents.length} event
                {upcomingEvents.length !== 1 && 's'} coming up this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calendar + Events */}
      <Grid container justifyContent="center" spacing={3} sx={{ mt: 2 }}>
        {/* Calendar */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center" color="text.primary" gutterBottom>
                Calendar
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  slots={{ day: ServerDay }}
                />
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>

        {/* Selected Date Events */}
        <Grid item xs={12} md={6}>
          <Card sx={{ minHeight: 400 }}>
            <CardContent>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Events on {selectedDate.format('MMM D, YYYY')}
              </Typography>

              {selectedDateEvents.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No events scheduled for this day
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedDateEvents.map(event => (
                    <Box
                      key={event.id}
                      sx={{
                        p: 2,
                        borderLeft: `4px solid ${theme.palette.secondary.main}`,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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