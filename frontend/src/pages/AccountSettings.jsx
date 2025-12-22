import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Avatar,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import GoogleIcon from '@mui/icons-material/Google';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import Footer from '../components/Footer';

const BackendURL = "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com";

const AccountSettings = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: 'User',
    lastName: 'Name',
    email: 'user@email.com',
    phone: '',
    bio: '',
    location: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  // Check for OAuth callback result
  useEffect(() => {
    const authResult = searchParams.get('auth');
    const email = searchParams.get('email');

    if (authResult === 'success' && email) {
      localStorage.setItem('userEmail', email);
      setAuthMessage({ type: 'success', text: 'Successfully connected to Google Calendar!' });
      checkGoogleAuth(email);
      // Clean up URL
      window.history.replaceState({}, '', '/account-settings');
    } else if (authResult === 'error') {
      setAuthMessage({ type: 'error', text: 'Failed to connect to Google Calendar. Please try again.' });
      window.history.replaceState({}, '', '/account-settings');
    } else {
      // Check if already authenticated
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        checkGoogleAuth(storedEmail);
      }
    }
  }, [searchParams]);

  const checkGoogleAuth = async (email) => {
    try {
      const response = await fetch(`${BackendURL}/api/auth/status?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.success && data.authenticated) {
        setGoogleUser(data.user);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const handleGoogleConnect = async () => {
    setGoogleLoading(true);
    try {
      const response = await fetch(`${BackendURL}/api/auth/google`);
      const data = await response.json();

      if (data.success && data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setAuthMessage({ type: 'error', text: 'Failed to start Google authentication' });
      }
    } catch (err) {
      console.error('Error connecting to Google:', err);
      setAuthMessage({ type: 'error', text: 'Failed to connect to Google' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    const email = localStorage.getItem('userEmail');

    try {
      await fetch(`${BackendURL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      localStorage.removeItem('userEmail');
      setGoogleUser(null);
      setAuthMessage({ type: 'success', text: 'Disconnected from Google Calendar' });
    } catch (err) {
      console.error('Error disconnecting:', err);
      setAuthMessage({ type: 'error', text: 'Failed to disconnect' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData({
      firstName: 'User',
      lastName: 'Name',
      email: 'user@email.com',
      phone: '',
      bio: '',
      location: '',
    });
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      color: '#000',
      '& fieldset': {
        borderColor: '#4a4a5e',
      },
      '&:hover fieldset': {
        borderColor: '#6a6a7e',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#386641',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#8e8ea0',
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ color: '#000', mb: 3, fontWeight: 600 }}>
          Account Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#333', mb: 4 }}>
          Manage your account information and preferences
        </Typography>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3, maxWidth: 700 }}>
            Settings saved successfully!
          </Alert>
        )}

        {authMessage && (
          <Alert severity={authMessage.type} sx={{ mb: 3, maxWidth: 700 }} onClose={() => setAuthMessage(null)}>
            {authMessage.text}
          </Alert>
        )}

        {/* Google Calendar Integration Section */}
        <Card
          sx={{
            bgcolor: '#c5d4b2',
            border: '1px solid #c5d4b2',
            borderRadius: 2,
            mb: 3,
            maxWidth: 700,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#000', mb: 2, fontWeight: 600 }}>
              Google Calendar Integration
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', mb: 3 }}>
              Connect your Google account to sync events with Google Calendar
            </Typography>

            {googleUser ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={googleUser.picture}
                    alt={googleUser.name}
                    sx={{ width: 48, height: 48 }}
                  />
                  <Box>
                    <Typography sx={{ color: '#000', fontWeight: 600 }}>
                      {googleUser.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      {googleUser.email}
                    </Typography>
                  </Box>
                  <Chip
                    label="Connected"
                    size="small"
                    sx={{ bgcolor: '#4caf50', color: '#fff', ml: 'auto' }}
                  />
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<LinkOffIcon />}
                  onClick={handleGoogleDisconnect}
                  sx={{
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#f44336',
                      bgcolor: 'rgba(211, 47, 47, 0.1)',
                    },
                  }}
                >
                  Disconnect Google Account
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={googleLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                onClick={handleGoogleConnect}
                disabled={googleLoading}
                sx={{
                  bgcolor: '#386641',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: '#2d4d30',
                  },
                }}
              >
                {googleLoading ? 'Connecting...' : 'Connect with Google'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Profile Picture Section */}
        <Card
          sx={{
            bgcolor: '#c5d4b2',
            border: '1px solid #c5d4b2',
            borderRadius: 2,
            mb: 3,
            maxWidth: 700,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#000', mb: 3, fontWeight: 600 }}>
              Profile Picture
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={googleUser?.picture}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#4a90e2',
                  fontSize: '2rem',
                }}
              >
                {googleUser?.name?.[0] || 'U'}
              </Avatar>
              <Box>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#386641',
                    color: '#fff',
                    textTransform: 'none',
                    mb: 1,
                    '&:hover': {
                      bgcolor: '#2d4d30',
                    },
                  }}
                >
                  Upload New Photo
                </Button>
                <Typography variant="body2" sx={{ color: '#8e8ea0', fontSize: '0.875rem' }}>
                  JPG, PNG or GIF. Max size 2MB.
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information Section */}
        <Card
          sx={{
            bgcolor: '#c5d4b2',
            border: '1px solid #c5d4b2',
            borderRadius: 2,
            mb: 3,
            maxWidth: 700,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#000', mb: 3, fontWeight: 600 }}>
              Personal Information
            </Typography>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  sx={inputStyles}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  variant="outlined"
                  fullWidth
                  sx={inputStyles}
                />
              </Box>

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                sx={inputStyles}
              />

              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                sx={inputStyles}
              />

              <TextField
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                sx={inputStyles}
              />

              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                variant="outlined"
                fullWidth
                sx={inputStyles}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Security Settings Section */}
        <Card
          sx={{
            bgcolor: '#c5d4b2',
            border: '1px solid #c5d4b2',
            borderRadius: 2,
            mb: 3,
            maxWidth: 700,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#000', mb: 3, fontWeight: 600 }}>
              Change Password
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                variant="outlined"
                fullWidth
                sx={inputStyles}
              />

              <TextField
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                variant="outlined"
                fullWidth
                sx={inputStyles}
              />

              <TextField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                variant="outlined"
                fullWidth
                sx={inputStyles}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Account Management Section */}
        <Card
          sx={{
            bgcolor: '#c5d4b2',
            border: '1px solid #c5d4b2',
            borderRadius: 2,
            mb: 3,
            maxWidth: 700,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#000', mb: 2, fontWeight: 600 }}>
              Account Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#333', mb: 2 }}>
              Permanently delete your account and all associated data
            </Typography>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#d32f2f',
                color: '#d32f2f',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#f44336',
                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                },
              }}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Save/Cancel Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, maxWidth: 700 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              bgcolor: '#386641',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                bgcolor: '#2d4d30',
              },
            }}
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            sx={{
              borderColor: '#4a4a5e',
              color: '#b0b0c0',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                borderColor: '#6a6a7e',
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default AccountSettings;
