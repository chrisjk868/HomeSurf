/**
 * Name: Christopher Ku, Yanjie Niu
 * Date: 12-11-2021
 * Section CSE 154 AA
 *
 * This file is responsible for defining all of the endpoints for our Homesurf wesbsite
 * which is a reservation site for hotels in different parts of the world. It allows users
 * to search and filter for different hotels. Additionally it also lets users login, signup
 * and logout of our service.
 */
'use strict';
const express = require('express');
const multer = require('multer');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const app = express();
const PORT_NUMBER = 8000;
const TEN = 10;
let USER_ID = undefined;
let CHECK_IN = undefined;
let CHECK_OUT = undefined;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

/**
 * This endpoint is used for handling when users want to search for all available
 * hotels that are open for reservation in the database.
 */
app.get('/get-available-hotels', async (req, res) => {
  try {
    let query = 'SELECT * FROM Hotels WHERE reserved = 0 ';
    if (req.query['people']) {
      let size = req.query['people'];
      query += 'AND room_size = ' + size + ' ';
    }
    if (req.query['sort'] === 'ASC') {
      query += 'ORDER BY rate_per_day ASC';
    } else if (req.query['sort'] === 'DESC') {
      query += 'ORDER BY rate_per_day DESC';
    }
    let db = await getDbConnection();
    let openHotels = await db.all(query);
    let result = {"hotels": openHotels};
    await db.close();
    res.json(result);
  } catch (err) {
    res.type('text')
      .status('500')
      .send('An error occurred on the server. Try again later. ' + err);
  }
});

/**
 * This endpoint is used for handling searches that the user entered within the
 * search bar and filter of the website.
 */
app.get('/search', async (req, res) => {
  try {
    let query = searchHelper(req, res);
    if (req.query['people'] !== '') {
      let size = req.query['people'];
      query += 'AND room_size = ' + size + ' ';
    }
    if (req.query['sort'] === 'ASC') {
      query += 'ORDER BY rate_per_day ASC';
    } else if (req.query['sort'] === 'DESC') {
      query += 'ORDER BY rate_per_day DESC';
    }
    let db = await getDbConnection();
    let hotels = await db.all(query);
    if (hotels.length === 0) {
      await db.close();
      res.type('text')
        .status('200')
        .send('Hotel doesn\'t exist');
    } else {
      await db.close();
      res.json({"hotels": hotels});
    }
  } catch (err) {
    res.type('text')
      .status('500')
      .send('An error occurred on the server. Try again later. ' + err);
  }
});

/**
 * This endpoint is used for getting the information for a speicifc hotel as
 * requested by the user.
 */
app.get('/view-hotel', async (req, res) => {
  try {
    let db = await getDbConnection();
    let hotelId = req.query['hotel-id'];
    let query = 'SELECT * FROM Hotels WHERE hotel_id = ' + hotelId;
    let checkHotel = 'SELECT count(*) FROM Hotels WHERE hotel_id = ' + hotelId;
    let checkReservation = 'SELECT reserved FROM Hotels WHERE hotel_id = ' + hotelId;
    let hotelCount = await db.get(checkHotel);
    let reserved = await db.get(checkReservation);
    if (hotelCount['count(*)'] === 0) {
      res.type('text')
        .status('400')
        .send('Hotel doesn\'t exist');
    }
    if (reserved['reserved'] === 1) {
      res.type('text')
        .status('400')
        .send('Hotel is already reserved');
    }
    let hotel = await db.get(query);
    await db.close();
    res.json(hotel);
  } catch (err) {
    res.type('text')
      .status('500')
      .send('An error occurred on the server. Try again later. ' + err);
  }
});

/**
 * This endpoint is used for automatically updating the database whenever
 * our service is accessed.
 */
app.post('/', async (req, res) => {
  try {
    USER_ID = undefined;
    CHECK_IN = undefined;
    CHECK_OUT = undefined;
    let now = getSystemTime();
    let updateReserved = 'UPDATE Hotels ' +
                         'SET reserved = 0, checkin_time = NULL, checkout_time = NULL ' +
                         'WHERE datetime(\'' + now + '\') >= datetime(checkout_time)';
    let db = await getDbConnection();
    await db.exec(updateReserved);
    db.close();
    res.type('text')
      .status('200')
      .send('All up to date.');
  } catch (err) {
    res.type('text')
      .status('500')
      .send('An error occurred on the server. Try again later. ' + err);
  }
});

/**
 * This endpoint is used for handling when a new user wants to sign up to our
 * service. As a result it would add the user's information to the database.
 */
app.post('/signup', async (req, res) => {
  try {
    signupFieldRegexCheck(req, res);
    let db = await getDbConnection();
    let checkEmail = 'SELECT count(*) FROM Users WHERE email = \'' + req.body['email'] + '\'';
    let checkUsername = 'SELECT count(*) FROM Users WHERE username = \'' +
                        req.body['username'] + '\'';
    let emailExists = await db.get(checkEmail);
    let usernameExists = await db.get(checkUsername);
    signupFormCheck(req, res, emailExists, usernameExists, db);
    await db.close();
  } catch (err) {
    res.type('text')
      .status('500')
      .send('An error occurred on the server. Try again later. ' + err);
  }
});

