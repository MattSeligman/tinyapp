// Imports & Port Configuration
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// Setup Middleware
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

// Running Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())
app.set('view engine', 'ejs');

// Database of shortUrl : URL Redirection Path
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

let generatedRandomString = '';
/**
 * Generates a Random String to be used for tinyURLs
 * * Clears any past generatedRandomStrings
 * * Creates random numbers between 1-36. (based on the `charToAdd` value)
 * * Modifies each random number to a string using Base36
 * * Adds each new string to the `generatedRandomString`
 */
const genRandomString = ()=>{
  generatedRandomString = ''
  const randomNumbers = [];
  for (let charToAdd = 6; charToAdd > 0; charToAdd--) { randomNumbers.push( Math.ceil(Math.random() * 36) ) }
  randomNumbers.forEach( number=> generatedRandomString += number.toString(36) );
}


// Support all static public files.
app.use(express.static(__dirname + '/public/'));

// Route "/" sends to pages/index.ejs template.
app.get('/', function(req, res) {
    res.redirect("/urls");
  // res.render('pages/index');
});

// Route "/urls" sends to pages/urls_index.ejs template passing along the templateVars object.
// This route shows a list of current TinyURLs
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
  console.log(req.cookies.username)
  res.render("pages/urls_index", templateVars);
});

// Route "/urls/new" sends to pages/urls_new.ejs template
// This route shows options to add new TinyURLs
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
  res.render("pages/urls_new",templateVars);
});

// Route redirects tinyURL to its fullURL.
app.get('/u/:id', (req,res) => {
  res.redirect(urlDatabase[req.params.id]);
});

// Route "/login" posts login details to the urls page.
app.post('/login', function(req, res) {
  res.set('Set-Cookie', `username=${req.body.username}; Path=/; HttpOnly`)
  res.redirect("/urls/");
});

// Route "/login" posts login details to the urls page.
app.post('/logout', function(req, res) {
  res.clearCookie('username')
  res.redirect("/urls/");
});

// Route on post runs genRandomString() and generates a LongURL based on its entry.
// Redirects to /urls/ page upon completion.
app.post("/urls/", (req, res) => {
  genRandomString();
  urlDatabase[generatedRandomString] = req.body.longURL;
  res.redirect('/urls/')  
});

// Route "/u/:id/delete" removes the ID from 
app.post('/urls/:id/edit', (req,res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls/');
});

// Route "/u/:id/delete" removes the ID from 
app.post('/urls/:id/delete', (req,res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls/');
});

// Route "/urls/:shortURL" sends to pages/urls_show.ejs template passing along the templateVars object.
// This route shows the list of this shortURLs LongURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("pages/urls_show", templateVars);
});

// Route "/urls/:shortURL" posts updated shortURL
app.post('/urls/:shortURL', (req,res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls/');
});

// Route "404" sends to pages/pageNotFound.js"
// This route shows a page not found if the route doesn't exist.
app.get("*", (req, res) => {
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
  res.render("pages/pageNotFound", templateVars);
});

// Starts the Server & Listens on PORT (console log on success)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});