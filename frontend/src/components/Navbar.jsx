import { useState } from 'react';
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
// import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import FeedbackIcon from '@mui/icons-material/Feedback';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import ComputerIcon from '@mui/icons-material/Computer';
import UserProfile from './UserProfile';
import LinkUp from  "../images/LinkUp.png";

const drawerWidth = 280;

const Navbar = () => {
  const [selectedItem, setSelectedItem] = useState('Home');

  const handleMenuClick = (itemName) => {
    setSelectedItem(itemName);
  };

  const mainMenuItems = [
    { name: 'Home', icon: <HomeIcon /> },
    { name: 'Event', icon: <EventIcon /> },
    { name: 'Create', icon: <AddIcon /> },
    // { name: 'Tasks', icon: <AssignmentIcon /> },
  ];

  const bottomMenuItems = [
    // { name: 'Settings', icon: <SettingsIcon /> },  // move setting into profile
    { name: 'About', icon: <InfoIcon /> },
    { name: 'Feedback', icon: <FeedbackIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#0f0f1e",
          color: "#fff",
          border: "none",
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <img
            src={LinkUp}
            alt="Link-Up Logo"
            style={{ width: 40, height: 40 }}
          />
          {/* <Box
            sx={{
              bgcolor: '#2a2a3e',
              borderRadius: 1,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={logo} alt="Link-Up Logo" style={{ width: 24, height: 24 }} />
            <ComputerIcon sx={{ color: '#8e8ea0', fontSize: 24 }} />  */}
          {/* {change icon to app logo } */}
          {/* </Box> */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "#fff",
              }}
            >
              Link-Up
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#8e8ea0",
                fontSize: "0.85rem",
              }}
            >
              Make plans with ease
            </Typography>
          </Box>
        </Box>
        <IconButton
          sx={{
            color: "#8e8ea0",
            "&:hover": {
              bgcolor: "#2a2a3e",
            },
          }}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Box>

      {/* Main Menu Items */}
      <List sx={{ px: 1, flexGrow: 1 }}>
        {mainMenuItems.map((item) => (
          <ListItemButton
            key={item.name}
            selected={selectedItem === item.name}
            onClick={() => handleMenuClick(item.name)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              "&.Mui-selected": {
                bgcolor: "#2a2a3e",
                "&:hover": {
                  bgcolor: "#333347",
                },
              },
              "&:hover": {
                bgcolor: "#1a1a2e",
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: selectedItem === item.name ? "#fff" : "#8e8ea0",
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                fontSize: "0.95rem",
                fontWeight: selectedItem === item.name ? 600 : 400,
                color: selectedItem === item.name ? "#fff" : "#b0b0c0",
              }}
            />
          </ListItemButton>
        ))}

        {/* Bottom Menu Items */}
        <Box sx={{ mt: "auto", pt: 2 }}>
          {bottomMenuItems.map((item) => (
            <ListItemButton
              key={item.name}
              selected={selectedItem === item.name}
              onClick={() => handleMenuClick(item.name)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "#2a2a3e",
                  "&:hover": {
                    bgcolor: "#333347",
                  },
                },
                "&:hover": {
                  bgcolor: "#1a1a2e",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selectedItem === item.name ? "#fff" : "#8e8ea0",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontSize: "0.95rem",
                  fontWeight: selectedItem === item.name ? 600 : 400,
                  color: selectedItem === item.name ? "#fff" : "#b0b0c0",
                }}
              />
            </ListItemButton>
          ))}
        </Box>
      </List>

      {/* User Profile Section */}
      <UserProfile />
    </Drawer>
  );
};

export default Navbar;
