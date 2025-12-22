import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const handleMenuClick = (path) => {
    navigate(path);
  };

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

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      setLoadingUser(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/auth/status?email=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (data.success && data.authenticated && data.user) {
          const { picture, given_name, name, email: apiEmail } = data.user;
          const firstName = given_name || (name ? name.split(' ')[0] : null);
          setUser({
            firstName: firstName || 'User',
            email: apiEmail || email,
            picture: picture || '',
          });
        } else {
          // Fallback to email-only if the user is logged in but no profile payload is returned
          const fallbackName = email.split('@')[0] || 'User';
          setUser({
            firstName: fallbackName,
            email,
            picture: '',
          });
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        const fallbackName = email.split('@')[0] || 'User';
        setUser({ firstName: fallbackName, email, picture: '' });
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

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
          src={user?.picture || undefined}
          alt={user?.firstName || 'User avatar'}
          sx={{
            width: 40,
            height: 40,
            bgcolor: "#4a90e2",
          }}
        >
          {(user?.firstName || 'U')[0]?.toUpperCase()}
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
              {loadingUser ? 'Loading…' : user?.firstName || 'Guest'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#8e8ea0",
                fontSize: "0.8rem",
              }}
            >
              {loadingUser ? '' : user?.email || 'Not signed in'}
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
          onClick={async () => {
            handleClose();
            const email = localStorage.getItem('userEmail');

            // Call backend to clear tokens
            if (email) {
              try {
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ email }),
                });
              } catch (err) {
                console.error('Error during logout:', err);
              }
            }

            // Clear local storage and redirect
            localStorage.removeItem('userEmail');
            localStorage.removeItem('isLoggedIn');
            setUser(null);
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
