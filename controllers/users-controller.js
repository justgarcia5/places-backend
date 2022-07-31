const uuid = require('uuid');

const HttpError = require('../models/http-error');

let DUMMY_USERS = [
  {
    id: 'u1',
    email: 'me@me.com',
    name: 'Justin Garcia',
    password: 'password'
  }
];

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS })
};

const createUser = (req, res, next) => {
  const { email, name, password } = req.body;
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
    return new HttpError('Could not find identified user. Credentials seem to be wrong.', 401);
  }

  res.json({ message: "logged in." })
};

exports.getUsers = getUsers;
exports.createUser = createUser;
exports.loginUser = loginUser;
