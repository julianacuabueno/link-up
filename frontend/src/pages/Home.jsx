import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
          Welcome to Link-Up
        </Typography>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          Make plans with ease. Connect with friends and organize events effortlessly.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
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

          <Grid item xs={12} md={6} lg={4}>
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

          <Grid item xs={12} md={6} lg={4}>
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
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;