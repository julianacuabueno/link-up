import { Box, Typography, Card, CardContent } from '@mui/material';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

const About = () => {
  const { theme } = useTheme();
  const muiTheme = getTheme(theme);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: muiTheme.palette.background.default,
        color: muiTheme.palette.text.primary,
      }}
    >
      {/* Centered container */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // horizontal center
          justifyContent: 'center', // vertical center
          p: 3,
          width: '100%',
        }}
      >
        <Typography
          variant="h3"
          sx={{ mb: 3, fontWeight: 600, color: muiTheme.palette.text.primary, textAlign: 'center' }}
        >
          About Link-Up 🔗‍️
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, color: muiTheme.palette.text.secondary, textAlign: 'center' }}
        >
          Learn more about our platform
        </Typography>

        <Card
          sx={{
            bgcolor: muiTheme.palette.background.paper,
            border: `1px solid ${muiTheme.palette.divider}`,
            borderRadius: 2,
            width: '100%',
            maxWidth: 700, // keeps it readable on huge screens
            p: 2,
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              sx={{ color: muiTheme.palette.text.primary, mb: 3, fontWeight: 600 }}
            >
              Making Plans Simple
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: muiTheme.palette.text.secondary, mb: 2, lineHeight: 1.8 }}
            >
              Link-Up is your go-to platform for organizing events and connecting with friends.
              Whether you're planning a casual meetup or a large gathering, we make it easy to
              coordinate schedules and keep everyone in the loop.
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: muiTheme.palette.text.secondary, mb: 2, lineHeight: 1.8 }}
            >
              Our mission is to bring people together by simplifying the event planning process.
              No more endless group chats or confusion about who's coming - everything you need
              is right here.
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: muiTheme.palette.text.secondary, lineHeight: 1.8 }}
            >
              Join thousands of users who are already making plans with ease. Start creating
              memorable experiences today!
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Footer />
    </Box>
  );
};

export default About;
