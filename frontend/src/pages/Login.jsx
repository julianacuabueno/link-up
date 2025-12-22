import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  IconButton,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ScheduleIcon from '@mui/icons-material/Schedule';

const BackendURL = "https://guno6rd8a7.execute-api.us-west-2.amazonaws.com";

// Floating icon component for background animation
const FloatingIcon = ({ Icon, size, top, left, delay, duration }) => (
  <Box
    sx={{
      position: 'absolute',
      top,
      left,
      opacity: 0.08,
      animation: `float ${duration}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      '@keyframes float': {
        '0%, 100%': {
          transform: 'translateY(0px) rotate(0deg)',
        },
        '50%': {
          transform: 'translateY(-20px) rotate(5deg)',
        },
      },
    }}
  >
    <Icon sx={{ fontSize: size, color: '#386641' }} />
  </Box>
);

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleNext = () => {
    if (!formData.email) {
      setError('Please enter your email');
      return;
    }
    setShowPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BackendURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const response = await fetch(`${BackendURL}/api/auth/google`);
      const data = await response.json();

      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setError('Failed to start Google authentication');
      }
    } catch (err) {
      console.error('Error connecting to Google:', err);
      setError('Failed to connect to Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const textFieldSx = {
    '& .MuiOutlinedInput-root': {
      color: '#0f1419',
      bgcolor: '#fff',
      borderRadius: '4px',
      '& fieldset': {
        borderColor: '#cfd9de',
      },
      '&:hover fieldset': {
        borderColor: '#386641',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#386641',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#000000ff',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#386641',
    },
  };

  const socialButtonSx = {
    bgcolor: '#fff',
    color: '#0f1419',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '15px',
    py: 1.5,
    borderRadius: '9999px',
    border: '1px solid #dadce0',
    boxShadow: 'none',
    '&:hover': {
      bgcolor: '#f7f9f9',
      boxShadow: 'none',
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#f7f9fa',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background container - covers entire viewport */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <FloatingIcon Icon={CalendarMonthIcon} size={150} top="3%" left="3%" delay={0} duration={6} />
        <FloatingIcon Icon={EventIcon} size={100} top="8%" left="80%" delay={1} duration={7} />
        <FloatingIcon Icon={GroupIcon} size={130} top="65%" left="5%" delay={2} duration={5} />
        <FloatingIcon Icon={NotificationsIcon} size={80} top="75%" left="85%" delay={0.5} duration={8} />
        <FloatingIcon Icon={ScheduleIcon} size={120} top="35%" left="88%" delay={1.5} duration={6} />
        <FloatingIcon Icon={CalendarMonthIcon} size={90} top="55%" left="45%" delay={2.5} duration={7} />
        <FloatingIcon Icon={EventIcon} size={140} top="12%" left="35%" delay={3} duration={5} />
        <FloatingIcon Icon={GroupIcon} size={70} top="82%" left="25%" delay={0.8} duration={6} />
        <FloatingIcon Icon={ScheduleIcon} size={85} top="5%" left="55%" delay={1.2} duration={8} />
        <FloatingIcon Icon={NotificationsIcon} size={110} top="45%" left="8%" delay={2} duration={5} />
        <FloatingIcon Icon={CalendarMonthIcon} size={95} top="25%" left="75%" delay={1.8} duration={7} />
        <FloatingIcon Icon={EventIcon} size={75} top="90%" left="60%" delay={0.3} duration={6} />
        <FloatingIcon Icon={GroupIcon} size={105} top="40%" left="20%" delay={2.2} duration={8} />
        <FloatingIcon Icon={ScheduleIcon} size={60} top="18%" left="12%" delay={1} duration={5} />
        <FloatingIcon Icon={NotificationsIcon} size={115} top="70%" left="70%" delay={2.8} duration={7} />
      </Box>

      {/* Login Card */}
      <Box
        sx={{
          bgcolor: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: 420,
          p: 4,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
          zIndex: 1,
        }}
      >
        {/* Close button */}
        <IconButton
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            color: '#536471',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.05)',
            },
          }}
          onClick={() => navigate('/')}
        >
          <CloseIcon />
        </IconButton>

        {/* Logo */}
        <Box sx={{ textAlign: 'center', mt: 1, mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#0f1419',
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}
          >
            Link-Up
          </Typography>
        </Box>

        {/* Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: '#0f1419',
              fontWeight: 700,
              mb: 3,
              fontSize: '23px',
            }}
          >
            Sign in to Link-Up
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                width: '100%',
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Social login buttons */}
          <Box sx={{ width: '100%' }}>
            <Button
              variant="contained"
              startIcon={googleLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
              fullWidth
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              sx={socialButtonSx}
            >
              {googleLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>

            <Button
              variant="contained"
              startIcon={<AppleIcon />}
              fullWidth
              sx={{
                ...socialButtonSx,
                mt: 1.5,
              }}
            >
              Sign in with Apple
            </Button>

            {/* Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Divider sx={{ flexGrow: 1, borderColor: '#eff3f4' }} />
              <Typography sx={{ px: 2, color: '#536471', fontSize: '14px' }}>
                or
              </Typography>
              <Divider sx={{ flexGrow: 1, borderColor: '#eff3f4' }} />
            </Box>

            {/* Email/Password form */}
            {!showPassword ? (
              <>
                <TextField
                  placeholder="Phone, email, or username"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  sx={{
                    ...textFieldSx,
                    mb: 2.5,
                  }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleNext}
                  sx={{
                    bgcolor: '#0f1419',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                    py: 1.5,
                    borderRadius: '9999px',
                    '&:hover': {
                      bgcolor: '#272c30',
                    },
                  }}
                >
                  Next
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    mt: 1.5,
                    borderColor: '#dadce0',
                    color: '#0f1419',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                    py: 1.5,
                    borderRadius: '9999px',
                    '&:hover': {
                      bgcolor: 'rgba(15, 20, 25, 0.1)',
                      borderColor: '#dadce0',
                    },
                  }}
                >
                  Forgot password?
                </Button>
              </>
            ) : (
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <TextField
                  placeholder="Phone, email, or username"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  disabled
                  sx={{
                    ...textFieldSx,
                    mb: 1.5,
                    '& .MuiOutlinedInput-root.Mui-disabled': {
                      bgcolor: '#f7f9f9',
                      '& fieldset': {
                        borderColor: '#eff3f4',
                      },
                    },
                    '& .MuiInputBase-input.Mui-disabled': {
                      color: '#536471',
                      WebkitTextFillColor: '#536471',
                    },
                  }}
                />

                <TextField
                  placeholder="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  autoFocus
                  sx={{
                    ...textFieldSx,
                    mb: 2.5,
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !formData.password}
                  sx={{
                    bgcolor: '#0f1419',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                    py: 1.5,
                    borderRadius: '9999px',
                    '&:hover': {
                      bgcolor: '#272c30',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(15, 20, 25, 0.5)',
                      color: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Log in'}
                </Button>

                <Button
                  variant="text"
                  fullWidth
                  onClick={() => setShowPassword(false)}
                  sx={{
                    mt: 1.5,
                    color: '#536471',
                    textTransform: 'none',
                    fontSize: '14px',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.05)',
                    },
                  }}
                >
                  Back
                </Button>
              </form>
            )}
          </Box>

          {/* Sign up link */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#536471', fontSize: '15px' }}>
              Don't have an account?{' '}
              <Button
                onClick={() => navigate('/signup')}
                sx={{
                  color: '#386641',
                  textTransform: 'none',
                  p: 0,
                  minWidth: 'auto',
                  fontSize: '15px',
                  fontWeight: 500,
                  '&:hover': {
                    bgcolor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
