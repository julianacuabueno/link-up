import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '100%' }}>
      <Box>
        <Typography variant="h3" sx={{ color: 'black', mb: 3, fontWeight: 600 }}>
          Welcome to Link-Up
        </Typography>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          Make plans with ease. Connect with friends and organize events effortlessly.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
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
                  You have 3 events coming up this week
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: '#2a2a3e',
                border: '1px solid #3a3a4e',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Typography variant="body2" sx={{ color: '#8e8ea0' }}>
                  Create a new event or invite friends
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: '#2a2a3e',
                border: '1px solid #3a3a4e',
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                  Recent Activity
                </Typography>
                <Typography variant="body2" sx={{ color: '#8e8ea0' }}>
                  See what your friends are planning
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Card
            sx={{
              bgcolor: '#2a2a3e',
              border: '1px solid #3a3a4e',
              borderRadius: 2,
              maxWidth: 'fit-content',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600, textAlign: 'center' }}>
                Calendar
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
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
        </Box>
        
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;