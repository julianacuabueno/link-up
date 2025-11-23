import { useState, useEffect } from 'react'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch("/api/test-get")
      .then(response => response.json())
      .then(json => console.log(json));
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#1a1a2e',
          p: 8,
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <h1 style={{ color: '#fff' }}>Welcome to Link-Up</h1>
        <p style={{ color: '#8e8ea0' }}>
          Click on the navigation items to switch views.
        </p>
      </Box>
    </Box>
  )
}

export default App
