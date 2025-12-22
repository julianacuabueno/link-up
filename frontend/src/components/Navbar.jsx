import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
// import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import FeedbackIcon from '@mui/icons-material/Feedback';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
// import ComputerIcon from '@mui/icons-material/Computer';
import UserProfile from './UserProfile';
import LinkUp from  "../images/LinkUp.png";
import BlackLogo from "../images/black-logo.png";

const drawerWidth = 280;
const collapsedWidth = 80;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isSelected = (path) => {
    return location.pathname === path;
  };

  const mainMenuItems = [
    { name: 'Home', icon: <HomeIcon />, path: '/' },
    { name: 'Event', icon: <EventIcon />, path: '/events' },
    { name: 'Create', icon: <AddIcon />, path: '/create' },
    // { name: 'Tasks', icon: <AssignmentIcon />, path: '/tasks' },
  ];

  const bottomMenuItems = [
    { name: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { name: 'About', icon: <InfoIcon />, path: '/about' },
    { name: 'Feedback', icon: <FeedbackIcon />, path: '/feedback' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isCollapsed ? collapsedWidth : drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#edede9",
          color: "#fff",
          border: "none",
          transition: "width 0.3s ease-in-out",
        },
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #2a2a3e",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: isCollapsed ? "center" : "flex-start" }}>
          <img
            src={BlackLogo}
            alt="Link-Up Logo"
            style={{ width: 40, height: 40 }}
          />
          {!isCollapsed && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  color: "black",
                  textAlign: 'left',
                }}
              >
                Link-Up
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "black",
                  fontSize: "0.85rem",
                }}
              >
                Make plans with ease
              </Typography>
            </Box>
          )}
        </Box>
        <IconButton
          onClick={toggleCollapse}
          sx={{
            color: "#8e8ea0",
            "&:hover": {
              bgcolor: "#2a2a3e",
            },
          }}
        >
          {isCollapsed ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
        </IconButton>
      </Box>

      {/* Main Menu Items */}
      <List sx={{ px: 1, flexGrow: 1 }}>
        {mainMenuItems.map((item) => (
          <ListItemButton
            key={item.name}
            selected={isSelected(item.path)}
            onClick={() => handleMenuClick(item.path)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              "& .MuiListItemText-primary": {
                color: "black",
              },
              "& .MuiListItemIcon-root": {
                color: "black",
              },
              "&.Mui-selected": {
                bgcolor: "#2a2a3e",
                "&:hover": {
                  bgcolor: "#333347",
                },
                "& .MuiListItemText-primary": {
                  color: "#fff",
                },
                "& .MuiListItemIcon-root": {
                  color: "#fff",
                },
              },
              "&:hover": {
                bgcolor: "#1a1a2e",
                "& .MuiListItemText-primary": {
                  color: "#fff",
                },
                "& .MuiListItemIcon-root": {
                  color: "#fff",
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                justifyContent: isCollapsed ? "center" : "flex-start",
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontSize: "0.95rem",
                  fontWeight: isSelected(item.path) ? 600 : 400,
                }}
              />
            )}
          </ListItemButton>
        ))}

        {/* Bottom Menu Items */}
        <Box sx={{ mt: "auto", pt: 2 }}>
          {bottomMenuItems.map((item) => (
            <ListItemButton
              key={item.name}
              selected={isSelected(item.path)}
              onClick={() => handleMenuClick(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                "& .MuiListItemText-primary": {
                  color: "black",
                },
                "& .MuiListItemIcon-root": {
                  color: "black",
                },
                "&.Mui-selected": {
                  bgcolor: "#2a2a3e",
                  "&:hover": {
                    bgcolor: "#333347",
                  },
                  "& .MuiListItemText-primary": {
                    color: "#fff",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#fff",
                  },
                },
                "&:hover": {
                  bgcolor: "#1a1a2e",
                  "& .MuiListItemText-primary": {
                    color: "#fff",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#fff",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  "&.MuiListItemIcon-root": {
                    color: "black",
                  },
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: isSelected(item.path) ? 600 : 400,
                  }}
                />
              )}
            </ListItemButton>
          ))}
        </Box>
      </List>

      {/* User Profile Section */}
      <UserProfile isCollapsed={isCollapsed} />
    </Drawer>
  );
};

export default Navbar;
