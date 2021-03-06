// Imports & Port Configuration
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

// Import helper functions
const { getUserByEmail, genRandomString, checkCookieAuth } = require('./helpers.js');

// Setup Middleware
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

// Running Middleware
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys:  [ "undiminishableness", "portfolio", "chetahs", "shelley", "shadowing", "chorister", "overgoads", "tubber", "kromskop", "hilloing", "seraphicalness", "sketching", "honorable", "isobathythermal", "resprinkling", "monotic", "groundwater", "labelled", "overimitate", "stob", "quercimeritrin", "dupers", "microstates", "histologic", "charlatanistic", "uluhi", "retraceable", "leiocephalous", "slipknots", "singeingly", "wiremonger", "interadditive", "upswarm", "preordering", "thyristor", "nonequalized", "sweetsop", "embolies", "backway", "tricklet", "reallegorize", "vociferation", "aftward", "expressionful", "soredial", "misevaluate", "squirearchy", "detergents"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set('view engine', 'ejs');

const users = {
  "user_RandomID": {
    id: "user_RandomID",
    email: "user@example.com",
    password: "$2a$10$cB3vhSUXJcp.4XTJgARHcOPApImsohDI1r18WvS1rg/9NqWnjcVh2" // purple-monkey-dinosaur
  },
  "user_2RandomID": {
    id: "user_2RandomID",
    email: "user2@example.com",
    password: "$2a$10$Mc6RMXpQJRmzmf5lXjRQKeuSa0RacelJ8NXrFOkAAq1J3hYUK8iii" // dishwasher-funk
  },
  "user_yfbavv": {
    id: "user_yfbavv",
    email: "test@test.com",
    password: "$2a$10$n0TFuJ8u2/cpbFEIajdAfuI55ja.j2sSzV8AV694zWUOkm4ulVUFe" // test
  }
};

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
// Support all static public files.
app.use(express.static(__dirname + '/public/'));

// Route "/" sends to ./index.ejs template.
app.get('/', function(req, res) {

  if (!req.session){
    return res.redirect("/urls");
  }
  return res.redirect("/login");
});

/**
 * Get | Actions to show the TinyURL's within account
 */
app.get("/urls", (req, res) => {
 
  let usersUrlDatabase = {};

  if (req.session.user === undefined) {
    
    let templateVars = {
      id: null,
      email: null,
      message: true 
    };
    
    return res.render("./urls_index", templateVars);
  }

  let templateVars = {
    id: req.session.user.id,
    email:  req.session.user.email,
    urls: usersUrlDatabase,
    message: false
  };

  let urlDatabaseArray = Object.entries(urlDatabase);

  urlDatabaseArray.forEach((entry)=>{

    let entryArray = Object.entries(entry)[1];
    let userID = entryArray[1].userID;

    if (req.session.user.id === userID) {

      // add only the entries the user has added
      usersUrlDatabase[entry[0]] = {
        longURL: entry[1].longURL,
        userID: entry[1].userID
      };
    }
  });

  return res.render("./urls_index", templateVars);
});

/**
 * Get | Actions to create a new TinyURL
 */
app.get("/urls/new", (req, res) => {

  // verifies cookie is Accurate before continueing
  if (!req.session.user || req.session.user === undefined) {
    return res.redirect("/login/");
  }

  let templateVars = {
    id: req.session.user,
    email: req.session.user.email,
    urls: urlDatabase
  };
  res.render("./urls_new",templateVars);
});

/**
 * Get | Redirection for ShortURL's (Public Access)
 */
app.get('/u/:id', (req,res) => {

  const urlID = req.params.id;
  const urlObject = urlDatabase[urlID];

  if (!urlObject) {

    const resMessage = `This tinyURL doesn't exist`;
      
    if (!req.session.user) {
      let templateVars = {
        id: null,
        email: null,
        message: resMessage
      };
      
      return res.render("./error_page", templateVars)
    }

      let templateVars = {
          id: req.session.user.id,
          email: req.session.user.email,
          message: resMessage
      };
      return res.render("./error_page", templateVars)
    
  }

  return res.redirect(urlObject.longURL);
});

/**
 * GET | Actions when viewing the Register page
 */
app.get("/register", (req, res) => {

  if (req.session.user) {
    return res.redirect("/urls");
  };
    
  let templateVars = {
    id: req.body.id,
    email: req.body.email,
    urls: urlDatabase
  };

  return res.render("./register",templateVars);

});


/**
 * POST | Actions when posting to the Register page
 */
app.post("/register", (req, res) => {

  // check if they snuck through some how with no post
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    let templateVars = {
      id: null,
      email: null,
      message: `The email or password field were empty, please try again. <a href='/register/'>Register</a>`
    };
  
    return res.render("./error_page",templateVars);
  }
  
  let submittedEmail = req.body.email;

  if (getUserByEmail(submittedEmail, users) !== false) {
    let templateVars = {
      id: null,
      email: null,
      message: `This email currently exists, please try again. <a href='/register/'>Register</a>`
    };
  
    return res.render("./error_page",templateVars);
  
  }

  const submittedPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(submittedPassword, 10);

  let generatedRandomString = genRandomString();
  let generatedID = "user_" + generatedRandomString;
  
  users[generatedID] = {
    id: generatedID,
    email: submittedEmail,
    password: hashedPassword
  };
  
  req.session.user = users[generatedID];
  return res.redirect('/urls/');

});

