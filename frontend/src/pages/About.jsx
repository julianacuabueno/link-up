import { Box, Typography, Card, CardContent } from '@mui/material';
import Footer from '../components/Footer';

const About = () => {
  return (
    <Box>
      <Typography variant="h3" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
        About Link-Up
      </Typography>
      <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
        Learn more about our platform
      </Typography>

      <Card
        sx={{
          bgcolor: '#2a2a3e',
          border: '1px solid #3a3a4e',
          borderRadius: 2,
          maxWidth: 700,
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
            Making Plans Simple
          </Typography>

          <Typography variant="body1" sx={{ color: '#b0b0c0', mb: 2, lineHeight: 1.8 }}>
            Link-Up is your go-to platform for organizing events and connecting with friends.
            Whether you're planning a casual meetup or a large gathering, we make it easy to
            coordinate schedules and keep everyone in the loop.
          </Typography>

          <Typography variant="body1" sx={{ color: '#b0b0c0', mb: 2, lineHeight: 1.8 }}>
            Our mission is to bring people together by simplifying the event planning process.
            No more endless group chats or confusion about who's coming - everything you need
            is right here.
          </Typography>

          <Typography variant="body1" sx={{ color: '#b0b0c0', lineHeight: 1.8 }}>
            Join thousands of users who are already making plans with ease. Start creating
            memorable experiences today!
          </Typography>
        </CardContent>
      </Card>
      <Footer/>
    </Box>
    
  );
};

export default About;
