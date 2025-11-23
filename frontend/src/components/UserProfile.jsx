import { useState } from 'react';
import { Box, Avatar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const UserProfile = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderTop: '1px solid #2a2a3e',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#4a90e2',
          }}
        >
          U
        </Avatar>
        <Box>
          <Typography
            variant="body1"
            sx={{
              color: '#fff',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            UserName
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#8e8ea0',
              fontSize: '0.8rem',
            }}
          >
            user@email.com
          </Typography>
        </Box>
      </Box>
      <IconButton
        onClick={handleClick}
        sx={{
          color: '#8e8ea0',
          '&:hover': {
            bgcolor: '#2a2a3e',
          },
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: '#1a1a2e',
            border: '1px solid #2a2a3e',
          },
        }}
      >
        <MenuItem onClick={handleClose} sx={{ color: '#fff' }}>
          Profile
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ color: '#fff' }}>
          Account Settings
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ color: '#fff' }}>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserProfile;
