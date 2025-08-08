const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files first
app.use(express.static(path.join(__dirname, 'build')));

// Then handle SPA fallback
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});