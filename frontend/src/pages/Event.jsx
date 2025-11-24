import { Box, Typography, Card, CardContent, Stack, Chip } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Footer from '../components/Footer';

const Event = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Team Lunch',
      date: '2025-11-28',
      time: '12:00 PM',
      location: 'Downtown Cafe',
      attendees: 5,
    },
    {
      id: 2,
      title: 'Movie Night',
      date: '2025-11-30',
      time: '7:00 PM',
      location: 'Cinema Plaza',
      attendees: 8,
    },
    {
      id: 3,
      title: 'Weekend Hike',
      date: '2025-12-02',
      time: '9:00 AM',
      location: 'Mountain Trail',
      attendees: 12,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
          Upcoming Events
        </Typography>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          View and manage your upcoming events and activities
        </Typography>

        <Stack spacing={3}>
        {upcomingEvents.map((event) => (
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
                <Chip
                  label={`${event.attendees} attending`}
                  size="small"
                  sx={{
                    bgcolor: '#4a90e2',
                    color: '#fff',
                  }}
                />
              </Box>

              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ color: '#8e8ea0', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#b0b0c0' }}>
                    {event.date}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon sx={{ color: '#8e8ea0', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#b0b0c0' }}>
                    {event.time}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon sx={{ color: '#8e8ea0', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#b0b0c0' }}>
                    {event.location}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Event;