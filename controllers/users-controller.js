const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password').exec()
  } catch (error) {
    return next(new HttpError('Could not get users, please try again later', 500));
  }

  res.status(200).json({ users: users.map(user => user.toObject({ getters: true }))})
};

const createUser = async (req, res, next) => {
  const { email, name, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('Something went wrong, please try again.', 500));
  }

  if (existingUser) {
    return next(new HttpError('User already exists, please log in', 500));
  }

  const createdUser = new User({
    name,
    email,
    image: "https://www.easytourchina.com/images/Photo/shanghai-tower/p520_d20191217171932.jpg",
    password,
    places: []
  });

  let result;
  try {
    result = await createdUser.save();
  } catch (err) {
    return next(new HttpError('Could not sign up. Please try again.', 500));
  }

  res.status(201).json({ users: result.toObject({ getters: true }) })
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('Login failed, please try again.', 500));
  }

  if (!existingUser || password !== existingUser.password) {
    return next(new HttpError('Invalid credentails, please try again.', 401));
  }

  res.json({ message: "logged in." })
};

exports.getUsers = getUsers;
exports.createUser = createUser;
exports.loginUser = loginUser;
