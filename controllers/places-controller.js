const uuid = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAdress = require('../util/location');

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

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  
  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId;
  });

  if (!place) {
    return next(new HttpError('Could not find a place for the provided id.', 404));
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter(p => {
    return p.creator === userId;
  });

  if (!places || places.length === 0) {
    return next(new HttpError('Could not find a place for the provided user id.', 404)
    );
  }

  res.json({ places });
};


const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputs passed, please check your data.', 422));
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAdress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = {
    id: uuid.v4(),
    title,
    description,
    location: coordinates,
    address,
    creator: 'u1'
  };

  DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)
  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const { title, description, address } = req.body;
  const placeId = req.params.pid

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid inputes passed, please check your data.', 422));
  }

  const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description
  updatedPlace.address = address

  DUMMY_PLACES[placeIndex] = updatePlace;
  res.status(200).json({ place: updatedPlace });
}

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid
  const isDeleted = !DUMMY_PLACES.find(p => p.id === placeId);
  if (isDeleted) {
    console.log('hello')
    return next(new HttpError('Could not find place for that id.', 404));
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId);
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
