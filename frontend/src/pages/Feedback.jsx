import { Box, Typography, Card, CardContent, TextField, Button, Stack, Rating } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Footer from '../components/Footer';

const Feedback = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h3" sx={{ color: 'black', mb: 3, fontWeight: 600 }}>
          Feedback
        </Typography>
        <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
          We'd love to hear your thoughts and suggestions
        </Typography>

        <Card
        sx={{
          bgcolor: '#c5d4b2',
          border: '1px solid #c5d4b2',
          borderRadius: 2,
          maxWidth: 600,
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body1" sx={{ color: '#000', mb: 1 }}>
                How would you rate your experience?
              </Typography>
              <Rating
                defaultValue={0}
                size="large"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: '#386641',
                  },
                  '& .MuiRating-iconHover': {
                    color: '#2d4d30',
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
                  color: '#fff',
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
              }}
            />

            <Button
              variant="contained"
              endIcon={<SendIcon />}
              fullWidth
              sx={{
                bgcolor: '#386641',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#2d4d30',
                },
              }}
            >
              Submit Feedback
            </Button>
          </Stack>
        </CardContent>
      </Card>
      </Box>
      <Footer/>
    </Box>
  );
};

export default Feedback;