/**
 * This endpoint is used for letting users that are registered to our database
 * login to their existing accounts.
 */
app.post('/login', async (req, res) => {
  try {
    if (!req.body['username'] || !req.body['password']) {
      res.type('text')
        .status('400')
        .send('Please fill out all fields');
    }
    let username = req.body['username'];
    let password = req.body['password'];
    let query = 'SELECT * FROM Users ' +
                'WHERE username = \'' + username + '\' ' +
                'AND password = \'' + password + '\';';
    let db = await getDbConnection();
    let user = await db.all(query);
    loginHelper(res, user);
    await db.close();
  } catch (err) {
    res.type('text')
      .status('500')
      .send('An error occurred on the server. Try again later. ' + err);
  }
});

/**
 * This endpoint is used for handling request from users that would like to reserve
 * a specific hotel that exists in the current database.
 */
app.post('/reserve', async (req, res) => {
  try {
    let hotelId = req.body['hotel-id'];
    let db = await getDbConnection();
    let checkHotel = 'SELECT count(*) FROM Hotels WHERE hotel_id = ' + hotelId;
    let checkReservation = 'SELECT reserved FROM Hotels WHERE hotel_id = ' + hotelId;
    let getCount = await db.get(checkHotel);
    let getReserved = await db.get(checkReservation);
    if (getCount['count(*)'] === 0) {
      res.type('text')
        .status('400')
        .send('Hotel doesn\'t exist');
    }
    if (getReserved['reserved'] === 1) {
      res.type('text')
        .status('400')
        .send('Hotel is already reserved');
    }
    await reserveHelper(res, db, hotelId);
    await db.close();
  } catch (err) {
    res.type('text')
      .status('500')
      .send('An error occurred on the server. Try again later. ' + err);
  }
});

/**
 * This endpoint allows users to view different hotels they have successfully
 * reserved before.
 */
app.post('/previous-reservations', async (req, res) => {
  try {
    let prevHotels = [];
    let getIds = 'SELECT * FROM Reservations WHERE user_id = ' + USER_ID;
    let db = await getDbConnection();
    let prevIds = await db.all(getIds);
    for (let i = 0; i < prevIds.length; i++) {
      let getHotel = 'SELECT * FROM Hotels WHERE hotel_id = ' + prevIds[i]['hotel_id'];
      let hotel = await db.get(getHotel);
      hotel['reservation_id'] = prevIds[i]['reservation_id'];
      prevHotels.push(hotel);
    }
    await db.close();
    res.json({"hotels": prevHotels});
  } catch (err) {
    res.type('text')
      .status('500')
      .send('An error occurred on the server. Try again later. ' + err);
  }
});

/**
 * This endpoint allows users to logout of their current accounts to leave
 * our website
 */
app.post('/logout', (req, res) => {
  try {
    USER_ID = undefined;
    CHECK_IN = undefined;
    CHECK_OUT = undefined;
    res.type('text')
      .status('200')
      .send('You have logged out.');
  } catch (err) {
    res.type('text')
      .status('500')
      .send('An error occurred on the server. Try again later. ' + err);
  }
});

/**
 * This function helps to handle errors and piece together a query for hotels when
 * a user uses the search and filter on the website.
 * @param {object} req - A request object
 * @param {object} res  - A response object
 * @returns {string} - A string for querying the database
 */
function searchHelper(req, res) {
  let checkinDate = Date.parse(req.query['checkin']);
  let checkoutDate = Date.parse(req.query['checkout']);
  if (!req.query['location'] || !req.query['checkin'] || !req.query['checkout']) {
    res.type('text')
      .type('400')
      .send('Please fill in all fields');
  }
  if (checkinDate >= checkoutDate) {
    res.type('text')
      .type('400')
      .send('Please enter valid check in and check out dates.');
  }
  let location = req.query['location'];
  CHECK_IN = req.query['checkin'];
  CHECK_OUT = req.query['checkout'];
  let query = 'SELECT hotel_id, name, location, amenities, room_size, rate_per_day, images, ' +
              'INSTR(location, \'' + location + '\') AS match ' +
              'FROM Hotels ' +
              'WHERE reserved = 0 ' +
              'AND (match > 0)' +
              'AND (checkout_time IS NULL OR datetime(\'' + CHECK_IN +
              '\') > datetime(checkout_time)) ';
  return query;
}

/**
 * This function is used for helping check fields entered within the registration form
 * of the user, in order to validate the entered values fits requirements.
 * @param {object} req - A request object
 * @param {object} res - A response object
 * @param {object} emailExists - An object that contains information for the email
 *                               of the user
 * @param {object} usernameExists - An object that contains information for the username
 *                                  of the user
 * @param {object} db - An object representing the database
 */
