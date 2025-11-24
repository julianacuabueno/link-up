import { useState } from 'react';
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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Footer from '../components/Footer';

const AccountSettings = () => {
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
    // TODO: Add API call to save settings
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
      color: '#fff',
      '& fieldset': {
        borderColor: '#4a4a5e',
      },
      '&:hover fieldset': {
        borderColor: '#6a6a7e',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#4a90e2',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#8e8ea0',
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
          Account Settings
        </Typography>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          Manage your account information and preferences
        </Typography>

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3, maxWidth: 700 }}>
            Settings saved successfully!
          </Alert>
        )}

        {/* Profile Picture Section */}
        <Card
          sx={{
            bgcolor: '#2a2a3e',
            border: '1px solid #3a3a4e',
            borderRadius: 2,
            mb: 3,
            maxWidth: 700,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
              Profile Picture
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#4a90e2',
                  fontSize: '2rem',
                }}
              >
                U
              </Avatar>
              <Box>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#4a90e2',
                    color: '#fff',
                    textTransform: 'none',
                    mb: 1,
                    '&:hover': {
                      bgcolor: '#357abd',
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
            bgcolor: '#2a2a3e',
            border: '1px solid #3a3a4e',
            borderRadius: 2,
            mb: 3,
            maxWidth: 700,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
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
            bgcolor: '#2a2a3e',
            border: '1px solid #3a3a4e',
            borderRadius: 2,
            mb: 3,
            maxWidth: 700,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
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
            bgcolor: '#2a2a3e',
            border: '1px solid #3a3a4e',
            borderRadius: 2,
            mb: 3,
            maxWidth: 700,
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
              Account Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#8e8ea0', mb: 2 }}>
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
              bgcolor: '#4a90e2',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                bgcolor: '#357abd',
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
