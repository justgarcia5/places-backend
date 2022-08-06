const uuid = require('uuid');
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

let DUMMY_USERS = [
  {
    id: 'u1',
    email: 'me@me.com',
    name: 'Justin Garcia',
    password: 'password',
    image: 'https://www.yosemite.com/wp-content/uploads/2016/04/Glacier-Point-Yosemite.jpg',
    places: 3
  },
  {
    id: 'u2',
    email: 'george@me.com',
    name: 'George Harrison',
    password: 'beatles',
    image: 'https://images.saymedia-content.com/.image/t_share/MTc0MTkyOTk3MzI2Mzk4OTcy/george-harrison-the-spiritual-beatle.png',
    places: 1
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS })
};

const createUser = (req, res, next) => {
  const { email, name, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const hasUser = DUMMY_USERS.find(u => u.email === email) 
  if (hasUser) {
    return next(new HttpError('Could not create user. User already exists.', 422));
  }

  const createdUser = {
    id: uuid.v4(),
    email,
    name,
    password
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ users: createdUser })
};

const loginUser = (req, res, next) => {
  const { email, password } = req.body;
  const idUser = DUMMY_USERS.find(user => email === user.email);

  if (!idUser || idUser.password !== password) {
    return next(new HttpError('Could not find identified user. Credentials seem to be wrong.', 401));
  }

  res.json({ message: "logged in." })
};

exports.getUsers = getUsers;
exports.createUser = createUser;
exports.loginUser = loginUser;
