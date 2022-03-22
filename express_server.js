// Imports & Port Configuration
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

// Database of shortUrl : URL Redirection Path
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

let generatedRandomString = '';

const generateRandomString = ()=>{
  
  // reset the randomString to empty
  generatedRandomString = ''

  // generate random numbers up to 36
  const randomNumbers = [
    Math.ceil(Math.random() * 36), 
    Math.ceil(Math.random() * 36), 
    Math.ceil(Math.random() * 36), 
    Math.ceil(Math.random() * 36), 
    Math.ceil(Math.random() * 36), 
    Math.ceil(Math.random() * 36)
  ]

  // convert each number to letter (using base36)
  // add converted letter to the generated generatedRandomString.
  randomNumbers.forEach( number=> generatedRandomString += number.toString(36) );
}

// set the view engine to ejs
app.set('view engine', 'ejs');

// Tell Express the '/public' directory files are to be considered static.
// In templates we can now source "/css/style.css"
// Static Files include: CSS, Images & JS
app.use(express.static(__dirname + '/public/'));

// Route "/" to pages/index.ejs template.
app.get('/', function(req, res) {
  res.render('pages/index');
});

// Route "/urls" to pages/urls_index.ejs template
// Also pass the templateVars so we can use the database entries on this page.
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("pages/urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("pages/urls_new");
  
});

app.post("/urls", (req, res) => {
  generateRandomString()
  console.log(req.body);
  res.send(`Ok ${generatedRandomString}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("pages/urls_show", templateVars);
});

// route "404" requests the urls
app.get("*", (req, res) => {
  res.render("pages/pageNotFound_index");
});

// Starts the Server & Listens on PORT (Console Log on success)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});