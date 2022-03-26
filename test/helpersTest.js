const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('`user@example.com` should return `userRandomID`', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID)
  });
  it('`user2@example` should return `user2RandomID`', function() {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedUserID = "user2RandomID";
    assert.deepEqual(user.id, expectedUserID)
  });
  it('`notExisting` should not return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "notExisting";
    assert.notDeepEqual(user.id, expectedUserID)
  });
  it('`undefined` should not return a user with valid email', function() {
    const user = getUserByEmail(undefined, testUsers);
    const expectedUserID = undefined;
    assert.deepEqual(user.id, expectedUserID)
  });
});