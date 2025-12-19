import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Event from './pages/Event'
import EventDetail from './pages/EventDetail'
import AcceptInvite from './pages/AcceptInvite'
import Create from './pages/Create'
import Settings from './pages/Settings'
import About from './pages/About'
import Feedback from './pages/Feedback'
import AccountSettings from './pages/AccountSettings'
import Login from './pages/Login'

import './App.css'

const AppLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isInvitePage = location.pathname.startsWith('/invite/');

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  if (isInvitePage) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', p: 4 }}>
        <Routes>
          <Route path="/invite/:token" element={<AcceptInvite />} />
        </Routes>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'white',
          p: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 1280,
          mx: 'auto',
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Event />} />
          <Route path="/events/:id" element={<EventDetail />} />
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
  useEffect(() => {
    fetch("https://sfnn09foxd.execute-api.us-west-2.amazonaws.com/api/hello")
      .then((response) => response.json())
      .then((json) => console.log(json));
  }, []);

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
