import { Box, Typography, Card, CardContent, Stack, Switch, FormControlLabel } from '@mui/material';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ color: 'black', mb: 3, fontWeight: 600 }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          Manage your account preferences and notifications
        </Typography>

        <Stack spacing={3} sx={{ maxWidth: 600 }}>
        {/* Appearance Settings */}
        <Card
          sx={{
            bgcolor: '#c5d4b2',
            border: '1px solid #c5d4b2',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#000', mb: 2, fontWeight: 600 }}>
              Appearance
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch checked={isDark} onChange={toggleTheme} />}
                label="Dark Mode"
                sx={{ color: '#000' }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card
          sx={{
            bgcolor: '#c5d4b2',
            border: '1px solid #c5d4b2',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#000', mb: 2, fontWeight: 600 }}>
              Notifications
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email notifications"
                sx={{ color: '#000' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Event reminders"
                sx={{ color: '#000' }}
              />
              <FormControlLabel
                control={<Switch />}
                label="Friend requests"
                sx={{ color: '#000' }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card
          sx={{
            bgcolor: '#c5d4b2',
            border: '1px solid #c5d4b2',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#000', mb: 2, fontWeight: 600 }}>
              Privacy
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Profile visibility"
                sx={{ color: '#000' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Show event attendance"
                sx={{ color: '#000' }}
              />
            </Stack>
          </CardContent>
        </Card>
        </Stack>
      </Box>
      <Footer/>
    </Box>
  );
};

export default Settings;
