const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String
    },
    battleDeck: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Pokemon',
        default: [] // Initialize as an empty array
    }
    // other fields...
});

module.exports = mongoose.model('User', userSchema);