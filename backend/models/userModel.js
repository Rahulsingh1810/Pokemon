// filepath: /Users/avaamo/Documents/GitHub/Pokemon/backend/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const pokemonSchema = require('./pokemonModel');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: false  
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
        type: String,
        default: ''
    },
    battleDeck: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pokemon'
    }]
}, {
    timestamps: true
});

// Hash the password before saving the user model
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

async function initializeBattleDeck() {
    try {
        await User.updateMany(
            { battleDeck: { $exists: false } },
            { $set: { battleDeck: [] } }
        );
        console.log('Battle decks initialized for all users.');
    } catch (error) {
        console.error('Error initializing battle decks:', error);
    }
}

initializeBattleDeck();