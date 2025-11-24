import { Box, Typography, Card, CardContent, TextField, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Footer from '../components/Footer';

const Create = () => {
  return (
    <Box>
      <Typography variant="h3" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
        Create New Event
      </Typography>
      <Typography variant="body1" sx={{ color: '#8e8ea0', mb: 4 }}>
        Plan a new event and invite your friends
      </Typography>

      <Card
        sx={{
          bgcolor: '#2a2a3e',
          border: '1px solid #3a3a4e',
          borderRadius: 2,
          maxWidth: 600,
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="Event Title"
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
                    borderColor: '#4a90e2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#8e8ea0',
                },
              }}
            />

            <TextField
              label="Date"
              type="date"
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
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
                    borderColor: '#4a90e2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#8e8ea0',
                },
              }}
            />

            <TextField
              label="Time"
              type="time"
              variant="outlined"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
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
                    borderColor: '#4a90e2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#8e8ea0',
                },
              }}
            />

            <TextField
              label="Location"
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
                    borderColor: '#4a90e2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#8e8ea0',
                },
              }}
            />

            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
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
                    borderColor: '#4a90e2',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#8e8ea0',
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              sx={{
                bgcolor: '#4a90e2',
                color: '#fff',
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#357abd',
                },
              }}
            >
              Create Event
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Footer/>
    </Box>
  );
};

export default Create;