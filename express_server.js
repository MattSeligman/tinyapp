// Imports & Port Configuration
const express = require('express');
const app = express();
const PORT = 8082; // default port 8080

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
  },
 "user_yfbavv": {
    id: "user_yfbavv", 
    email: "test@test.com", 
    password: "test"
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
  },
  'sgq3y6': {
    longURL: 'http://www.test.com',
    userID: 'user_yfbavv'
  }
};

/**
 * Generates a Random String to be used for tinyURLs
 * * Clears any past generatedRandomStrings
 * * Creates random numbers between 1-36. (based on the `charToAdd` value)
 * * Modifies each random number to a string using Base36
 * * Adds each new string to the `generatedRandomString`
 */
const genRandomString = ()=>{
  let generatedRandomString = ''
  const randomNumbers = [];
  for (let charToAdd = 6; charToAdd > 0; charToAdd--) { randomNumbers.push( Math.ceil(Math.random() * 36) ) }
  randomNumbers.forEach( number=> generatedRandomString += number.toString(36) );
  return generatedRandomString;
}

/**
 * The checkCookieAuth function returns a True or False for verifying the Cookie Authorization.
 * @param {*} req pulls in data with requests
 * @param {*} res sends data with response
 * @returns `True` or `False`
 */
const checkCookieAuth = (req, res)=>{
  
  // Check if the cookieID matches the users Keys (same as ID)
  const cookieIDExist = Object.keys(users).includes(req.cookies.id);
  if (!cookieIDExist) { 
    console.log("Cookie ID doesn't exist");

    res.clearCookie('id');
    res.clearCookie('email');
    res.redirect("/login/");
    return false;
  };
  
  // Check if the cookieEmail matches the the users email.
  const cookieEmailExist = req.cookies.email === users[req.cookies.id].email;
  if (!cookieEmailExist) { 
    console.log("Cookie Email doesn't exist"); 

    res.clearCookie('id');
    res.clearCookie('email');
    res.redirect("/login/");
    return false; 
  };

  return true;
}

// Support all static public files.
app.use(express.static(__dirname + '/public/'));

// Route "/" sends to pages/index.ejs template.
app.get('/', function(req, res) {
  console.log(users)
  res.redirect("/urls");
});

/**
 * Get | Actions to show the TinyURL's within account
 */
app.get("/urls", (req, res) => {
    
  let usersUrlDatabase = {};
  checkCookieAuth(req, res);

  Object.entries(urlDatabase).forEach((urlEntry)=>{
    let urlID = urlEntry[1].userID;    
    if(req.cookies.id === urlID){
      usersUrlDatabase[urlEntry[0]] = urlEntry[1];
     }
  });
 
  const templateVars = {
    id: req.cookies.id,
    email: req.cookies.email,
    urls: usersUrlDatabase
    
  }

  res.render("pages/urls_index", templateVars);
});

/**
 * Get | Actions to create a new TinyURL
 */
app.get("/urls/new", (req, res) => {

  // verifies cookie is Accurate before continueing
  checkCookieAuth(req, res);

  const templateVars = {
    id: req.cookies.id,
    email: req.cookies.email,
    urls: urlDatabase
  };
  res.render("pages/urls_new",templateVars);
});

/**
 * Get | Redirection for ShortURL's (Public Access)
 */
app.get('/u/:id', (req,res) => {
  const urlID = req.params.id;
  if(urlID === "undefined"){ res.redirect("/") }

  const longURL = urlDatabase[urlID].longURL;
  res.redirect(longURL);
});

/**
 * GET | Actions when viewing the Register page
 */
app.get("/register", (req, res) => {
  const templateVars = {
    id: req.cookies.id,
    email: req.cookies.email,
    urls: urlDatabase
  };
  res.render("pages/register",templateVars);
});


/**
 * POST | Actions when Registering an account
 */
app.post("/register", (req, res) => {

  // check if they snuck through some how with no post
  if(req.body.email.length === 0){ res.redirect('/urls/') }

  let submittedEmail = req.body.email;

  for(let user in users){
    let emailsMatch = users[user].email === submittedEmail;
    if (emailsMatch) { res.redirect('/login/') }
  }

  let generatedRandomString = genRandomString();
  users["user_" + generatedRandomString] = { 
    id: "user_" + generatedRandomString, 
    email: submittedEmail,
    password: req.body.password
  };
      
  res.cookie("id", "user_" + generatedRandomString);
  res.cookie("email", submittedEmail);
  res.redirect('/urls/')

});

/**
 * GET | Actions when viewing the Login page.
 */
app.get("/login", (req, res) => {

  const templateVars = {
    id: req.cookies.id,
    email: req.cookies.email,
    urls: urlDatabase
  };
  res.render("pages/login",templateVars);
});

/**
 * POST | Actions used when Logging In
 */
app.post('/login', function(req, res) {

  let submittedEmail = req.body.email;
  let submittedPassword = req.body.password;

  for(let user in users){
   
    let emailsMatch = users[user].email === submittedEmail;
    let passwordsMatch = users[user].password === submittedPassword;
    
    if(emailsMatch && passwordsMatch){
      res.cookie("id", users[user].id)
      res.cookie("email", submittedEmail)
      res.redirect("/urls/");
    }    
  }

  res.redirect("/login/");
});


/**
 * GET | Actions applied on Logout Page
 */
app.get("/logout", (req, res) => {
  
  if (checkCookieAuth(req, res)){
    res.clearCookie('id');
    res.clearCookie('email');
  }

  res.redirect("/urls/");
});

/**
 * POST | Actions applied when Posting to Logout
 */
app.post('/logout', function(req, res) {

  if (checkCookieAuth(req, res)){
    res.clearCookie('id');
    res.clearCookie('email');
  }

  res.redirect("/urls/");
});

/**
 * POST | Route for Adding new Tiny URLS
 */
app.post("/urls/", (req, res) => {

  if (checkCookieAuth(req, res)){

    const generatedRandomString = genRandomString();
    urlDatabase[generatedRandomString] = {
      longURL: req.body.longURL,
      userID: req.cookies.id
    }
  }
  res.redirect('/urls/');  
});

/**
 * POST | Route for Editing the URL of a Tiny URL
 */
app.post('/urls/:id/edit', (req,res) => {

  if (checkCookieAuth(req, res)){
    
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.cookies.id
    }
  }
  
  res.redirect('/urls/');
});

/**
 * POST | Actions applied when deleting a Tiny URL
 */
app.post('/urls/:id/delete', (req,res) => {

  if(checkCookieAuth(req, res)){
    delete urlDatabase[req.params.id]
  }  
  res.redirect('/urls/');
  
});

/**
 * GET | Data provided when viewing /urls/:shortURL
 */
app.get("/urls/:shortURL", (req, res) => {
  
  checkCookieAuth(req, res);

  const templateVars = { 
    id: req.cookies.id,
    email: req.cookies.email,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render("pages/urls_show", templateVars);
});

// Post Route "/urls/:shortURL" posts updated shortURL
app.post('/urls/:shortURL', (req,res) => {

  if(checkCookieAuth(req, res)){
    urlDatabase[req.params.id] = req.body.longURL;
  }    
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