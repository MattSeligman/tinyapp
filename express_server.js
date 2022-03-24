// Imports & Port Configuration
const express = require('express');
const app = express();
const PORT = 8081; // default port 8080

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
const users = { 
  "user_RandomID": {
    id: "user_RandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user_2RandomID": {
    id: "user_2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'user_RandomID'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user_2RandomID'
  }
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
  console.log(users)
  res.redirect("/urls");
});

// Route "/urls" sends to pages/urls_index.ejs template passing along the templateVars object.
// This route shows a list of current TinyURLs
app.get("/urls", (req, res) => {

  const templateVars = {
    id: req.cookies.id,
    email: req.cookies.email,
    urls: urlDatabase
  };

  console.log("Users", users)
  console.log("Cookie", req.cookies)
  res.render("pages/urls_index", templateVars);
});

// Route "/urls/new" sends to pages/urls_new.ejs template
// This route shows options to add new TinyURLs
app.get("/urls/new", (req, res) => {
  const templateVars = {
    id: req.cookies.id,
    email: req.cookies.email,
    urls: urlDatabase
  };
  res.render("pages/urls_new",templateVars);
});

// Route redirects tinyURL to its fullURL.
app.get('/u/:id', (req,res) => {
  res.redirect(urlDatabase[req.params.id]);
});

// Route "/register" directs to registration page.
app.get("/register", (req, res) => {
  const templateVars = {
    id: req.cookies.id,
    email: req.cookies.email,
    urls: urlDatabase
  };
  res.render("pages/register",templateVars);
});


// Post Route "/register" directs to registration page.
app.post("/register", (req, res) => {

  // check if they snuck through some how with no post
  if(req.body.email.length === 0){ res.redirect('/urls/') }

  let submittedEmail = req.body.email;

  // check if user exists.
  for(let user in users){
    let emailsMatch = users[user].email === submittedEmail;
    if (emailsMatch) { res.redirect('/login/') }
  }

  // Otherwise let's build the cookie
  genRandomString();
  users["user_" + generatedRandomString] = { 
    id: "user_" + generatedRandomString, 
    email: submittedEmail,
    password: req.body.password
  };
      
  res.cookie("id", "user_" + generatedRandomString);
  res.cookie("email", submittedEmail);
  res.redirect('/urls/')

});

// Route redirects to Login page
app.get("/login", (req, res) => {
  const templateVars = {
    id: req.cookies.id,
    email: req.cookies.email,
    urls: urlDatabase
  };
  res.render("pages/login",templateVars);
});

// Post Route "/login" posts login details to the urls page.
app.post('/login', function(req, res) {

  let submittedEmail = req.body.email;
  let submittedPassword = req.body.password;

  // check if user exists.
  for(let user in users){
   
    let emailsMatch = users[user].email === submittedEmail;
    let passwordsMatch = users[user].password === submittedPassword;
    
    if(emailsMatch){

      if(passwordsMatch){
        res.cookie("id", users[user].id)
        res.cookie("email", submittedEmail)
        res.redirect("/urls/");
      } else {
        res.redirect("/login/");
      }
    }
  }

  
});


// Route "/logout" Logs the user out then redirects to Urls page.
app.get("/logout", (req, res) => {
  res.clearCookie('id');
  res.clearCookie('email');
  res.redirect("/urls/");
});

// Post Route "/login" posts login details to the urls page.
app.post('/logout', function(req, res) {
  res.clearCookie('id');
  res.clearCookie('email');
  res.redirect("/urls/");
});

// Post Route on post runs genRandomString() and generates a LongURL based on its entry.
// Redirects to /urls/ page upon completion.
app.post("/urls/", (req, res) => {

  genRandomString();
  urlDatabase[generatedRandomString] = {
    longURL: req.body.longURL,
    userID: req.body.id
  }
  res.redirect('/urls/')  
});

// Post Route "/u/:id/edit" updates the values of the LongURL
app.post('/urls/:id/edit', (req,res) => {
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.body.id
  }
  res.redirect('/urls/');
});

// Post Route "/u/:id/delete" removes the ID from 
app.post('/urls/:id/delete', (req,res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls/');
});

// Route "/urls/:shortURL" sends to pages/urls_show.ejs template passing along the templateVars object.
// This route shows the list of this shortURLs LongURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    id: req.cookies.id,
    email: req.cookies.email,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("pages/urls_show", templateVars);
});

// Post Route "/urls/:shortURL" posts updated shortURL
app.post('/urls/:shortURL', (req,res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls/');
});

// Route "404" sends to pages/pageNotFound.js"
// This route shows a page not found if the route doesn't exist.
app.get("*", (req, res) => {
  const templateVars = {
    id: req.cookies.id,
    email: req.cookies.email,
    urls: urlDatabase
  };
  res.render("pages/pageNotFound", templateVars);
});

// Starts the Server & Listens on PORT (console log on success)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});