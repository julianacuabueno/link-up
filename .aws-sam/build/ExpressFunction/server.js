// server.js
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 1. API routes FIRST
 *    These should respond and then stop; they must come before static/catch-all.
 */
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from API' });
});

// Add your other /api/... routes here

/**
 * 2. Serve static React build
 *    This serves JS/CSS/assets from the build folder.
 */
const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));

/**
 * 3. Catch-all for SPA routes
 *    Anything not handled above gets index.html for client-side routing.
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

/**
 * 4. Start server
 */
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});







