// const uuid = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAdress = require('../util/location');

const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let filteredPlaces;
  try {
    filteredPlaces = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find place.', 404));
  };

  if (!filteredPlaces) {
    return next(new HttpError('Could not find a place for the provided id.', 404));
  }

  res.status(200).json({ places: filteredPlaces.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let filteredPlaces;
  try {
    filteredPlaces = await Place.find({ creator: userId }).exec();
  } catch (error) {
    return next(new HttpError('Something went wrong, could not find place.', 404));
  };

  if (!filteredPlaces || filteredPlaces.length === 0) {
    return next(new HttpError('Could not find a place for the provided user id.', 404));
  }

  res.status(200).json({ places: filteredPlaces.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address, creator, image } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAdress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    image,
    creator
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError('Creating place failed. Please try again.', 500));
  }

  if (!user) {
    return next(new HttpError('Could not find user with provided id.', 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError('Could not create place. Please try again.', 500));
  }

  res.status(201).json({ places: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const { title, description, address, image } = req.body;
  const placeId = req.params.pid

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputes passed, please check your data.', 422));
  }

  let updatedPlace;
  try {
    updatedPlace = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not save place.', 500));
  }

  updatedPlace.title = title;
  updatedPlace.description = description
  updatedPlace.address = address
  updatedPlace.image = image

  let result;
  try {
    result = await updatedPlace.save();
  } catch (error) {
    return next(new HttpError('Something went wrong, could not save place.', 500));
  }

  res.json({ places: result.toObject({ getters: true }) });
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let deletedPlace;
  try {
    deletedPlace = await Place.findById(placeId).populate('creator');
  } catch (error) {
    return next(new HttpError('Something went wrong, could not delete place.', 500));
  }

  if (!deletedPlace) {
    return next(new HttpError('Could not find place for its id.', 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await deletedPlace.remove({ session: sess });
    deletedPlace.creator.places.pull(deletedPlace);
    await deletedPlace.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (error) {
    return next(new HttpError('Something went wrong, could not delete place.', 500));
  }

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
