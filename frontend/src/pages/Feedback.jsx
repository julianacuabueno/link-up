import { Box, Typography, Card, CardContent, TextField, Button, Stack, Rating } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

const Feedback = () => {
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
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          width: '100%',
        }}
      >
        <Typography
          variant="h3"
          sx={{ mb: 3, fontWeight: 600, color: muiTheme.palette.text.primary, textAlign: 'center' }}
        >
          Feedback
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 4, color: muiTheme.palette.text.secondary, textAlign: 'center' }}
        >
          We'd love to hear your thoughts and suggestions
        </Typography>

        <Card
          sx={{
            bgcolor: muiTheme.palette.background.paper,
            border: `1px solid ${muiTheme.palette.divider}`,
            borderRadius: 2,
            width: '100%',
            maxWidth: 600,
            p: 2,
          }}
        >
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body1" sx={{ color: muiTheme.palette.text.primary, mb: 1 }}>
                  How would you rate your experience?
                </Typography>
                <Rating
                  defaultValue={0}
                  size="large"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: muiTheme.palette.primary.main,
                    },
                    '& .MuiRating-iconHover': {
                      color: muiTheme.palette.primary.dark,
                    },
                  }}
                />
              </Box>

              <TextField
                label="Subject"
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: muiTheme.palette.text.primary,
                    '& fieldset': {
                      borderColor: muiTheme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: muiTheme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: muiTheme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: muiTheme.palette.text.secondary,
                  },
                }}
              />

              <TextField
                label="Your Feedback"
                variant="outlined"
                fullWidth
                multiline
                rows={6}
                placeholder="Tell us what you think..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: muiTheme.palette.text.primary,
                    '& fieldset': {
                      borderColor: muiTheme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: muiTheme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: muiTheme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: muiTheme.palette.text.secondary,
                  },
                }}
              />

              <Button
                variant="contained"
                endIcon={<SendIcon />}
                fullWidth
                sx={{
                  bgcolor: muiTheme.palette.primary.main,
                  color: muiTheme.palette.primary.contrastText,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: muiTheme.palette.primary.dark,
                  },
                }}
              >
                Submit Feedback
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Footer />
    </Box>
  );
};

export default Feedback;
