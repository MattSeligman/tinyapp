
/**
 * This function assists in locating if the users Email exists.
 * @param {string} email Search for this email in the database
 * @param {object} database The database you wish to search.
 * @returns {object} Returns the `userObject` with the Hashed Password
 */
const getUserByEmail = function(email, database) {

  let databaseArray = Object.entries(database);

  // locate only an EMAIL that matches in the DATABASE
  let userFound = databaseArray.filter(element => email === element[1].email);

  if (!userFound[0]) {
    return false;
  }

  return userFound[0][1];

};

/**
 * Generates a Random String to be used for tinyURLs
 * * Clears any past generatedRandomStrings
 * * Creates random numbers between 1-36. (based on the `charToAdd` value)
 * * Modifies each random number to a string using Base36
 * * Adds each new string to the `generatedRandomString`
 */
const genRandomString = ()=>{
  let generatedRandomString = '';
  const randomNumbers = [];
  for (let charToAdd = 6; charToAdd > 0; charToAdd--) {
    randomNumbers.push(Math.ceil(Math.random() * 36));
  }
  randomNumbers.forEach(number=> generatedRandomString += number.toString(36));
  return generatedRandomString;
};

/**
 * The checkCookieAuth function returns a True or False for verifying the Cookie Authorization.
 * @param {*} req pulls in data with requests
 * @param {*} res sends data with response
 * @returns `True` or `False`
 */
const checkCookieAuth = (req, res, users)=>{
  const bcrypt = require('bcryptjs');

  const sessionExists = req.session.isPopulated;
  const sessionChanged = req.session.isChanged;
  
  if(!sessionExists || sessionChanged){
    return false; 
  }

  const session = req.session;
  const user = session.user;
  const userID = user.id;
  const email = user.email;
  
  const usersKeysArray = Object.keys(users);

  const authorized = usersKeysArray.map((user, index)=>{

      const userIDMatch = userID === user[1].id;
      let userIndex = null;
      
      if(userIDMatch){
        userIndex = index;
      }

      if(userIndex){
 
        const emailMatch = email === user[1].email;

        if(emailMatch){
          return true;
        }

      }

    return false;
  });

  return authorized;
};

module.exports = {
  getUserByEmail,
  genRandomString,
  checkCookieAuth
};