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
  useTheme as useMUITheme,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import FeedbackIcon from '@mui/icons-material/Feedback';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UserProfile from './UserProfile';
import BlackLogo from "../images/black-logo.png";

const drawerWidth = 280;
const collapsedWidth = 80;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const theme = useMUITheme();

  const handleMenuClick = (path) => navigate(path);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const isSelected = (path) => location.pathname === path;

  const mainMenuItems = [
    { name: 'Home', icon: <HomeIcon />, path: '/' },
    { name: 'Events', icon: <EventIcon />, path: '/events' },
    { name: 'Create', icon: <AddIcon />, path: '/create' },
  ];

  const bottomMenuItems = [
    { name: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { name: 'About', icon: <InfoIcon />, path: '/about' },
    { name: 'Feedback', icon: <FeedbackIcon />, path: '/feedback' },
  ];

  const drawerBg = theme.palette.background.paper;
  const textColor = theme.palette.text.primary;
  const selectedBg = theme.palette.primary.main;
  const selectedText = theme.palette.primary.contrastText;
  const hoverBg = theme.palette.action.hover;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isCollapsed ? collapsedWidth : drawerWidth,
          boxSizing: "border-box",
          bgcolor: theme.palette.primary.main,
          color: textColor,
          border: "none",
          transition: "width 0.3s ease-in-out",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: isCollapsed ? "center" : "flex-start" }}>
          <img src={BlackLogo} alt="Link-Up Logo" style={{ width: 40, height: 40 }} />
          {!isCollapsed && (
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 600, fontSize: "2rem", color: "#fbf7ef" }}>
                Link-Up
              </Typography>
              <Typography variant="body2" sx={{ color: "fbf7ef", fontSize: "0.85rem" }}>
                Make plans with ease
              </Typography>
            </Box>
          )}
        </Box>
        <IconButton onClick={toggleCollapse} sx={{ color: theme.palette.text.secondary }}>
          {isCollapsed ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
        </IconButton>
      </Box>

      {/* Main Menu */}
      <List sx={{ px: 1, flexGrow: 1 }}>
        {mainMenuItems.map((item) => (
          <ListItemButton
            key={item.name}
            selected={isSelected(item.path)}
            onClick={() => handleMenuClick(item.path)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              width: "fit-content",
              px: 1.5,
              py: 1,
              "& .MuiListItemText-primary": { color: textColor },
              "& .MuiListItemIcon-root": { color: textColor },
              "&.Mui-selected": {
                bgcolor: selectedBg,
                "&:hover": { bgcolor: selectedBg },
                "& .MuiListItemText-primary": { color: selectedText },
                "& .MuiListItemIcon-root": { color: selectedText },
              },
              "&:hover": {
                bgcolor: hoverBg,
                "& .MuiListItemText-primary": { color: textColor },
                "& .MuiListItemIcon-root": { color: textColor },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, justifyContent: isCollapsed ? "center" : "flex-start" }}>
              {item.icon}
            </ListItemIcon>
            {!isCollapsed && <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: isSelected(item.path) ? 600 : 400 }} />}
          </ListItemButton>
        ))}

        {/* Bottom Menu */}
        <Box sx={{ mt: "auto", pt: 2 }}>
          {bottomMenuItems.map((item) => (
            <ListItemButton
              key={item.name}
              selected={isSelected(item.path)}
              onClick={() => handleMenuClick(item.path)}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                width: "fit-content",
                px: 1.5,
                py: 1,
                "& .MuiListItemText-primary": { color: textColor },
                "& .MuiListItemIcon-root": { color: textColor },
                "&.Mui-selected": {
                  bgcolor: selectedBg,
                  "&:hover": { bgcolor: selectedBg },
                  "& .MuiListItemText-primary": { color: selectedText },
                  "& .MuiListItemIcon-root": { color: selectedText },
                },
                "&:hover": {
                  bgcolor: hoverBg,
                  "& .MuiListItemText-primary": { color: textColor },
                  "& .MuiListItemIcon-root": { color: textColor },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: isCollapsed ? "center" : "flex-start" }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary={item.name} primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: isSelected(item.path) ? 600 : 400 }} />}
            </ListItemButton>
          ))}
        </Box>
      </List>

      {/* User Profile */}
      <UserProfile isCollapsed={isCollapsed} />
    </Drawer>
  );
};

export default Navbar;
