// App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Box, ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { useTheme } from './context/ThemeContext';
import { getTheme } from './theme';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Event from './pages/Event';
import Create from './pages/Create';
import Settings from './pages/Settings';
import About from './pages/About';
import Feedback from './pages/Feedback';
import AccountSettings from './pages/AccountSettings';
import Login from './pages/Login';

import './App.css';

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Navbar /> {/* Navbar will inherit background/text colors from theme */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 8,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          color: 'text.primary',
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Event />} />
          <Route path="/create" element={<Create />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/account-settings" element={<AccountSettings />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  const { theme } = useTheme(); // 'light' or 'dark' from ThemeContext

  useEffect(() => {
    fetch("https://sfnn09foxd.execute-api.us-west-2.amazonaws.com/api/hello")
      .then((response) => response.json())
      .then((json) => console.log(json));
  }, []);

  return (
    <MUIThemeProvider theme={getTheme(theme)}>
      <CssBaseline />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </MUIThemeProvider>
  );
}

export default App;
