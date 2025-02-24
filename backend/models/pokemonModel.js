const mongoose = require('mongoose');

const pokemonSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    ThumbnailImage: {
        type: String,
        required: true
    },
    ThumbnailAltText: {
        type: String,
        required: true
    },
    type: {
        type: [String],
        required: true
    },
    weakness: {
        type: [String],
        required: true
    },
    height: {
        type: String,
        required: true
    },
    weight: {
        type: String,
        required: true
    },
    abilities: {
        type: [String],
        required: true
    }
});

module.exports = mongoose.model('Pokemon', pokemonSchema);
