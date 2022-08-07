const mongoose = require('mongoose');

const placesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
});

module.exports = mongoose.model('Place', placesSchema);
