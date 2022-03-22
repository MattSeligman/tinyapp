// Imports & Port Configuration
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// Middleware
const morgan = require('morgan');
const bodyParser = require("body-parser");
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

// set the view engine to ejs templates
app.set('view engine', 'ejs');

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


// Tell Express the '/public' directory files are to be considered static.
// In templates we can now source "/css/style.css"
// Static Files include: CSS, Images & JS
app.use(express.static(__dirname + '/public/'));

// Route "/" sends to pages/index.ejs template.
app.get('/', function(req, res) {
  res.render('pages/index');
});

// Route "/urls" sends to pages/urls_index.ejs template passing along the templateVars object.
// This route shows a list of current TinyURLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("pages/urls_index", templateVars);
});

// Route "/urls/" posts the data to the urls page
app.post("/urls", (req, res) => {
  const templateVars = { shortURL: generateRandomString(), longURL: urlDatabase[req.params.shortURL] };
  res.send(req); // Respond with 'Ok' (we will replace this)
});

// Route "/urls/new" sends to pages/urls_new.ejs template
// This route shows options to add new TinyURLs
  app.get("/urls/new", (req, res) => {
  res.render("pages/urls_new");
});

// Route "/urls/:shortURL" sends to pages/urls_show.ejs template passing along the templateVars object.
// This route shows the list of existing URLs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("pages/urls_show", templateVars);
});

// Route "404" sends to pages/pageNotFound.js"
// This route shows a page not found if the route doesn't exist.
app.get("*", (req, res) => {
  res.render("pages/pageNotFound");
});

// Starts the Server & Listens on PORT (console log on success)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});