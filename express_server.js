// Imports & Port Configuration
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// Database of shortUrl : URL Redirection Path
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// Route (Homepage)
app.get('/', (req, res) => {
  res.send('Hello!');
});

// Route (/urls.json Viewable for testing purposes)
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

// Starts the Server & Listens on PORT (Console Log on success)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});