/**
 * GET | Actions when viewing the Login page.
 */
app.get("/login", (req, res) => {

  if (checkCookieAuth(req, res, users)) {

    return res.redirect("/urls/");
  }

  let templateVars = {
    email: req.body.email
  };
  res.render("./login",templateVars);
});

/**
 * POST | Actions used when posting to login page.
 */
app.post("/login", function(req, res) {

  const submittedEmail = req.body.email;
  const submittedPassword = req.body.password;
  const locatedUser = getUserByEmail(submittedEmail, users);
  
  // Using one response so attackers can't use these details to improve attacks once determined email exists.
  const incorrectResponse = 'This email or password is incorrect.';

  if (!locatedUser) {
    let templateVars = {
      id: null,
      email: null,
      message: `${incorrectResponse} <a href='/login/'>Login</a>`
    };
  
    return res.render("./error_page",templateVars);
  }
  
  if (locatedUser) {
    let passwordsMatch = bcrypt.compareSync(submittedPassword, locatedUser.password);

    if (passwordsMatch) {
      req.session.user = locatedUser;
      return res.redirect("/urls/");
    } else {

      // I choose to use the same 404 message so a hacker can't target the email/password from response.
      return res.status(404).send(incorrectResponse);
    }
  }

  return res.redirect("/login/");
});


/**
 * GET | Actions applied on Logout Page
 */
app.get("/logout", (req, res) => {
  
  req.session = null;
  return res.redirect("/urls/");
});

/**
 * POST | Actions applied when Posting to Logout
 */
app.post('/logout', function(req, res) {

  req.session = null;
  return res.redirect("/urls/");
});

/**
 * POST | Route for Adding new Tiny URLS
 */
app.post("/urls/", (req, res) => {

  //if user is not logged in
  if (!req.session.user) {
    let templateVars = {
      id: null,
      email:  null,
      message: "You must be logged in to create a TinyURL"
    };
    return res.render("./error_page", templateVars)
  }
  
  const generatedRandomString = genRandomString();
  urlDatabase[generatedRandomString] = {
    longURL: req.body.longURL,
    userID: req.session.user.id
  };

  return res.redirect('/urls');

});

/**
 * POST | Route for Editing the URL of a Tiny URL
 */
app.post('/urls/:id/edit', (req,res) => {

  if (req.session) {

    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session.user.id
    };

    return res.redirect('/urls');
  }
  
  return res.redirect('/login');
});

/**
 * POST | Actions applied when deleting a Tiny URL
 */
app.post('/urls/:id/delete', (req,res) => {

  const session = req.session.user;

  if (!session) {
    let templateVars = {
      id: null,
      email:  null,
      message: "You must be logged in to alter a TinyURL"
    };
    return res.render('./error_page', templateVars);
  }

  const sessionUserID = session.id
  const databaseUserID = urlDatabase[req.params.id].userID;
  const matchingID = (sessionUserID === databaseUserID);

  if (!matchingID) {
    let templateVars = {
      id: session.id,
      email:  session.email,
      message: "You must own the tinyURL to edit it."
    };
    return res.render('./error_page', templateVars);
  }

  delete urlDatabase[req.params.id];
  return res.redirect('/urls/');
  
});

/**
 * GET | Data provided when viewing /urls/:shortURL
 */
app.get("/urls/:shortURL", (req, res) => {
  
  const session = req.session.user;
  
  if (!session) {
    let templateVars = {
      id: null,
      email:  null,
      message: "You must be logged in to edit a TinyURL"
    };
    return res.render("./error_page", templateVars)
  }
  
  const userID = session.id;
  const reqURL = req.params.shortURL;

  const shortURLObj = urlDatabase[reqURL];

  // tinyURL doesn't exist
  if(!shortURLObj){
    let templateVars = {
      id: userID,
      email:  session.email,
      message: "The current tinyURL doesn't exist."
    };
    
    return res.render("./error_page", templateVars);
  }

  const shortUserID = shortURLObj.userID;
  const matchingID = (userID === shortUserID);

  // tinyURL creator/session ID doesn't match
  if(!matchingID){

    let templateVars = {
      id: userID,
      email:  session.email,
      message: "The current tinyURL doesn't belong to this account."
    };
    
    return res.render("./error_page", templateVars);
  }
  

  let templateVars = {
    id: userID,
    email:  req.session.user.email,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  return res.render("./urls_show", templateVars);

});

// Post Route "/urls/:shortURL" posts updated shortURL
app.post('/urls/:shortURL', (req,res) => {

  if (checkCookieAuth(req, res, users)) {
    urlDatabase[req.params.id] = req.body.longURL;
  }
  
  return res.redirect('/urls/');
  
});

// Route "404" sends to ./error_page.js"
// This route shows a page not found if the route doesn't exist.
app.get("*", (req, res) => {
  
  const session = req.session.user;
  
  if (!session) {
    let templateVars = {
      id: null,
      email:  null,
      message: false
    };
    return res.render("./error_page", templateVars)
  }

  let templateVars = {
    id: req.session.user.id,
    email: req.session.user.email,
    message: null
  };
  return res.render("./error_page", templateVars);
});

// Starts the Server & Listens on PORT (console log on success)
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});