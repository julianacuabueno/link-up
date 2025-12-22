import { Box, Typography, Card, CardContent, Stack, Switch, FormControlLabel } from '@mui/material';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

const Settings = () => {
  const { isDark, toggleTheme, theme } = useTheme();
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
          alignItems: 'center', // centers horizontally
          justifyContent: 'center', // centers vertically
          p: 3,
          width: '100%',
        }}
      >
        <Typography variant="h3" sx={{ mb: 3, fontWeight: 600, color: muiTheme.palette.text.primary, textAlign: 'center' }}>
          Settings
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: muiTheme.palette.text.secondary, textAlign: 'center' }}>
          Manage your account preferences and notifications
        </Typography>

        <Stack spacing={3} sx={{ width: '100%' }}>
          {/* Appearance Settings */}
          <Card sx={{ bgcolor: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: 2, width: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: muiTheme.palette.text.primary }}>
                Appearance
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch checked={isDark} onChange={toggleTheme} />}
                  label="Dark Mode"
                  sx={{ color: muiTheme.palette.text.secondary }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card sx={{ bgcolor: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: 2, width: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: muiTheme.palette.text.primary }}>
                Notifications
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email notifications"
                  sx={{ color: muiTheme.palette.text.secondary }}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Event reminders"
                  sx={{ color: muiTheme.palette.text.secondary }}
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Friend requests"
                  sx={{ color: muiTheme.palette.text.secondary }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card sx={{ bgcolor: muiTheme.palette.background.paper, border: `1px solid ${muiTheme.palette.divider}`, borderRadius: 2, width: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: muiTheme.palette.text.primary }}>
                Privacy
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Profile visibility"
                  sx={{ color: muiTheme.palette.text.secondary }}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Show event attendance"
                  sx={{ color: muiTheme.palette.text.secondary }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Footer />
    </Box>
  );
};

export default Settings;