async function signupFormCheck(req, res, emailExists, usernameExists, db) {
  if (req.body['password'] !== req.body['password-confirm']) {
    res.type('text')
      .status('400')
      .send('Re-entered password must match');
  } else if (emailExists['count(*)'] > 0 || usernameExists['count(*)'] > 0) {
    res.type('text')
      .status('400')
      .send('Email or username already exists');
  } else {
    let firstName = req.body['first-name'];
    let lastName = req.body['last-name'];
    let email = req.body['email'];
    let username = req.body['username'];
    let password = req.body['password'];
    let add = 'INSERT INTO Users (first_name, last_name, username, password, email) VALUES ' +
              '(?, ?, ?, ?, ?)';
    await db.run(add, [firstName, lastName, username, password, email]);
    res.type('text')
      .send('Thanks for joining us! Please login to your account to make reservations.');
  }
}

/**
 * This function is used for helping check any possible regex errors in the registration
 * form submitted by the user.
 * @param {object} req - A request object
 * @param {object} res - A response object
 */
function signupFieldRegexCheck(req, res) {
  if (!req.body['first-name'] ||
        !req.body['last-name'] ||
        !req.body['username'] ||
        !req.body['password'] ||
        !req.body['email']) {
    res.type('text')
      .status('400')
      .send('Please fill out all fields');
  } else {
    let firstnamePattern = new RegExp(/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/, 'i');
    let lastnamePattern = new RegExp(/^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/, 'i');
    let emailPattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
    let usernamePattern = new RegExp(/^[a-zA-Z0-9]{5,10}$/, 'i');
    let passwordPattern = new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/);
    if (!firstnamePattern.test(req.body['first-name']) ||
        !lastnamePattern.test(req.body['last-name']) ||
        !usernamePattern.test(req.body['username']) ||
        !emailPattern.test(req.body['email']) ||
        !passwordPattern.test(req.body['password'])) {
      res.type('text')
        .status('400')
        .send('Entered fields don\'t match requirements');
    }
  }
}

/**
 * This function is used for helping check errors that may occur on login
 * @param {object} res - A response object
 * @param {object} user - An object with user information
 */
function loginHelper(res, user) {
  if (user.length === 1) {
    USER_ID = user[0]['user_id'];
    res.type('text')
      .status('200')
      .send('Hi ' + user[0]['first_name'] + '! Please make a reservation.');
  } else {
    res.type('text')
      .status('400')
      .send('Username or Password incorrect');
  }
}

/**
 * This function is used for helping check erros that may occur on reservation
 * @param {object} res - A response object
 * @param {object} db - An object representing the database
 * @param {number} hotelId - A number representing an existing hotel in the database
 */
async function reserveHelper(res, db, hotelId) {
  if (CHECK_IN === undefined || CHECK_OUT === undefined) {
    res.type('text')
      .status('400')
      .send('Please enter check in and check out dates');
  } else {
    let queryInsert = 'INSERT INTO Reservations (user_id, hotel_id, checkin_time, checkout_time) ' +
                    'VALUES (?, ?, ?, ?)';
    let queryUpdate = 'UPDATE Hotels ' +
                      'SET checkin_time = \'' + CHECK_IN + '\', ' +
                      'checkout_time = \'' + CHECK_OUT + '\', ' +
                      'reserved = 1 ' +
                      'WHERE hotel_id = ' + hotelId;
    let getHotel = 'SELECT name FROM Hotels WHERE hotel_id = ' + hotelId;
    let hotel = await db.get(getHotel);
    let reserveInsert = await db.run(queryInsert, [USER_ID, hotelId, CHECK_IN, CHECK_OUT]);
    await db.exec(queryUpdate);
    res.type('text')
      .status('200')
      .send('Your reservation for ' + hotel['name'] + ' from ' + CHECK_IN +
            ' to ' + CHECK_OUT + ' has been confirmed! ' +
            'Your reservation id is: ' + reserveInsert['lastID']);
  }
}

/**
 * This function is used for getting the current system time.
 * @returns {string} - A string in YYYY-MM-DD HH:MM:SS format represent the current time.
 */
function getSystemTime() {
  let today = new Date();
  let timeArr = [today.getMonth() + 1,
    today.getDate(),
    today.getHours(),
    today.getMinutes(),
    today.getSeconds()];
  for (let i = 0; i < timeArr.length; i++) {
    if (timeArr[i] < TEN) {
      timeArr[i] = '0' + timeArr[i];
    }
  }
  let date = today.getFullYear() + '-' + (timeArr[0]) + '-' + timeArr[1];
  let time = timeArr[2] + ":" + timeArr[3] + ":" + timeArr[4];
  let dateTime = date + ' ' + time;
  return dateTime;
}

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {object} - The database object for the connection.
 */
async function getDbConnection() {
  const db = await sqlite.open({
    filename: 'homesurf.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || PORT_NUMBER;
app.listen(PORT);