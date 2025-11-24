import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Event from './pages/Event'
import Create from './pages/Create'
import Settings from './pages/Settings'
import About from './pages/About'
import Feedback from './pages/Feedback'

import './App.css'

function App() {
  useEffect(() => {
    fetch("/api/test-get")
      .then(response => response.json())
      .then(json => console.log(json));
  }, []);

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Navbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: '#1a1a2e',
            px: 8,
            pt: 0,
            pb: 8,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Event />} />
            <Route path="/create" element={<Create />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
    
  )
}

export default App
