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
  res.send('Homepage');
});

// Route (Hello World Test - LottieFile Credit: https://lottiefiles.com/22608-earth-animation)
app.get("/hello", (req, res) => {
    res.send(`<html><body><h1>Hello World</h1><div><script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
    <lottie-player src="https://assets1.lottiefiles.com/packages/lf20_T1gagt.json"  background="transparent"  speed="1"  style="width: 100%;" autoplay></lottie-player></div></body></html>\n`);
  });

// Route (/urls.json Viewable for testing purposes)
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

// Starts the Server & Listens on PORT (Console Log on success)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});