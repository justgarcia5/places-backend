// const uuid = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAdress = require('../util/location');

const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Empire State Building',
    imageUrl: 'https://image.kkday.com/v2/image/get/w_1900%2Cc_fit/s1.kkday.com/product_20490/20220217065504_ERdIf/jpg',
    description: 'One of the most famous sky scrapers in the world!',
    location: {
      lat: 40.7484474,
      lng: -73.9871516
    },
    address: '20 W 34th St, New York, NY 10001',
    creator: 'u1'
  },
  {
    id: 'p2',
    title: 'Machu Pichu',
    imageUrl: 'https://www.perurail.com/wp-content/uploads/2020/11/Machu-Picchu-la-Ciudadela-Inca.jpg',
    description: 'Inca magical temple in the clouds.',
    location: {
      lat: -13.1631,
      lng: -72.5450
    },
    address: '08680, Peru',
    creator: 'u2'
  },
  {
    id: 'p3',
    title: 'Shanghai Tower',
    imageUrl: 'https://www.easytourchina.com/images/Photo/shanghai-tower/p520_d20191217171932.jpg',
    description: 'One of the tallest sky scrapers in the world!',
    location: {
      lat: 31.233518,
      lng: 121.505618
    },
    address: 'China, Shanghai, Pudong, 陆家嘴 Lujiazui, 银城中路501号 邮政编码: 200120',
    creator: 'u1'
  }
];

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

  res.json({ places: filteredPlaces.toObject({ getters: true }) });
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

  res.status(201).json({ places: filteredPlaces.map(place => place.toObject({ getters: true })) });
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
    image,
    location: coordinates,
    address,
    creator
  });

  const result = await createdPlace.save();

  try {
    await createdPlace.save();
  } catch (err) {
    return next(new HttpError('Could not create place. Please try again.', 500));

  }

  res.status(201).json({ places: result });
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
    deletedPlace = await Place.findById(placeId);
  } catch (error) {
    return next(new HttpError('Something went wrong, could not delete place.', 500));
  }

  try {
    await deletedPlace.remove();
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
