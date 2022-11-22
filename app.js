const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const HttpError = require('./models/http-error');

const placesRouter = require('./routes/places-routes');
const usersRouter = require('./routes/users-routes');

const mongoPassword = process.env.MONGO_PASSWORD;

const app = express();
app.use(cors());

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/places', placesRouter);
app.use('/api/users', usersRouter);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.code || 500)
    .json({ message: error.message || 'An unkown error occured!' });
});

mongoose
  .connect(`mongodb+srv://justgarcia:${mongoPassword}@cluster0.c9ltudl.mongodb.net/?retryWrites=true&w=majority`)
  .then((res) => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err)
    console.log('Connection failed.')
  });
