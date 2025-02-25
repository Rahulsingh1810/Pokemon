const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    battleDeck: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pokemon' }],
    battleHistory: [{
      opponentId: { type: Number },
      score: {
        user: { type: Number },
        opponent: { type: Number }
      },
      date: { type: Date, default: Date.now }
    }],
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
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