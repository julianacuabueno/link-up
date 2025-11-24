import { Box, Typography, Card, CardContent, Stack, Switch, FormControlLabel } from '@mui/material';
import Footer from '../components/Footer';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h3" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>
      <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
        Manage your account preferences and notifications
      </Typography>

      <Stack spacing={3} sx={{ maxWidth: 600 }}>
        <Card
          sx={{
            bgcolor: '#2a2a3e',
            border: '1px solid #3a3a4e',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
              Notifications
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email notifications"
                sx={{ color: '#b0b0c0' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Event reminders"
                sx={{ color: '#b0b0c0' }}
              />
              <FormControlLabel
                control={<Switch />}
                label="Friend requests"
                sx={{ color: '#b0b0c0' }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            bgcolor: '#2a2a3e',
            border: '1px solid #3a3a4e',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
              Privacy
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Profile visibility"
                sx={{ color: '#b0b0c0' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show event attendance"
                sx={{ color: '#b0b0c0' }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
      <Footer/>
    </Box>
  );
};

export default Settings;
