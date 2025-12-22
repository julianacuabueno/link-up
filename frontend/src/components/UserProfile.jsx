import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const UserProfile = ({ isCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const isSelected = (path) => {
    return location.pathname === path;
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "space-between",
        p: 2,
        borderTop: "1px solid #2a2a3e",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "#4a90e2",
          }}
        >
          U
        </Avatar>
        {!isCollapsed && (
          <Box>
            <Typography
              variant="body1"
              sx={{
                color: 'black',
                fontWeight: 500,
                fontSize: '0.95rem',
                textAlign: 'left',
              }}
            >
              UserName
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#8e8ea0",
                fontSize: "0.8rem",
              }}
            >
              user@email.com
            </Typography>
          </Box>
        )}
      </Box>
      {!isCollapsed && (
        <>
          <IconButton
            onClick={handleClick}
            sx={{
              color: "#8e8ea0",
              "&:hover": {
                bgcolor: "#2a2a3e",
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
              "& .MuiPaper-root": {
                bgcolor: "#1a1a2e",
                border: "1px solid #2a2a3e",
              },
            }}
          >
        {/* <MenuItem
          onClick={() => {
            handleClose();
            handleMenuClick('/profile');
          }}
          sx={{ color: "#fff" }}
        >
          Profile
        </MenuItem> */}
        <MenuItem
          onClick={() => {
            handleClose();
            handleMenuClick('/account-settings');
          }}
          sx={{ color: "#fff" }}
        >
          Account Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            localStorage.removeItem('userEmail');
            localStorage.removeItem('isLoggedIn');
            navigate('/login');
          }}
          sx={{ color: "#fff" }}
        >
          Logout
        </MenuItem>
      </Menu>
        </>
      )}
    </Box>
  );
};

export default UserProfile;
