import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      className="page__footer"
      sx={{
        mt: 'auto',
        pt: 4,
        pb: 2,
        textAlign: 'center',
        borderTop: '1px solid #2a2a3e',
      }}
    >
      <Typography variant="body2" sx={{ color: '#8e8ea0', fontSize: '0.875rem' }}>
        Link-Up &copy; {new Date().getFullYear()}
      </Typography>
    </Box>
  );
};

export default Footer;